<?php
$files=Array("src/main.css","src/appframework.css","src/lists.css","src/forms.css","src/buttons.css","src/badges.css","src/grid.css","../plugins/css/af.actionsheet.css","../plugins/css/af.popup.css","../plugins/css/af.scroller.css","../plugins/css/af.selectbox.css");


$fp=fopen("af.ui.base.css","w+");
$data="";
foreach($files as $fname){
	$data.="/*$fname*/\n\r";
	//echo $fname."\n\r";
    $data.=file_get_contents($fname)."\n\r\n\r";
}
//$data=preg_replace('#/\*.+?\*/#s',"",$data);
fputs($fp,$data);
fclose($fp);
?>
