
var All = require("../lib/All.js")
  , Hash = All.Hash
  , HashMap = All.HashMap
  , LinkedHashMap = All.LinkedHashMap
  ;


function printLn() { console.log.apply(console, arguments); }
function seperatorLine() { printLn("-".repeat(79)); }

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

var m = new LinkedHashMap();
m.put("first",1);
m.put("second",2);
m.put("third",3);
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

m.insertAfter("second","new",2134);
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

m.reorder("first", "new");
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

m.remove("new");
console.log(m.length, m.hash(), m.vs);
m.iterateKV(function(kv){console.log(kv.k, kv.v);});
