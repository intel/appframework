module("html",{teardown: function() {
   QUnit.reset();
  }});

var bareObj = function(value) { return value; };
var functionReturningObj = function(value) { return (function() { return value; }); };

 function click(el){
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      el.dispatchEvent(event);
}
 function mousedown(el){
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('mousedown', true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      el.dispatchEvent(event);
}
test("map",function(){

   var tmp=$("div");
   var res="";
   var elems=[];
   tmp.each(function(){
      elems.push(this.id);
   });
   res=elems.join(",");
   
   var mapRes=$("div").map(function(){return this.id}).get().join(",");
   equals(res,mapRes,"Testing map function by joining ids of $(div)");

});
test("each",function(){

   var tmp=$("div");
   var res="";
   var elems=[];
   tmp.each(function(){
      elems.push(this.id);
   });
   res=elems.join(",");
   
   var mapRes=$("div").map(function(){return this.id}).get().join(",");
   equals(res,mapRes,"Testing map function by joining ids of $(div)");

});
test("selector",function(){

   var elem=$("#foo");
   ok(elem.size()==1&&elem.get().id=="foo","Get single element by id");
   
   equals($("div").size(),4,"Find by query selector all");
   
   var elem=document.createElement("div");
   equals($(elem).get(),elem,"Test by passing in an object");
   
   var elem=$("#foo").get();
   equals($($("#foo")).get(),elem,"Test by passing in a jqMobi object");
   
   var elem=$("<div id='foobar'></div>").get();
   equals(elem.id,"foobar","Test creating element");
   
   var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel">Foo</span>'+
		  '<span class="parsel">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<span class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</span>'+
	'</div>';
	$("#foo").append(text);
	 var tmp = $('#parent_test_cont');
	 
     equals($('span', tmp).length,4,"Test passing in a context of existing objects");

        
	QUnit.reset();

})

test("ready",function(){
expect(1);
var counter=0;
$(document).ready(function(){counter++;});
equals(1,counter,"Testing document ready");
});

test("each",function(){
});
test("map",function(){

});

test("html", function() {
	expect(2);

	var test="This is a test";
	
	$("#foo").html(test);
	equals(document.getElementById("foo").innerHTML,test,"Test setting html");
    QUnit.reset();
	document.getElementById("foo").innerHTML=test;
	equals($("#foo").html(),test,"Test getting html");
	QUnit.reset();
});

test("text", function() {
	expect(2);

	var test="This is a test";
	
	$("#foo").text(test);
	equals($("#foo").text(),test,"Test setting html");
    QUnit.reset();
	document.getElementById("foo").innerText=test;
	equals($("#foo").text(),test,"Test getting html");
	QUnit.reset();
});


test("css", function() {
	expect(3);

	QUnit.reset();
	var defBackground="green";
	equals($("#foo").css("background"),defBackground,"Test getting a css property");
    QUnit.reset();
	$("#foo").css("background","red");
	equals($("#foo").css("background"),"red","Test setting a css property");
    QUnit.reset();
	
	var atts={
	background:"red",
	color:"white",
	display:"inline-block"
	}
	
	passed=true;
	$("#foo").css(atts).each(function(){
	   if(this.style.background!="red"||this.style.color!="white"||this.style.display!="inline-block")
	      passed=false;
	});
	equals(passed,true,"Testing setting multiple css properties");
	QUnit.reset();
});

test("empy",function(){

   expect(2);
   
   $("#foo").empty();
   equals($("#foo").html(),"","Testing empty of a single element");
   QUnit.reset();
   var passed=true;
   $(".foo").empty().each(function(){
      if(this.innerHTML!=""||this.innerHTML.length>0)
	     passed=false;
    });
   
   equals(passed,true,"Testing emptying multiple elements");
   QUnit.reset();
});

test("hide",function(){

   expect(3);
   
   $("#foo").hide();
   equals(document.getElementById("foo").style.display,"none","Testing hiding a single element");
   QUnit.reset();
   var passed=true;
   $(".foo").hide().each(function(){
      if(this.style.display!="none"){
	     passed=false;
      }
    });
   
   equals(passed,true,"Test hiding multiple elements");
   
   QUnit.reset();
	
   $("#foo").css("display","inline-block");
   $("#foo").hide();
   equals($("#foo").attr("jqmOldStyle"),"inline-block","Test that hide sets the old display in the jqmOldStyle attribute");
   QUnit.reset();
});

test("show",function(){

   expect(3);
   
   $("#foo").show();
   equals(document.getElementById("foo").style.display,"","Testing showing an element already shown");
   QUnit.reset();
   var passed=true;
   $(".foo").css("display","block");
   $(".foo").show().each(function(){
      if(this.style.display!="block"){
	     passed=false;
      }
    });
   
   equals(passed,true,"Test showing multiple elements");
   QUnit.reset();
	
   $("#foo").css("display","inline-block");
   $("#foo").hide();
   $("#foo").show();
   equals($("#foo").css("display"),"inline-block","Test that show restores the old style from hide");
   QUnit.reset();
});

test("toggle",function(){
    expect(6);

	var elem=$("#foo").get(0);

	elem.style.display="inline-block";

	$("#foo").toggle();
	equals(elem.style.display,"none","Testing toggle hides an element");
	$("#foo").toggle(true)
	equals(elem.style.display,"inline-block","Testing toggle restores an element with the old display");
	QUnit.reset();
	
	var elem=$("#foo").get(0);
	$("#foo").hide();
	$("#foo").toggle(false);
	equals(elem.style.display,"none","Testing toggle with show set to false");
	QUnit.reset();
	var elem=$("#foo").get(0);
	$("#foo").toggle(true);
	equals(elem.style.display,"none","Testing toggle with show set to true");
	QUnit.reset();
	
	var passed=true;
	$(".foo").css("display","inline-block");
    $(".foo").toggle().each(function(){
      if(this.style.display!="none"){
	     passed=false;
      }
    });
	equals(passed,true,"Testing toggle hides a group of elements");
	passed=true;
	$(".foo").toggle().each(function(){
      if(this.style.display!="inline-block"){
	     passed=false;
      }
    });
	equals(passed,true,"Testing toggle restores a group of elements with the old display");
	QUnit.reset();

	
});

test("val",function(){

   expect(2);
   
   var test="foo";
   document.getElementById("testInput").value=test;
   equals($("#testInput").val(),test,"Test getting the value");
   QUnit.reset();
   $("#testInput").val('newvalue')
   equals(document.getElementById("testInput").value,'newvalue',"Test getting the value");
   QUnit.reset();

});

test("attr",function(){

   expect(3);
   
   var elem=$("#foo").get(0);
   
   equals($("#foo").attr("data-name"),"foo","Test getting an attribute");
   QUnit.reset();
   
   $("#foo").attr("name","foo");
   equals($("#foo").get().getAttribute("name"),"foo","Testing setting an attribute");
   QUnit.reset();
   
   var pass = true;

	jq("div").attr({foo: "baz", zoo: "ping"}).each(function(){
		if ( this.getAttribute("foo") != "baz" && this.getAttribute("zoo") != "ping" ) pass = false;
	});
	ok( pass, "Set Multiple Attributes" );
    QUnit.reset();

});


test("removeAttr",function(){
   expect(10);
   equal( jq("#foo").removeAttr( "class" ).attr("class"), undefined, "remove class" );
   QUnit.reset();
	equal( jq("#foo").removeAttr("id").attr("id"), undefined, "Remove id" );
	QUnit.reset();
	
	
	var div = jq("<div id='a' alt='b' title='c' rel='d'></div>"),
		tests = {
			id: "a",
			alt: "b",
			title: "c",
			rel: "d"
		};

	jq.each( tests, function( key, val ) {
		equal( div.attr(key), val, "Attribute `" + key + "` exists, and has a value of `" + val + "`" );
	});

	div.removeAttr("id   alt  title  rel");
	jq.each( tests, function( key, val ) {
		equal( div.attr(key), undefined, "Attribute `" + key + "` was removed" );
	});
   QUnit.reset();
});

test("filter",function(){

   expect(3);
   
   equal(jq("div").filter("#foo").size(),1,"Filter off a selector");
   QUnit.reset();
   equal(jq("div").filter(document.getElementById("foo")).size(),1,"Filter off an element");
   QUnit.reset();
   equal(jq("div").filter($(".foo")).size(),2,"Filter off a jqMobi object");
   QUnit.reset();
});

test("remove",function(){

   expect(5);
   
   $("#foo").remove();
   equals($("#foo").length,0,"Removing an element");
   QUnit.reset();
   $(".foo").remove();
   equals($(".foo").length,0,"Removing multiple elements");
   QUnit.reset();
   $("div").remove(jq("#foo"));
   equals($("div").size(),3,"Removing an element with a selector");
	QUnit.reset();
	$("div").remove(document.getElementById("foo"))
	equals($("div").size(),3,"Removing by an element");
	QUnit.reset();
	ok($("#fadfasfdnotfound").remove());
	QUnit.reset();
});

test("addClass",function() {
   expect(4);
   
   var elem=$("#foo").get();
   elem.className="";
   $("#foo").addClass('bar');
   equals(elem.className,"bar","Set a single class name");
   QUnit.reset();
    var elem=$("#foo").get();
   elem.className="foo";
   $("#foo").addClass('');
   equals(elem.className,"foo","Add an empty class name");
   QUnit.reset();
   $(".foo").addClass("bar");
   var found=true;
   $(".foo").each(function(){
      if(this.className!="foo bar")
	     found=false;
	});
	ok(found,"Adding a class to multiple items");
	QUnit.reset();
	var elem=$("#foo").get();
    elem.className="foo";
    $("#foo").addClass('foo');
    equals(elem.className,"foo","Add an already existing class");
    QUnit.reset();
	
});

test("hasClass",function(){
   expect(2);
   $("#foo").addClass("bar");
   equals($("#foo").hasClass("bar"),true,"Checks if a class exists");
   QUnit.reset();
   $("#foo").addClass("bar");
   equals($("#foo").hasClass("foobar"),false,"Verifies the class does not exist");
   QUnit.reset();
});
test("removeClass",function(){
   expect(3);
   QUnit.reset();
   $("#foo").get().className="";
   $("#foo").addClass("bar");
   $("#foo").removeClass("bar");
   equals($("#foo").get().className,"","Remove a single class");
   QUnit.reset();
   $("#foo").className="";
   $("#foo").addClass("bar");
   $("#foo").addClass("panel");
   $("#foo").addClass("foo");
   $("#foo").removeClass("bar panel");
   equals($("#foo").get().className,"foo","Remove mutliple classes");
   QUnit.reset();
   $("#foo").className="";
   $("#foo").addClass("bar");
   $("#foo").addClass("panel");
   $("#foo").addClass("foo");
   $("#foo").removeClass("panel");
   equals($("#foo").get().className,"foo bar","Remove middle class element");
   QUnit.reset();
});

test("bind",function(){
   expect(2);
  var counter=0;

  $("#foo").bind("click",function(){counter++;});
  click($("#foo").get(0));
  equals(counter,1,"Test binding single event");
   QUnit.reset();
   counter=0;
  $("#foo").unbind();
   $("#foo").bind("click mousedown",function(){counter++;});
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,2,"Test binding multiple events");
  QUnit.reset();

});

