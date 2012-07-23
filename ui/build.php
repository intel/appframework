<?php
$files=Array("../plugins/jq.css3animate.js","../plugins/jq.scroller.js","../plugins/jq.popup.js","../plugins/jq.actionsheet.js","../plugins/jq.passwordBox.js","../plugins/jq.selectBox.js","../plugins/jq.touchEvents.js","../plugins/jq.touchLayer.js","./src/jq.ui.js","transitions/all.js");


$fp=fopen("jq.ui.js","w+");
$data="";
foreach($files as $fname){
    $data.=file_get_contents($fname)."\n";
}
//$data=preg_replace('#/\*.+?\*/#s',"",$data);
fputs($fp,$data);
fclose($fp);
?>