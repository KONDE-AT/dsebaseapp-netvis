xquery version "3.1";

import module namespace app="http://www.digital-archiv.at/ns/templates" at "../modules/app.xql";
import module namespace netvis="https://digital-archiv/ns/netvis" at "netvis.xqm";

declare namespace tei = "http://www.tei-c.org/ns/1.0";
declare namespace util = "http://exist-db.org/xquery/util";
declare namespace output = "http://www.w3.org/2010/xslt-xquery-serialization";

declare option output:method "json";
declare option output:media-type "application/json";

let $netivs_conf := $netvis:config
let $types := $netvis:config//NodeTypes
let $graph_doc := doc($app:data||'/cache/graph_cache.xml')
let $nodes := $graph_doc//nodes
let $edges : = $graph_doc//edges
return
  <graph>
    {for $x in $nodes return $x}
    {for $x in $edges return $x}
    <types>
        {for $x in $types/* return <nodes>{for $y in $x/* return $y}</nodes>}
    </types>
  </graph>
