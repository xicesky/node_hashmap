"use strict";

/***************************************************************************************************
    Hashes, Hashmap, Linked Hashmap
    Author: Markus Dangl <sky@q1cc.net>
    License: MIT, see LICENSE file!
****************************************************************************************************
*/

// exports.Hash = Hash;
// exports.hash = Hash.hash;
module.exports = Hash;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Utils

var _slice = Array.prototype.slice;
function i32(x) { return x & x; }
function hex32(x) { x = x & x; x = (x < 0 ? 0x100000000 + x : x).toString(16); return ('00000000' + x).slice(-8); }
function rndh32() { return hex32(Math.floor(Math.random() * 0x100000000)); }
function clsType(o) { return Object.prototype.toString.call(o).slice(8,-1).toLowerCase(); }
function slice(a) { return _slice.apply(a, _slice.call(arguments, 1)); }
function newCall(constr) { return new (Function.prototype.bind.apply(constr, arguments))(); }
function newApply(constr, args) { return new (Function.prototype.bind.apply(constr, [null].concat(slice(args))))(); }

////////////////////////////////////////////////////////////////////////////////////////////////////
// Hashing

/*
    A hash consists of:
        - A function turning basic types into hashes
        - A function combining multiple hashes into a single one
            (for structural types)
*/

function Hash(o) {
    if (typeof o == 'undefined') {
        // Used as a constructor
        var hfn = function Hash() { return this.hash.apply(this, arguments); }
        hfn.__proto__ = this;
        return hfn.bind(hfn);
    } else {
        return Hash.hash(o);
    }
}

Hash.prototype = function Hash() { return this.hash.apply(this, arguments); }

Hash.combine = function(h, h1) {
    return h1 + (h1 << 6) + (h1 << 16) - h;
}

Hash.combineCommute = function(h1, h2) {
    // Commutes: combineCommute(x,y) == combineCommute(y,x)
    return h1 + h2 + 1;
}

Hash.hashUndefined  = function(o) { return i32(0xb905b39f); }
Hash.hashNull       = function(o) { return i32(0x700a4f75); }
Hash.hashBool       = function(o) { return o?i32(0x29015bee):i32(0xe8dffb7f); }
Hash.hashNumber     = function(o) { return i32(o); }    // FIXME
Hash.hashFunction   = function(o) { return this.hashObject(o); }
Hash.hashCharAt     = function(o, i) { return o.charCodeAt(i); }

// optimized specialized versions
Hash.hashString     = function(o) {
    var c, h = 0;
    for (var i = 0; i < o.length; i++) {
        c = o.charCodeAt(i);
        h = c + (c << 6) + (c << 16) - h;
    }
    return h;
}

Hash.hashMap        = function(o) {
    // FIXME: The order of keys is undefined by ECMA http://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf
    var h = 0x56c56a4f;
    for (var k in o) {
        h = this.combine(h, this.hash(k));
        h = this.combine(h, this.hash(o[k]));
    }
    return h;
}

Hash.hashObject = function hashObject(o) {
    var t = typeof o._hash;
    if (t == 'function') return o._hash(o, this);
    if (t == 'number') return o._hash;
    if (o.hash) return o.hash(this);
    t = clsType(o);
    switch (t) {
        case 'array':       return this.hashArray(o);
        // case 'regexp':
        // case 'date':
        default:            return this.hashMap(o);        
    }
}

Hash.hash = function hash(o) {
    switch (typeof o) {
        case 'undefined':   return this.hashUndefined(o);
        case 'boolean':     return this.hashBool(o);
        case 'number':      return this.hashNumber(o);
        case 'string':      return this.hashString(o);
        case 'function':    return this.hashFunction(o);
        case 'object':
            if (o === null) return this.hashNull(o);
            return this.hashObject(o);
    }
}

Hash.quickHash = function quickHash() {
    // Helper function: Hash and combine in one
    var h = 0, c = this.combine;
    for (var i = 0; i < arguments.length; i++) {
        var o = arguments[i];
        switch (typeof o) {
            case 'boolean': c = o ? this.combineCommute : this.combine; break;
            case 'number': h = c.call(this, h, o); break;
            case 'string':
            case 'object': h = c.call(this, h, this.hash(o)); break;
            default: throw ("Quickhash can't handle type " + t); break;
        }
    }
    return h;
}

