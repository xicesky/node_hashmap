
var All = require("../lib/All.js")
  , Hash = All.Hash
  , HashMap = All.HashMap
  , LinkedHashMap = All.LinkedHashMap
  ;


function printLn() { console.log.apply(console, arguments); }
function seperatorLine() { printLn("-".repeat(79)); }
function showMap(m) {
    printLn(m.length, Hash(m), m.vs);
    m.iterateKV(function(kv){printLn(kv.k, kv.v);});
}

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

var m = new LinkedHashMap();
m.put("first",1);
m.put("second",2);
m.put("third",3);
showMap(m);

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

m.insertAfter("second","new",2134);
showMap(m);

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

m.reorder("first", "new");
showMap(m);

////////////////////////////////////////////////////////////////////////////////////////////////////
seperatorLine();

m.remove("new");
showMap(m);
