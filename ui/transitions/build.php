<?php
$path="";
$data="";
foreach (glob($path."*.js") as $baseName) {
    if($baseName=="all.js")
       continue;
    $data.=file_get_contents($baseName)."\n";
}

$fp=fopen("all.js","w+");
fputs($fp,$data);
fclose($fp);
?>