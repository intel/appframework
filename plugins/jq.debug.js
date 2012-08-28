/**
 * jq.debug - general and performance debug plugin
 * @copyright 2012 - Carlos Ouro @ Badoo
 * Use like MyClass=$.debug.type(MyClass);
 * Or MyObj=$.debug.object(MyObj);
 */ 
 (function ($) {
	 //you can override this one to have your own 
	 $.debug = {};
	 $.debug.out = function(t){console.log(t);};
	 var maxObjectItems = 14;
	 
	 var now=function(){
		 return (new Date()).getTime();
	 }
	 var lastTime=now();
	 var since=function(){
		 thisTime = now();
		 pastTime = thisTime-lastTime;
		 lastTime = thisTime;
		 if(pastTime>10000) {
			 return ""+Math.floor(pastTime/1000)+"s";
		 } else if(pastTime>3000) {
			 return ""+(Math.floor(pastTime/100)/10)+"s";
		 } else {
		 	return ""+Math.floor(pastTime)+"ms";
		 }
	 }
	 var getContent=function(obj, allowRecursive){
		 if(obj===null) return null;
		 
		 curType = typeof obj;
			 
		 if(curType== 'number'){
			 return obj;
		 } else if(curType == 'string'){
		 	return "'"+obj+"'";
		 } else if(curType == 'boolean'){
			 return obj ? "true" : "false";
		 } else if($.isArray(obj)){
			 if(obj.length<=maxObjectItems){
				 var str = "[";
				 var firstItem = true;
			 	for(el in obj){
	   			 	if(!firstItem) str+=', ';
	   			 	else firstItem = false;
					str+=getContent(obj[el], false);
			 	}
				return str+"]";
			 }
		 } else if(curType == 'object'){
			 var isMobi = $.is$(obj);
			 if(!isMobi && allowRecursive && Object.keys(obj).length<=maxObjectItems){
				 var str = "{";
				 var firstItem = true;
			 	for(el in obj){
	   			 	if(!firstItem) str+=', ';
	   			 	else firstItem = false;
					str+=el+":"+getContent(obj[el], false);
			 	}
				return str+"}";
			} else {
				if(isMobi){
					var str = "$("+obj[0].tagName+(obj[0].id?"#"+obj[0].id:"");
					for(var i = 0; i<obj.length; i++){
						str+=", "+oobj[i].tagName+(obj[i].id?"#"+obj[i].id:"");
					}
					return str+")";
				} else if(obj.tagName!==undefined && typeof obj.tagName == 'string'){
					return "["+obj.tagName+(obj.id?"#"+obj.id:"")+"]";
				}
			}
		 }
		 //unrecognized
		 return "["+curType+"]";
	 }
	 var checkParams = function(args){
		 var curType;
		 var str = "";
		 var firstItem = true;
         for (i = 0; i < args.length; i++) {
			 if(!firstItem) str+=', ';
			 else firstItem = false;
			 str+=getContent(args[i], true);
         }
		 if(str=="") str="void";
		 return str;
	 }
	 
	 $.debug.since = function(){
	 	return "[+"+since()+"] ";
	 }
	 
	 $.debug.log = function(t){this.out(this.since()+t);};
	 
	 $.debug.method = function(obj, method, methodName){
		 var that = this;
		 return function(){
			 that.log(methodName+"("+checkParams(arguments)+")");
			 return method.apply(obj, arguments);
		 }
	 }
	 
	 $.debug.object = function(obj, objectName){
		 for (item in obj){
			 if(typeof obj[item] == 'function'){
			 	obj[item] = this.method(obj, obj[item], objectName+"."+item);
			 }
		 }
	 }
	 
	 $.debug.type = function(c, objectName){
		 var that = this;
		 var a = function(){
			 that.log(objectName+".constructor("+checkParams(arguments)+")");
			 c.apply(this, arguments);
			 that.object(this, objectName);
		 }
		 for(el in c.prototype){
		 	a.prototype[el]=c.prototype[el];
		 }
		 return a;
	 }
	 
	 
})(jq);



// //UNIT TESTING
// 
// //VARIABLES
// var t = {
// 	a:16,
// 	b:11,
// 	f: function(){
// 		return this.f2();
// 	},
// 	f2: function(){
// 		return this.a+this.b;
// 	}
// }
// 
// var t2 = {
// 	a:15,
// 	b:10,
// 	f: function(){
// 		return this.f2();
// 	},
// 	f2: function(){
// 		return this.a+this.b;
// 	}
// }
// 
// 
// 
// var t3 = function(){this.b = 20;this.c = 5;}
// t3.prototype = {
// 	a: 20,
// 	b: 1000,
// 	f: function(){
// 		return this.f2();
// 	}
// }
// t3.prototype.f2=function(){
// 	return this.a+this.b+this.b;
// }
// 
// //SETUP
// t.f = $.debug.method(t, t.f, 't.f');
// t.f2 = $.debug.method(t, t.f2, 't.f2');
// $.debug.object(t2, 't2');
// t3 = $.debug.type(t3, 't3');
// 
// 
// //RUN TESTS
// console.log(t.f());
// console.log(t2.f());
// var t3Test = new t3();
// console.log(t3Test.f());
// //plus details should appear on console
