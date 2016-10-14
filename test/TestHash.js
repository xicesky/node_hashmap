var expect = require("chai").expect
  , Hash = require("../lib/Hash.js")
  ;

// describe("Hash", function() {
//    describe(".hash()", function() {
//        it("should work the same as Hash()", function(){
           
//        });
//    });
// });

describe("Hash()", function() {
    it("should just hash things when passed an argument", function() {
        expect(Hash(1)).to.equal(Hash.hash(1));
    });
    it("should work as a constructor without arguments", function() {
        var hh = new Hash();
        expect(hh).to.be.a('function');
        expect(hh(1)).to.equal(Hash.hash(1));
    });
});
