"use strict";

/*jshint -W027*/

/***************************************************************************************************
    Hashmap
    Author: Markus Dangl <sky@q1cc.net>
    License: MIT, see LICENSE file!
***************************************************************************************************/

var Hash = require('./Hash.js')
  ;

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
        if (l.length === 0)
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
                throw "Key not found: " + k;
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
        return "(" + this.k.toString() + "=" + this.v.toString() + ")";
    }

    hash(hashFn) {
        return hashFn.quickHash(this.constructor._baseHash, hashFn(this.k), hashFn(this.v));
    }
};

HashMap.prototype.Entry._baseHash = i32(0xe18e6b11);

Hash.HashMap = HashMap;

module.exports = HashMap;