test("unbind",function(){
   expect(3);
   
   var counter=0;
   $("#foo").bind("click",function(){counter++;});
   $("#foo").unbind("click");
   click($("#foo").get(0));
   equals(counter,0,"Test unbinding single event");
   QUnit.reset();
    var counter=0;
   $("#foo").bind("click mousedown",function(){counter++;});
   $("#foo").unbind("click mousedown");
    click($("#foo").get(0));
    mousedown($("#foo").get(0));
    equals(counter,0,"Test unbinding multiple events");
    QUnit.reset();
    var counter=0;
    $("#foo").bind("click mousedown",function(){counter++;});
    $("#foo").unbind("click");
   click($("#foo").get(0));
   mousedown($("#foo").get(0));
   equals(counter,1,"Test unbinding a single event but have others execute");
   QUnit.reset();

});

test("trigger",function(){
   expect(2);
   var counter=0;
   $("#foo").bind("click",function(evt){counter=evt.data});
   ok(counter==0,"Testing variable equals 0 before click");
   $("#foo").trigger("click",5);
   
   equals(counter,5,"Trigger click event and set the data to 5");
   QUnit.reset();
});

test("Delegate/Undelegate",function(){

  expect(7);
  var counter=0;

  $("#qunit-fixture").delegate("div","click",function(){counter++;});
  click($("#foo").get(0));
  equals(counter,1,"Test delegating single event");
  QUnit.reset();
  $("#qunit-fixture").undelegate("div","click");
  counter=0;
  click($("#foo").get(0));
  equals(counter,0,"Test undelegating single events");
  
  $("#qunit-fixture").delegate("div","click mousedown",function(){counter++;});
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,2,"Test delegating multiple events");
  QUnit.reset();
  
  counter=0;
  $("#qunit-fixture").undelegate("div","click");
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,1,"Test undelegating single event from multiple list");

  counter=0;
  $("#qunit-fixture").undelegate("div");
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,0,"Test undelegating all events");
  
  counter=0;
  $("#qunit-fixture").delegate("div","click mousedown",function(){counter++;});
  $("#qunit-fixture").undelegate("div","click mousedown");
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,0,"Test undelegating multiple events");
  QUnit.reset();
  
  counter=0;
  
  $("#qunit-fixture").delegate("div","click",function(){counter++;});
  
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  $("#qunit-fixture").undelegate("div","click",function(){counter++;});
  click($("#foo").get(0));
  equals(counter,1,"Test undelegating anonymous function");
  QUnit.reset();
  
});

