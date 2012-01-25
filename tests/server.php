<?php

if(count($_GET)>0){

if(isset($_GET['json']))
{
   $tmp=Array();
   $tmp['foo']="bar";
   echo json_encode($tmp);
}
else if(isset($_GET['jsonp']))
{
   echo $_GET['jsonp']."('foo');";
}
else
   echo $_GET['data'];
}
else if(count($_POST)>0)
{
  echo $_POST['data'];
}
