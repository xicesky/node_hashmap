
var expect = require("chai").expect
  , LinkedHashMap = require("../lib/LinkedHashMap.js")
  ;

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