test("On/Off",function(){

  expect(6);
  var counter=0;

  $("#qunit-fixture").on("click","div",function(){counter++;});
  click($("#foo").get(0));
  equals(counter,1,"Test on single event");
  QUnit.reset();
  $("#qunit-fixture").off("click","div");
  counter=0;
  click($("#foo").get(0));
  equals(counter,0,"Test off single events");
  
  $("#qunit-fixture").on("click mousedown","div",function(){counter++;});
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,2,"Test on multiple events");
  QUnit.reset();
  
  counter=0;
  $("#qunit-fixture").off("click","div");
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,1,"Test off single event from multiple list");

  counter=0;

  
  counter=0;
  $("#qunit-fixture").on("click mousedown","div",function(){counter++;});
  $("#qunit-fixture").off("click mousedown","div");
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  equals(counter,0,"Test off multiple events");
  QUnit.reset();
  
  counter=0;
  
  $("#qunit-fixture").on("click","div",function(){counter++;});
  
  click($("#foo").get(0));
  mousedown($("#foo").get(0));
  $("#qunit-fixture").off("click","div",function(){counter++;});
  click($("#foo").get(0));
  equals(counter,1,"Test off anonymous function");
  QUnit.reset();
  
});

test("append",function(){

  expect(4);

  $("#foo").html('');
  $("#foo").append("string");
  equals($("#foo").html(),"string","Append a string");
  QUnit.reset();
  $("#foo").html('');
  var div=$("<div>Something</div>").get(0);
  $("#foo").append(div);
  equals($("#foo").get().childNodes[0],div,"Appending a dom element");

  QUnit.reset();
  $("#foo").html("starting");
  $("#foo").append($("<div>Something</div>"));
  equals($("#foo").html(),"starting<div>Something</div>","Appending a jqMobi object");
  QUnit.reset();
  var arr=[];
  arr.push(jq("<div>something</div>").get());
  arr.push(jq("<div>something</div>").get());
  $("#foo").html("");
  $("#foo").append(arr);
  
  equals($("#foo").html(),"<div>something</div><div>something</div>","Appending multiple objects at once");
  QUnit.reset();
});

