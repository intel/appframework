<?php
require_once("detail/markdown_extended.php");
$files=array();
$fileLen=count($argv);

function genPermaLink($segment){
  if(strpos($segment,"(")===false)
    return $segment;
  else return substr($segment, 0,(strpos($segment,"(")));
}
for($i=1;$i<$fileLen;$i++)
{
  $tmp=$argv[$i];
  $files[str_replace(".json","",$tmp)]=$tmp;
}

$modules=Array();
foreach($files as $title=>$path)
{
    $tab=$title;
    $data=json_decode(file_get_contents($path));

    foreach($data as $currFunc)
    {
       if((property_exists($currFunc,"isPrivate")&&$currFunc->isPrivate)||$currFunc->ignore)
          continue;

       $tags=$currFunc->tags;
       $return="";
       $params=Array();
       $title="";
      //echo "<pre>"; print_r($currFunc);echo "</pre>";
       foreach($tags as $tag)
       {
          switch($tag->type)
          {
             case "title":$title=$tag->string;break;
             case "param":$params[$tag->name]=$tag->types;break;
             case "return":$return['desc']=$tag->description;$return['types']=$tag->types;break;
          }
          //hackish crap
          if(strpos($tag->type,"* @title")!==false)
             $title=str_replace("* @title","",$tag->type);
       }
      // echo $title."   ".$return."<BR>";
      $code=property_exists($currFunc,"code")?$currFunc->code:"";
      $code=str_replace("<","&lt;",$code);
      $code=str_replace(">","&gt;",$code);
      $description=$currFunc->description->summary;
      $description=strip_tags($description,"<br><p>");
      if(strlen($title)==0)
         continue;
      $modules[$tab][$title]=Array("title"=>$title,"params"=>$params,"code"=>$code,"description"=>$description,"returns"=>$return);
    }
}

$mainContent="";
$panels="";
$navBar="";
$sideMenus="";
$subPanels="";
$mainNav="<nav><div class='title'>API's</div><ul class='list'>";
foreach($modules as $segment=>$info)
{
  $segment=str_replace("$.().",".",$segment);
  $segment=str_replace("$().",".",$segment);
  $id=str_replace(".","_",$segment);
  //$segment=str_replace("$.",".",$segment);

   $mainContent.="<li><a href='#".$id."'>$segment</a></li>\n";
   $panels.="<div id='".$id."' title='$segment'  class='panel' data-nav='nav_{$id}'><ul class='list'>";
   $navBar.="<a href='#".$id."' class='icon home'>$segment</a>";
   $sideMenus.="<nav id='nav_".$id."' ><div class='title'>$segment</div><ul class='list'>";

   $mainNav.="<li><a href='#".$id."'>$segment</a></li>";
   foreach($info as $func=>$properties){
          $funcPerm=str_replace("$.().",".",$func);
          $funcPerm=str_replace("$().",".",$func);
      //$funcPerm=str_replace("$.",".",$funcPerm);
      $funcPerm=genPermaLink($funcPerm);
      $linker=str_replace(".","_",$funcPerm);

       $panels.="<li><a data-persist-ajax='true' href='#".$linker."'>$funcPerm</a></li>\n";
       $sideMenus.="<li><a data-persist-ajax='true' href='#".$linker."'>$funcPerm</a></li>\n";
       $params="";
       foreach($properties['params'] as $title=>$value){
          $value=is_array($value)?implode("|",$value):$value;
           $params.="<li style='padding-left:15px;line-height:20px'>$title - $value</li>\n";
       }
       $returns="";
      if(isset($properties['returns'])&&count($properties['returns'])>1)
      {
        $val=is_array($properties['returns']['types'])?implode($properties['returns']['types'],"|"):$properties['returns']['types'];
        $returns.=$val." - ".$properties['returns']['desc'];
      }
      else
        $returns.= "null";
      $markdown="";
      $extraTitle=ltrim($funcPerm,".");
      echo $extraTitle.".md\n\r";
      if(is_file("./detail/".$extraTitle.".md")){

        $markdown=MarkdownExtended(file_get_contents("./detail/".$extraTitle.".md"));
      }

      //$panel=<<<EOF
      $subPanels.=<<<EOF


       <div id='{$linker}' title='{$func}' data-nav='nav_{$id}' class='panel'>
       <div class='source'>
          <h3><a class='collapsed' onclick='toggleSource("{$linker}",this)'>Show Source</a></h3>

            <div class='viewsource' id='source_{$linker}' style='display:none'>
            <pre style='padding-left:25px'><code>
            {$properties['code']}
            </code></pre>
             </div>
      </div>
          <h2>{$func}</h2>



          <section class='description'>{$properties['description']}</section>
          <article>
          <div class='spacer'></div>
             <h2>Params</h2>
             <ol>{$params}</ol>
             <div class='spacer'></div>
             <h2>Returns</h2>
             <div style='padding-left:30px;line-height:20px;'>$returns</div>
             <div class='spacer'></div>
             <div class='markdown'>

             <h2>Example</h2>
              <div class='markdowncontents'>
              {$markdown}
              </div>
             </div>
          </article>
       </div>
EOF;
     // $fp=fopen("#".$linker,"w+");
     // fputs($fp,$panel);
     // fclose($fp);
       }
    $sideMenus.="</ul></nav>";
    //$sideMenus.="</ul></nav>\n";
   $panels.="</ul></div>\n";
}
$sideMenus=$mainNav."</ul></nav>\n".$sideMenus;
//exit();