for (var k in Hash)
    Hash.prototype[k] = Hash[k];

// FIXME: Tests
//console.log(Hash(1)); // == Hash.hash(1)

/*
var hh = new Hash();
console.log(hh(1)); // == Hash.hash(1)
/**/


////////////////////////////////////////////////////////////////////////////////////////////////////
// HashMap

// Keys in a Hashmap require an equality function, this impl uses "=="

class HashMap {
    constructor() {
        this.hashFn = Hash;
        this.length = 0;
        this.vs = {};
    }

    /* protected */
    _find(k, h) {
        var l = this.vs[h];
        if (!l) return -2;                      // -2: Hash absent
        for (var i = 0; i < l.length; i++)      // Linear scan
            if (l[i].k == k)                    // <- Equality test
                return i;
        return -1;                              // -1: Key absent
    }

    /* protected */
    _newEntry() {
        this.length++;
        return newApply(this.Entry, arguments);
    }

    /* protected */
    _removeEntry(entry) {
        if (this.length <= 0)
            throw "Assertion failed: _removeEntry(): (length > 0)";
        this.length--;
    }

    remove(k) {
        var h = this.hashFn(k)
          , i = this._find(k, h)
          ;
        if (i < 0) {
            // Non-existant key
            return null;
        }
        var l = this.vs[h]
          , e = l.splice(i, 1)[0]
          ;
        if (l.length == 0)
            delete this.vs[h];  // Remove empty lists for performace
        this._removeEntry(e);
        return e;
    }

    entryKV(k) {
        var h = this.hashFn(k)
          , i = this._find(k, h)
          , o
          ;
        switch (i) {
            case -2:
                o = this._newEntry.apply(this, arguments);
                this.vs[h] = [o];
                return o;
            case -1:
                o = this._newEntry.apply(this, arguments);
                this.vs[h].push(o);
                return o;
            default:
                return this.vs[h][i];
        }
    }

    iterateKV(f) {
        for (var h in this.vs) {
            var l = this.vs[h];
            for (var i = 0; i < l.length; i++)
                f(l[i]);
        }
    }

    put(k, v) {
        var kv = this.entryKV(k);
        kv.v = v;
        return this;
    }

    _resolveEntry(k, err) {
        var h = this.hashFn(k)
          , i = this._find(k, h)
          ;
        if (k instanceof this.Entry)
            return k;
        if (i < 0)
            if (!err)
                throw "Key not found: " + toString(prev);
            else
                return err();
        return this.vs[h][i];
    }

    getEntry(k) {
        return this._resolveEntry(k, function(){ return null; });
    }

    get(k) {
        var e = this.getEntry(k);
        return (typeof e == 'undefined') ? undefined : e.v;
    }

    fmap(f) {
        this.iterateKV(function(o) {
            o.v = f(o.v, o);
        });
    }

    _hashCombine(hashFn, h, entry) {
        return hashFn.combineCommute(h, hashFn.hash(entry));
    }

    hash(hashFn) {
        if (typeof hashFn == 'undefined')
            hashFn = this.hashFn;
        var h = this.constructor._baseHash
          , hmap = this;
        this.iterateKV(function(entry) { h = hmap._hashCombine(hashFn, h, entry); });
        return h;
    }
}

HashMap._baseHash = i32(0xa0c61a99);

HashMap.prototype.Entry = class {
    constructor(k, v) {
        this.k = k;
        this.v = v;
    }
    
    toString() {
        return "(" + k.toString() + "=" + v.toString() + ")";
    }

    hash(hashFn) {
        return hashFn.quickHash(this.constructor._baseHash, hashFn(this.k), hashFn(this.v));
    }
}

HashMap.prototype.Entry._baseHash = i32(0xe18e6b11);

Hash.HashMap = HashMap;