test("prepend",function(){

  expect(4);

  $("#foo").html('');
  $("#foo").prepend("string");
  equals($("#foo").html(),"string","prepend a string");
  QUnit.reset();
  $("#foo").html('');
  var div=$("<div>Something</div>").get(0);
  $("#foo").prepend(div);
  equals($("#foo").get().childNodes[0],div,"Prepending a dom element");

  QUnit.reset();
  $("#foo").html("starting");
  $("#foo").prepend($("<div>Something</div>"));
  equals($("#foo").html(),"<div>Something</div>starting","Prepending a jqMobi object");
  QUnit.reset();
  var arr=[];
  arr.push(jq("<div>something</div>").get());
  arr.push(jq("<div>something</div>").get());
  $("#foo").html("");
  $("#foo").prepend(arr);
  
  equals($("#foo").html(),"<div>something</div><div>something</div>","Prepending multiple objects at once");
  QUnit.reset();
});
test("insertBefore",function(){

  expect(2);

  $("<span id='before'/>").insertBefore("#foo");
  var parent=$("#foo").parent().children();
  var sp=$("#before").get();
  var foo=$("#foo").get();
  ok(parent.indexOf(sp)<parent.indexOf(foo));
  QUnit.reset();
  //let's move an object.
  $("#foo").parent().append("<span id='before'/>");
  $("#before").insertBefore("#foo");
  var parent=$("#foo").parent().children();
  var sp=$("#before").get();
  var foo=$("#foo").get();
  ok(parent.indexOf(sp)<parent.indexOf(foo));
  
});
test("insertAfter",function(){

  expect(2);

  $("<span id='before'/>").insertAfter("#foo");
  var parent=$("#foo").parent().children();
  var sp=$("#before").get();
  var foo=$("#foo").get();
  ok(parent.indexOf(sp)>parent.indexOf(foo));
  QUnit.reset();
  //let's move an object.
  $("#foo").parent().prepend("<span id='before'/>");
  $("#before").insertAfter("#foo");
  var parent=$("#foo").parent().children();
  var sp=$("#before").get();
  var foo=$("#foo").get();
  ok(parent.indexOf(sp)>parent.indexOf(foo));
});

