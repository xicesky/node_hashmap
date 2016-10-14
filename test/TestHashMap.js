
var expect = require("chai").expect
  , Hash = require("../lib/Hash.js")
  , HashMap = require("../lib/HashMap.js")
  ;

describe("HashMap", function() {
    it("should be hashable", function() {
        var m = new HashMap();
        expect(m).to.be.an('object');
        var h = Hash(m);
        expect(h).to.be.a('number');
    });
    it("should change its hash when adding elements", function() {
        var m = new HashMap();
        var h1 = Hash(m);
        m.put("a",1);
        var h2 = Hash(m);
        expect(h1).to.not.equal(h2);
    });
    it("should give the same hash for the same elements", function() {
        var m = new HashMap();
        m.put("a",1);
        m.put("b",2);
        var h1 = Hash(m);

        m = new HashMap();
        m.put("b",2);
        m.put("a",1);
        var h2 = Hash(m);

        expect(h1).to.equal(h2);
    });
});
