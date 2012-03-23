/**
 * jq.debug - general and performance debug plugin
 * @copyright 2012 - Carlos Ouro @ Badoo
 * Use like $ui.launch=$.debug($ui.launch);
 */ 
 (function ($) {
	 //you can override this one to have your own 
	 $.debugLog = console.log;
	 
	 
	 var now=function(){
		 return (new Date()).getTime()*1000;
	 }
	 var lastTime=now();
	 var since=function(){
		 var pastTime = now()-lastTime;
		 if(pastTime>10000) {
			 return ""+Math.floor(pastTime/1000)+"s";
		 } else if(pastTime>3000) {
			 return ""+(Math.floor(pastTime/100)/10)+"s";
		 } else {
		 	return ""+Math.floor(pastTime)+"ms";
		 }
	 }
	 
	 
	 $.debug = function(method, methodName){
		 return function(){
			 $.debugLog("[+"+since()+"] "+methodName);
			 method.call(this, arguments);
		 }
	 }
	 
})(jq);