test("get",function(){

  expect(4);
  var elem=$("#foo").get();
  equals($("div").get(2),elem,"Checking get by index");
  equals($("#foo2").get(),document.getElementById("foo2"),"Checking no index");
  equals($("div").get(-2),elem,"Checking by negative index");
  equals($("div").get(5),undefined,"Checking outside the size");
	QUnit.reset();
});

test("offset",function(){

   //create a tmp div at the top
   var elem=$("<div id='testbar' style='position:absolute;top:5px;left:5px;width:12px;height:25px'></div>").get();
   var resultcrds={left:5,top:5,width:12,height:25};
   $(document.body).append(elem);
   var coords=$("#testbar").offset();

   //$(document.body).remove(elem);
   var passed=true;
   for(var j in resultcrds)
   {
      if(coords[j]!=resultcrds[j])
	     passed=false;
   }
   ok(passed,"Testing getting offset coordinates");
   QUnit.reset();
});

test("parent",function(){
   expect(5);
   var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel">Foo</span>'+
		  '<span class="parsel">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
	'</div>';
	
	//Test to get a single parent
	
	$("#foo").append(text);

	var elem1=$("#parent_test_cont").get();
	equals(elem1,$("#parent1").parent().get(),"Test a single parent");
	QUnit.reset();
	
	$("#foo").append(text);
	var elem1=$("#parent_test_cont").get();
	equals(elem1,$(".parent1").parent().get(),"Test a common parent from a collection");
	QUnit.reset();
	
	$("#foo").append(text);
	var knownparents=$(".parent1");
	var parents=$(".parsel").parent();
	var found=true;
	parents.each(function(){
	  if(knownparents.indexOf(this)<0)
	     found=false
	});
	
	ok(found,"Test getting unique parents with multiple children");
	QUnit.reset();
	$("#foo").append(text);
	var elem=$("#parent1").get();
	equals(elem,$(".parsel").parent("#parent1").get(),"Test filtering for parents");
	
	QUnit.reset();
	$("#foo").append(text);
	var elem=$("#parent1").get();
	equals(elem,$(".parsel").parent($("#parent1")).get(),"Test filtering for parents off object");
	
});