if(!isset($_GET['debug']))
$data=ob_start();

?>
<!DOCTYPE html><!--HTML5 doctype-->
<html>
  <head>
    <title>Documentation</title>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <META HTTP-EQUIV="Pragma" CONTENT="no-cache">

    <link rel="stylesheet" type="text/css" href="af.ui.css" />
 <link rel="stylesheet" type="text/css" href="icons.css" />

    <!--<script type="text/javascript" charset="utf-8" src="appframework.ui.min.js"></script>-->
    <script src="../appframework.js"></script>
    <script src="../ui/appframework.ui.js"></script>
    <script>
    function aj(obj){
      console.log(obj);
      alert(JSON.stringify(obj));
    }
    if(!$.os.ios&&!$.os.android){
      $.os.desktop=true;
      var sheet = document.createElement('style')
      sheet.innerHTML = "* {-webkit-user-select:text;!important};}";
      $("head").append(sheet);
      $.ui.ready(function(){
        $("#menu").css("overflow","auto");
      });
    }

    function toggleSource(ind,el){
      $("#source_"+ind).toggle();
      $el=$(el);
      if($el.html().toLowerCase()=="show source"){
        $el.replaceClass("collapsed","expanded");
        $el.html("Hide Source");
      }
      else {
       $el.replaceClass("expanded","collapsed");
        $el.html("Show Source");
      }
    }
    </script>
    <script type="text/javascript">
        /* This function runs once the page is loaded, but appMobi is not yet active */
    	var webRoot="/documentation/";
    	$.ui.autoLaunch=true;
      $.ui.backButtonText="Back";
    </script>
    <style>
    .greenredclass {
        background:green;
        color:red;
    }
  .blueyellowclass {
    background:blue;
    color:yellow;
  }
  .markdown pre {
    padding-top:10px    ;
    margin-left:0px;
    padding-bottom:10px;
  }

  .markdown p {
    background:transparent;
    box-shadow:none;
    -webkit-box-shadow:none;
    padding:0px;
    padding-bottom:5px;

  }

   pre {
      background:#969fa7;
      width:100%;
      counter-reset: linenumbers;
      margin-bottom:10px;
      border-radius:8px;
      color:white;
      font:normal 14px/17px Couriour New,Couriour;
      overflow:auto;
      -webkit-overflow-scrolling:touch;
    }

    code{
      background:#969fa7;
      overflow:auto;
      color:white;
    }

    h3{
      display:block;
      background:#969fa7;
      overflow:auto;
      color:white;
      height:48px;
      width:100%;
    }
    h3 a {
       display: block;
      width: 100%;
      height: 100%;
    }


   .linenumber {
        padding-left:5px;
    }
    .linenumber:before{
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        float: left;
        padding: 0 5px;
        text-align: right;
        width: 50px;
        padding-right:5px;
    }

    .linenumber:before {
        color:white;
        content: counter(linenumbers) ".";
        counter-increment: linenumbers;
    }

    .source {
        display:none
    }
    @media handheld, only screen and (min-width: 768px){
    .source{
        display:block;
    }
    }

    .viewsource {
        border-top:1px solid #999;
    }
    </style>
  </head>
  <body>
    <div id="afui">
      <div id="header">
        <a id="menubadge" onclick="$.ui.toggleSideMenu()" style="float:right;margin-top:0px" class="menuButton"></a>
      </div>

      <div id="content">
      	<div title='Documentation' id="main" class="panel" selected="true">
      		<ul class='list'>
      		<?php echo $mainContent;?>
      		</ul>

      	</div>
          <?php echo $panels;?>
          <?php echo $subPanels;?>
      </div>
      <!-- ------------------------------------------ -->
      <!-- navbar -->
      <div id="navbar">
          <?php echo $navBar;?>
      </div>
      <?php
      echo $sideMenus;
      ?>

    </div>
    <script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-36721400-4']);
  _gaq.push(['_trackPageview']);
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

  </body>
</html>

<?php
$out="index.html";
if(isset($_GET['debug']))
    exit();
$contents=ob_get_clean();
$fp=fopen($out,"w+");
fputs($fp,$contents);
fclose($fp);
echo "Documentation generated";
?>