// FIXME: Tests
/*
var m = new HashMap();
console.log(Hash.hash(m));
m.put("a",2);
console.log(Hash.hash(m));
m.put(Hash.hash("a"),3);
/**/

/*
console.log("-------------------------------------------------------------------------------");
console.log(m.vs);
console.log(Hash.hash(m));

console.log("-------------------------------------------------------------------------------");
m = new HashMap();
m.put(Hash.hash("a"),3);
m.put("a",2);
console.log(m.vs);
console.log(Hash.hash(m));
/**/

/*
console.log("-------------------------------------------------------------------------------");
var m = new HashMap();
m.put("a",2);
m.put("b",3);
console.log(m.vs);
m.fmap(function(x){return x+1;});
console.log(m.vs);
/**/

////////////////////////////////////////////////////////////////////////////////////////////////////
// LinkedHashMap

class LinkedHashMap extends HashMap {
    constructor() {
        super();
        this.filler = new this.Entry();
        this.filler.prev = this.filler;
        this.filler.next = this.filler;
        // this.first = null;
        // this.last = null;
    }

    get first() {
        var o = this.filler.next;
        return (o === this.filler) ? null : o;
    }

    get last() {
        var o = this.filler.prev;
        return (o === this.filler) ? null : o;
    }

    _insertLL(prev, e) {
        var next = prev.next;
        e.prev = prev;
        e.next = next;
        prev.next = e;
        next.prev = e;
    }

    _removeLL(e) {
        var prev = e.prev
          , next = e.next;
        prev.next = next;
        next.prev = prev;
    }

    /* override */
    _newEntry(k, v, prev) {
        var e = super._newEntry.apply(this, arguments);
        if (typeof prev == 'undefined')
            prev = this.filler.prev;
        this._insertLL(prev, e);
        return e;
    }

    /* override */
    _removeEntry(entry) {
        super._removeEntry.apply(this, arguments);
        this._removeLL(entry);
    }

    iterateKV(f) {
        var e = this.filler.next;
        while (e !== this.filler) {
            f(e);
            e = e.next;
        }
    }

    reorder(prev, k) {
        if (typeof prev === 'undefined')
            prev = this.filler;
        else
            prev = this._resolveEntry(prev);

        var kv = this.entryKV(k, undefined, prev);
        // If the entry already existed, reorder it
        if (kv.prev !== prev) {
            this._removeLL(kv);
            this._insertLL(prev, kv);
        }
        return kv;
    }

    insertAfter(prev, k, v) {
        var entry = this.reorder(prev, k);
        entry.v = v;
        return this;
    }

    /* override */
    _hashCombine(hashFn, h, entry) {
        return hashFn.combine(h, hashFn.hash(entry));
    }
}

LinkedHashMap._baseHash = i32(0x4db6d149);

LinkedHashMap.prototype.Entry = class extends HashMap.prototype.Entry {
    constructor(k, v, prev, next) {
        super(k, v);
        this.prev = prev ? prev : null;
        this.next = next ? next : null;
    }
}

LinkedHashMap.prototype.Entry._baseHash = i32(0x9e945da2);

// FIXME: Tests
/*
var m = new LinkedHashMap();
console.log(Hash.hash(m));
m.put("a",2);
console.log(Hash.hash(m));
m.put(Hash.hash("a"),3);
/**/

/*
console.log("-------------------------------------------------------------------------------");
console.log(m.vs);
console.log(Hash.hash(m));

console.log("-------------------------------------------------------------------------------");
m = new LinkedHashMap();
m.put(Hash.hash("a"),3);
m.put("a",2);
console.log(m.vs);
console.log(Hash.hash(m));
/**/

/*
console.log("-------------------------------------------------------------------------------");
var m = new LinkedHashMap();
m.put("first",1);
m.put("second",2);
m.put("third",3);
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});
/**/

/*
console.log("-------------------------------------------------------------------------------");
m.insertAfter("second","new",2134);
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});
console.log("-------------------------------------------------------------------------------");
m.reorder("first", "new");
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});
console.log("-------------------------------------------------------------------------------");
m.remove("new");
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});
/**/