test("children",function(){
   expect(4);
   var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel parent1">Foo</span>'+
		  '<span id="spantest" class="parsel parent1 child1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel" id="span1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel child1">Foo</p>'+
		'</div>'+
	'</div>';
    
	
	QUnit.reset();
	$("#foo").append(text);
	var elem=$("#span1").get();
	var child=$("#parent2").children();
	ok(child.length==1&&child.get()==elem,"Testing getting a child");
	
    QUnit.reset();
	$("#foo").append(text);
	var elem=$(".parent1");
	var child=$("#parent1").children();
	var passed=true;
	child.each(function(){
	   if(elem.indexOf(this)<0)
	      passed=false;
	});
	ok(passed,"Test getting multiple children");
	
	QUnit.reset();
	$("#foo").append(text);
	var elem=$("#spantest").get();
	var child=$("#parent1").children(".child1").get();
    equals(elem,child,"Test passing in a selector on children");
	
	QUnit.reset();
	$("#foo").append(text);
	var elem=$("#spantest").get();
	var child=$("#parent1").children($(".child1")).get();
    equals(elem,child,"Test passing in an object on children");
	
	
	
});

test("siblings",function(){
   expect(5);
   var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel parent1">Foo</span>'+
		  '<span id="spantest" class="parsel parent1 child1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel" id="span1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1 parent2" id="parent3">'+
		  '<p class="parsel child1">Foo</p>'+
		'</div>'+
	'</div>';

	QUnit.reset();
	$("#foo").append(text);	
	equals($("#span1").siblings().length,0,"Test element has no siblings");
	
	QUnit.reset();
	$("#foo").append(text);	
	equals($("#spantest").siblings().length,1,"Test element has one siblings");
	
	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent1").siblings().length,3,"Test element has multiple siblings");
	
	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent1").siblings(".parent2").get(),$(".parent2").get(),"Test filtering siblings");
	
	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent1").siblings($(".parent2")).get(),$(".parent2").get(),"Test filtering siblings by object");
});

test("closest",function(){
   expect(4);
  var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel parent1">Foo</span>'+
		  '<span id="spantest" class="parsel parent1 child1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel" id="span1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1 parent2" id="parent3">'+
		  '<p class="parsel child1">Foo</p>'+
		'</div>'+
		'<span >'+
		  '<p id="ptest">Foo</p>'+
		'</span>'+
	'</div>';

	QUnit.reset();
	$("#foo").append(text);	
	var elem=$("#parent1").get();
	var tmp=$("#spantest").closest("div").get();
	equals(elem,tmp,"Test getting closest element 1 level up");
	
	QUnit.reset();
	$("#foo").append(text);	
	var elem=$("#parent_test_cont").get();
	var tmp=$("#ptest").closest("div").get();
	equals(elem,tmp,"Test getting closest element 2 level up");
	
		
	QUnit.reset();
	$("#foo").append(text);	
	var elem=$("#parent_test_cont").get();
	var tmp=$("#ptest").closest("#parent_test_cont").get();
	equals(elem,tmp,"Test passing going up two levels based off string selector");
	
		QUnit.reset();
	$("#foo").append(text);	
	var elem=$("#parent_test_cont").get();
	var tmp=$("#ptest").closest(elem).get();
	equals(elem,tmp,"Test passing going up two levels based off object");
});

