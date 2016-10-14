"use strict";

/*jshint -W027*/

/***************************************************************************************************
    Hashing
    Author: Markus Dangl <sky@q1cc.net>
    License: MIT, see LICENSE file!
***************************************************************************************************/

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
        var hfn = function Hash() { return this.hash.apply(this, arguments); };
        Object.setPrototypeOf(hfn, this);
        return hfn.bind(hfn);
    } else {
        return Hash.hash(o);
    }
}

Hash.prototype = function Hash() { return this.hash.apply(this, arguments); };

Hash.combine = function(h, h1) {
    return h1 + (h1 << 6) + (h1 << 16) - h;
};

Hash.combineCommute = function(h1, h2) {
    // Commutes: combineCommute(x,y) == combineCommute(y,x)
    return h1 + h2 + 1;
};

Hash.hashUndefined  = function(o) { return i32(0xb905b39f); };
Hash.hashNull       = function(o) { return i32(0x700a4f75); };
Hash.hashBool       = function(o) { return o?i32(0x29015bee):i32(0xe8dffb7f); };
Hash.hashNumber     = function(o) { return i32(o); };   // FIXME
Hash.hashFunction   = function(o) { return this.hashObject(o); };
Hash.hashCharAt     = function(o, i) { return o.charCodeAt(i); };

// optimized specialized versions
Hash.hashString     = function(o) {
    var c, h = 0;
    for (var i = 0; i < o.length; i++) {
        c = o.charCodeAt(i);
        h = c + (c << 6) + (c << 16) - h;
    }
    return h;
};

Hash.hashMap        = function(o) {
    // FIXME: The order of keys is undefined by ECMA http://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf
    var h = 0x56c56a4f;
    for (var k in o) {
        h = this.combine(h, this.hash(k));
        h = this.combine(h, this.hash(o[k]));
    }
    return h;
};

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
};

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
};

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
            default: throw ("Quickhash can't handle type " + typeof o); break;
        }
    }
    return h;
};

for (var k in Hash)
    Hash.prototype[k] = Hash[k];

module.exports = Hash;
