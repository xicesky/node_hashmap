"use strict";

/*jshint -W027*/

/***************************************************************************************************
    Linked Hashmap
    Author: Markus Dangl <sky@q1cc.net>
    License: MIT, see LICENSE file!
***************************************************************************************************/

var Hash = require('./Hash.js')
  , HashMap = require('./HashMap.js')
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
};

LinkedHashMap.prototype.Entry._baseHash = i32(0x9e945da2);

module.exports = LinkedHashMap;