test("find",function(){
expect(3);
var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel parent1">Foo</span>'+
		  '<span id="spantest" class="parsel parent1 child1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel" id="span1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1 parent2" id="parent3">'+
		  '<p class="parsel child1">Foo</p>'+
		'</div>'+
		'<span >'+
		  '<p id="ptest">Foo</p>'+
		'</span>'+
	'</div>';

	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent1").find("span").length,2,"Find two spans in a div");
	
	
	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent1").find("#spantest").get(),$("#spantest").get(),"Find using an id selector");
	
	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent1").find($("span")).size(),2,"Find passing in an object that has more elements and search inside");


});


test("not",function(){
expect(4);
	var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel parent1">Foo</span>'+
		  '<span id="spantest" class="parsel parent1 child1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel" id="span1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1 parent2" id="parent3">'+
		  '<p class="parsel child1">Foo</p>'+
		'</div>'+
		'<span id="removeTest" >'+
		  '<p id="ptest">Foo</p>'+
		'</span>'+
	'</div>';

	QUnit.reset();
	$("#foo").append(text);	
	
	equals($("#parent_test_cont").find("div").not("#parent2").size(),3,"Filter out a specific element");
	
	equals($("#parent_test_cont").children().not("div").size(),1,"Filter out based off selector");
	
	equals($("#parent_test_cont").children().not($("#removeTest")).size(),4,"Filter out based off jqMobi object");
	var elem=document.getElementById("removeTest");
	equals($("#parent_test_cont").children().not(elem).size(),4,"Filter out based off  object");
   
});
test("data",function(){
expect(4);

   var obj={
   foo:"bar"
   };
   QUnit.reset();
   $("#foo").data("test","test")
   var attr=document.getElementById("foo").getAttribute("data-test");
   equals(attr,"test","Setting an attribute");
   
   QUnit.reset();
   document.getElementById("foo").setAttribute("data-test","foo");
   equals($("#foo").data("test"),"foo","Getting an attribute");
   
   QUnit.reset();
   document.getElementById("foo").setAttribute("data-test",JSON.stringify(obj));
   equals($("#foo").data("test").foo,obj.foo,"Getting an attribute that is an object");
   
   QUnit.reset();
   $("#foo").data("test",obj);
   var elem=JSON.parse(document.getElementById("foo").getAttribute("data-test"));
   equals(elem.foo,obj.foo,"Seeting an attribute that is an object");

});

test("end",function(){
    expect(1);
	var text='<div id="parent_test_cont">'+
	   '<div class="parent1" id="parent1">'+
		  '<span class="parsel parent1">Foo</span>'+
		  '<span id="spantest" class="parsel parent1 child1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent2">'+
		  '<span class="parsel" id="span1">Foo</span>'+
		'</div>'+
		'<div class="parent1" id="parent3">'+
		  '<p class="parsel">Foo</p>'+
		'</div>'+
		'<div class="parent1 parent2" id="parent3">'+
		  '<p class="parsel child1">Foo</p>'+
		'</div>'+
		'<span id="removeTest" >'+
		  '<p id="ptest">Foo</p>'+
		'</span>'+
	'</div>';

	QUnit.reset();
	$("#foo").append(text);	
	equals($("#parent_test_cont").get(),$("#parent_test_cont").not("div").end().get(),"Testing end lements");

});

test("clone",function(){


   expect(3);
   
   var elem=$("#foo").get();
   var cloned=$("#foo").clone(false).get();
   ok(elem.id==cloned.id&&cloned.childNodes.length==0,"Shallow clone with no children");
   QUnit.reset();
   
   var elem=$("#foo").get();
   var cloned=$("#foo").clone(true).get();
   ok(elem.id==cloned.id&&cloned.childNodes.length==elem.childNodes.length,"Deep clone with children");
   
   var cloned=$(".foo").clone(true);
   equals(cloned.length,$(".foo").length,"Cloning a collection of children");

});

