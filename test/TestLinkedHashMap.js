
var expect = require("chai").expect
  , Hash = require("../lib/Hash.js")
  , LinkedHashMap = require("../lib/LinkedHashMap.js")
  ;

describe("LinkedHashMap", function() {
    it("should be hashable", function() {
        var m = new LinkedHashMap();
        expect(m).to.be.an('object');
        var h = Hash(m);
        expect(h).to.be.a('number');
    });
    it("should change its hash when adding elements", function() {
        var m = new LinkedHashMap();
        var h1 = Hash(m);
        m.put("a",1);
        var h2 = Hash(m);
        expect(h1).to.not.equal(h2);
    });
    it("should give a different hash for the same elements in different order", function() {
        var m = new LinkedHashMap();
        m.put("a",1);
        m.put("b",2);
        var h1 = Hash(m);

        m = new LinkedHashMap();
        m.put("b",2);
        m.put("a",1);
        var h2 = Hash(m);

        expect(h1).to.not.equal(h2);
    });
    it("should give the same hash after adding/reordering/removing entries", function() {
        var m = new LinkedHashMap();
        m.put("first",1);
        m.put("second",2);
        m.put("third",3);
        var h1 = Hash(m);

        m.insertAfter("second", "new", 2134);
        var hx1 = Hash(m);

        m.reorder("first", "new");
        var hx2 = Hash(m);

        m.remove("new");
        var h2 = Hash(m);

        expect(h1).to.not.equal(hx1);
        expect(hx1).to.not.equal(hx2);
        expect(hx2).to.not.equal(h2);
        expect(h2).to.equal(h1);
    });
});

/*
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