test("parseXML",function(){

  var str="<xml><foo>bar</foo></xml>";
  var parser = new DOMParser();
  var obj=parser.parseFromString(str,"text/xml");  
  equals(obj.foo,jq.parseXML(str).foo,"Testing Parse XML");

});
test("param",function(){
var elems=[];
elems["foo"]="bar";
elems["name"]="jqMobi";

equals(jq.param(elems),"foo=bar&name=jqMobi");
});

test("serialize",function(){
   var basestr="name=jqMobi&available=true&version=0.9.5"
   equals(jq("#myform").serialize(),basestr,"Testing serialize");
   QUnit.reset();

   var basestr="name=jqMobi&version=1.0"
   $("#available").get().checked=false;
   $("#version").val("1.0");
   equals(jq("#myform").serialize(),basestr,"Testing serialize");
   $("#available").get().checked=true;
   $("#version").val("0.9.5");
    var basestr="test[name]=jqMobi&test[available]=true&test[version]=0.9.5"
   equals(jq("#myform").serialize('test'),basestr,"Testing serialize");
   QUnit.reset();
});

test("ajaxGet",function(){
    stop();
	
	$.get("server.php?data=foo",function(data){equals(data,"foo");start()});

});
test("ajaxPost",function(){
    stop();
	
	$.post("server.php",{data:'foo'},function(data){equals(data,"foo");start()});

});
test("ajax",function(){
    stop();
	
	$.ajax({url:"server.php?data=foo",success:function(data){equals(data,"foo");start()}});
});

test("jsonp",function(){
    
 stop();
	
  $.jsonP({url:'server.php?jsonp=?',success:function(data){equals(data,"foo");start()}});
});
test("getJSON",function(){
stop();
  var obj={foo:"bar"};
  $.getJSON("server.php?json","",function(data){equals(data.foo,obj.foo);start()});
});

test("parseJSON",function(){

var obj={foo:"bar"};

equals(obj.foo,$.parseJSON(JSON.stringify(obj)).foo);

});

test("$.os",function(){

var userAgents={
  webos:'User-Agent:Mozilla/5.0 (webOS/1.3; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Desktop/1.0',
  webkit:'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.12 (KHTML, like Gecko) Chrome/17.0.961.0 Safari/535.12',
  android:'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.',
  ipad:'Mozilla/5.0 (iPad; U; CPU OS 4_3 like Mac OS X; de-de) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F191 Safari/6533.18.5',
  iphone:'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5',
  touchpad:'Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.2; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/234.40.1 Safari/534.6 TouchPad/1.0',
  blackberry:'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.1.0.7 Safari/534.11+',
  opera:'Opera/9.80 ($OS; Opera Mobi/$BUILD_NUMBER; U; $LANGUAGE) Presto/$PRESTO_VERSION Version/$VERSION',
  fennec:'Mozilla/5.0 (Android; Linux armv7l; rv:9.0) Gecko/20111216 Firefox/9.0 Fennec/9.0'
  };
  
  QUnit.reset();
  var tmp=$();
  $.__detectUA(tmp,userAgents.webos);
  ok(tmp.os.webos,"Test for WebOS user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.touchpad);
  ok(tmp.os.touchpad,"Test for Touchpad user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.webkit);
  ok(tmp.os.webkit,"Test for Webkit user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.android);
  ok(tmp.os.android,"Test for android user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.iphone);
  ok(tmp.os.iphone,"Test for iphone user agent");
  ok(tmp.os.ios,"Test for ios user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.ipad);
  ok(tmp.os.ipad,"Test for ipad user agent");
  ok(tmp.os.ios,"Test for ios user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.blackberry);
  ok(tmp.os.blackberry,"Test for Blackberry user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.opera);
  ok(tmp.os.opera,"Test for Opera Mobile user agent");
  var tmp=$();
  $.__detectUA(tmp,userAgents.fennec);
  ok(tmp.os.fennec,"Test for Fennec user agent");

});