# jQ.Plugins

jQ.Plugins are plugins to use with jQ.Mobi

# About

At AppMobi, we use our own tools to build apps and these libraries came out of our internal needs.  Two libraries require AppMobi to use, while the rest can be used for AppMobi and general mobile web development.

jq.web.min.js contains a minified version of functions that can be used for mobile web development.


The sources are in the src/ folder.  For demos please see the kitchensink app.

# Mobile Web Libaries (jq.min.js)
These libraries can be used in AppMobi or general mobile web development.

jq.alphaTable

* A CSS3 Alphabetical/scrolling table.  This creates a table that you can scroll, but have the alphabetical index for users to jump around with.

jq.scroller 

* A CSS3 scrolling library.  This allows you to create a fixed height/width div and scroll veritical and/or horizontal.

jq.carousel

* A CSS3 carousel library.  You can create vertical or horizontal carousels.

jq.swipe

* This detects swipe events on an element.  You can set the threshold of pixels they must move for veritcal or horizontal.

* Executes a callback function with an object as a parameter that indicates if the swipe was north, south, east, or west.  

jq.template

* A template parsing library, similar to popular scripting languages syntax.  The parsing engine is John Resig's micro template engine.

jq.selectBox

* A replacement for HTML select boxes on Android devices.  There is a bug when -webkit-transform:translate3d is applied to elements, it causes an issue with painting the active area.

* This will find all select boxes in an element and replace them with the new widget.

* Old select box stays, so it is backwards compatibile with any code/interaction.  

jq.passwordBox

* A replacement for HTML password boxes on Android devices.  There is a bug when -webkit-transform:translate3d is applied to elements, it causes an issue with painting the focused box on the page.

* This will find all password boxes in an element and replace them with the new widget.

* Old password boxes stays, so it is backwards compatibile with any code/interaction.

jq.css3animate

* This is a helper function for doing css3 animations.  It allows you to animate the x/y position, opacity and width/height (more properties coming soon).

jq.drawer

* This is a pull widget like the notification bar on phones.  

# AppMobi Libraries
These libraries require AppMobi to work.

jq.shake

* This taps into the accelerometer to trigger an event when the device has been shook.  You can set a threshold to indicate movement required to trigger the shake.

* Executes a callback function when it recieves a shake.

jq.social (coming soon in 3.4.1)

* A wrapper utility for making oAuth calls using AppMobi.

# How to use jQ.Web libraries

#jq.alphaTable

To use jq.alphaTable, you must also include the jq.scroller library and do the following

1. Create a jq.scroller for your list.  See the instructions below.

2. Create your list, broken up by divs/spans/anchors for each alphabet.

``` html
<div id="contacts_A">
<li>Joe Anderson</li>
</div>
<div id="contacts_B">
<li>Joe Bob</li>
</div>
``` 

3. Call the javascript function to create the object.  The first paramter is the ID for the scroller, the second is the scroller object.  The third is optional config parameters.

``` js
var alphaTable = $("#contentDIV").alphaTable(scroller,{prefix:"contacts_",listCssClass:"cssClassName"});
```

There are two optional parameters

```` js
var options{
   prefix:"contacts_", //prefix for your divs
   listCssClass:"listTable" //CSS class name to style the alphabet list.  You can position it, set the background color, etc.
}
``` 

# jq.scroller

To use jq.scroller you must do the following

1. Create an outer container div that has the height and width of the area you want to see visible

``` html
<div id="my_div_container" style="width:100%;height:300px">
  <!-- div from below goes here -->
</div>
```
   
2. Create a div with the content inside you want scrollable.

``` html
<div id="my_div_container" style="width:100%;height:300px">
   <div id="my_div" >
      <!-- content goes here -->
   </div>
</div>
````

3. Call the javascript function on the ID of the area you want to scroll

```` js
var scroller = $("#my_div").scroller();
````

There are additional configuration options that are passed in as an object parameter

``` js
var options={
   verticalScroll:true, //vertical scrolling
   horizontalScroll:false, //horizontal scrolling
   scrollBars:true  //display scrollbars
   vScrollCSS : "scrollBarV", //CSS class for veritcal scrollbar
   hScrollCSS : "scrollBarH", //CSS class for horizontal scrollbar
   refresh:true, //Adds 'Pull to refresh' at the top
   refreshFunction:updateMessage //callback function to execute on pull to refresh
}
var scroller = $("#my_div").scroller(options);
```

You can also have it scroll to a specific position

``` js
scroller.scrollTo({x:-100,y:-200});
```

If you want to make persistent scrollbars, override the opacity style for the class

``` css
.scrollBarV { opacity:.8 !important}
```

# jq.carousel

To use jq.carousel you must do the following

1. Create a div with the content inside you want to page between.  You must set the height and width of this div, along with overflow:hidden

``` html
<div id="my_div" style="width:768px;height:400px;overflow:hidden">
   <div style="float:left;width:766px;height:400;border:1px solid white;background:yellow;"></div>
   <div style="float:left;width:766px;height:400;border:1px solid white;background:green;"></div>
</div>
```

2. if you want the dots to show up for paging, create the div

``` html
<div id="carousel_dots" style="text-align: center; margin-left: auto; margin-right: auto; clear: both;position:relative;top:-40px;z-index:200"></div>
```

3. Call the javascript function to create the carousel

``` js
var carousel = $("#my_div").carousel();
```

There are additional configuration options that are passed in as an object parameter

``` js
var options={
   vertical:false, // page up/down
   horizontal:true, // page left/right
   pagingDiv:null, // div to hold the dots for paging
   pagingCssName:"carousel_paging", //classname for the paging dots
   pagingCssNameSelected: "carousel_paging_selected" //classname for the selected page dots
}
var carousel = $("#my_div").carousel(options);
```


# jq.swipe

To use jq.swipe you must do the following

1. Create an html elemenet you want to detect the swipe on.  This could also be the whole document.

2. Call the javascript function to listen for the swipe event

``` js
var swipe=$(document).swipe(); //string or element to listen on
```

There are additional configuration options that are passed in as an object parameter

``` js
var options={
   vthreshold:50, //vertical pixel threshold
   hthreshold:50, //horizontal pixel threshold
   callback:null //callback function to execute.  It takes one parameter that is an object of the swipe directions {up:true,down:false,left:true,right:false}
}

var swipeListener = $("#mydiv").swipe(options);
var swipeListener = $(document).swipe({vthreshold:30,hthreshold:50,callBack:function(dir){console.log(dir)}});
```

# jq.template

The template parsing library is John Resig's micro templating, with some fixes and enhancements.  http://ejohn.org/blog/javascript-micro-templating/

To use jq.template you must do the following

1. Create your template.  The easiest way is to create <script> tags with the content type of "text/html" and set an id

``` html
<script type='text/html' id='user_info'>
   Name <%=userinfo.name%><br>
   Company <%=userinfo.company%><br>
   Cool <%=userinfo.awesome%>
</script>
```

2. To process the template you call a javascript function with the id of the template, and optional data to pass in

``` js
 $("#output").template("my_template");
```

You can pass in an optional object parameter that provides data to be used within the template.  Below is a sample that could display user information based on a user object

``` html
<script type='text/html' id='user_info'>
   Name <%=userinfo.name%><br>
   Company <%=userinfo.company%><br>
   Cool <%=userinfo.awesome%>
</script>
<script type='text/javascript'>
var user={
   name:"Joe Programmer",
   company:"appMobi",
   awesome:"of course"
}
 $("#template_content").templatetemplate("user_info",{userinfo:user});
</script>
```

# jq.selectBox

Currently, there exists a bug in Android webkit with -webkit-transform:translate being applied to an element that has <select> elements in it.  The second the translate position is changed, 
the active box for the select box changes. It could be above or below the actual select box, making the user experience a disaster.  What this does is replaces all select boxes with a custom widget
that is similar to the Android picker.  The old select is still there and backwards compatible with other libraries for getting/setting values.

To use jq.selectBox you must do the following

1. Make sure your current select boxes are wrapped in a span tag

``` html
<span><select id="myid"><option>1</option></select></span>
```

2. On the document.load or appMobi.device.ready listener, you must create an object, then call getOldSelects on the elements (div/spans/document) you want.

``` js
$.selectBox.getOldSelects("selectTest");
```

getOldSelects takes in the id of the element you want to search for select tags in.  Ideally, you would call it on all the divs that have select boxes in it.  There are issues with Google Maps, and other libraries, that inject their own select boxes into the DOM.

To theme this, you can override the inline styles using css.  Please make sure you mark each entry with !important

``` css
This is a sample design for 768x1024 apps (iPad)

#jqmobiSelectBoxContainer {
/* Black bar at the top where the "Done" button is */
height:430px !important;
font-size:36pt !important;
}
#jqmobiSelectBoxFix {
/* The container that holds the scrolling content/*
height:350px !important;
}

.jqmobiSelectRow {
height:60px !important;
/* The gray gradient background for each row */
}
.jqmobiSelectRowFound {
/* The black gradient background for the selected/found row */
height:60px !important;
}
.jqmobiSelectRowButtonFound{
/* The gray gradient button/checkbox on the found row*/
height:30px !important;
width:30px !important;
}
.jqmobiSelectRowButton{
/* The white button/checkbox on each row*/
height:30px !important;
width:30px !important;
}
.jqmobiSelectRowText{
/* The text/label for each row*/
}
```


# jq.passwordBox

Currently, there exists a bug in Android webkit with -webkit-transform:translate being applied to an element that has <input type="password"> elements in it.  The second the translate position is changed, 
the overlay for the password is in a different position, making it look like another input box appears.  What this does is replaces the password box with an input box that updates the content as it goes with an asterik to simulate a password box

To use jq.passwordBox you must do the following

1. Make sure your current password boxes are wrapped in a span tag

``` html
<span><input type="password" id="myid"></span>
```

2. On the document.load or appMobi.device.ready listener you must create an object and then call getOldPasswords on the elements (div/spans/document) you want.

``` js
var pwFixer = new $.passwordBox();
pwFixer.getOldPasswords("selectTest");//element you want to replace the password boxes in
```
   
getOldPasswords takes in the id of the element you want to search for password boxes in.  This will replace them with the new tool.
 
Currently, you can not theme the input boxes, but that will be added soon.
   

# jq.css3animate

This is a library to help with css3 animations

To use jq.css3animate you must

1.  Call the function

``` js
$("#div").css3animate(options);
```

There are additional configuration options that are passed in as an object parameter

``` js
var options={
   x:20, //x axis move. this can be a number (40), percent (50%), or pixels (40px) - if it's a number, px is added to it.
   y:20, //y axis move
   opacity:.5, //opacity to change to
   width:"100px", //style.width to change to
   height:"100px", //style.height to change to
   origin:"50% 50%", //offset to start the animation from default is 0 0
   rotateX:"50deg", //rotate along the x-axis
   rotateY:"50deg", //rotate along the y-axis
   skewX:"50deg", //skew along the x-axis
   skewY:"50deg", //skew along the y-axis
   time:"300ms", //time for transition
   timingFunction:"linear", //timing function for animation
   previous:false // move from previous position - not tested with animation by percentages
   callback:function(){console.log("finished animation")}
}

$("#div").css3animate(options);

```

You can chain animations by passing in an animation in the callback function

``` js
$("#animate").css3Animate({x : 20,y : 30,time : "300ms",callback : function() {$("#animate").css3Animate({x : 20,y : 30,time : "500ms",previous : true,callback : function() {reset();}});}});
```

You can create a queue of animations too.

``` js
var tmp = new $.css3AnimateQueue();
var tmp2 = new $.css3AnimateQueue();
tmp.push({id:"animate",x:20,y:30,time:"300ms"});
tmp.push({id:"animate",x:20,y:30,time:"500ms",previous:true});
tmp.push({id:"animate",x:0,y:0,time:"0ms"});
tmp.push({id:"animate",x:20,y:30,time:"300ms"});
tmp.push({id:"animate",x:20,y:30,time:"500ms",previous:true});
tmp.run();
````

#jq.drawer

This is a pull widget like the nofication bar on phones.  Users can pull down or up based on configuration.

to use jq.draw you must do the following

1) Create the container div and give it an id
<div id="drawer" style="position:relative;top:-370px;height:320px;background:black;z-index:0">
   This is some content<br><br>
   This is some content<br><br>
   This is some content<br><br>
   This is some content<br><br>
</div>

2) Create the handle class inside the above div that the users will "pull" and assign the class 'drawer_handle'

``` html
<div id="drawer" style="position:relative;top:-370px;height:320px;background:black;z-index:0">
   This is some content<br><br>
   This is some content<br><br>
   This is some content<br><br>
   This is some content<br><br>

   <div class="drawer_handle" style="height:30px;width:100%;background:orange;position:absolute;bottom:0px;text-align:center;line-height:30px;font-size:14px;color:black;">PULL DOWN</div>
</div>
```

To create the drawer, you do the following

``` js
var drawer = new jq.drawer("drawer",{direction:"down"}); //direction can be up or down
```


# jq.social

This is a wrapper library for making oAuth requests using AppMobi.oauth functions.   Please see the AppMobi.oauth documentation for full details (coming in 3.4.1).
 
To use jq.social you must do the following

1. Register the oauth service in the Enterprise Control Panel (enterprise.appmobi.com)

2. Create an object for each service

``` js
var serviceName="twitter";
var twitter= new jq.social(serviceName);
 ```
 
3. Make the oAuth request for the service

``` js
twitter.makeRequest("https://api.twitter.com/1/statuses/user_timeline.json","get_timeline","GET",printTimeline);
```

makeRequest is the main function you will interact with.  It takes in the following parameters

1. API request url

2. Service id - this should be unique per request url

3. Method - GET/POST (optional defaults to GET) 

4. Callback function (optional) - takes in an event from appMobi.oauth.protected.data

5. Request Body - url parameters to pass in the request


Below is a sample of posting a status update to twitter

``` js
twitter.makeRequest("https://api.twitter.com/1/statuses/update.json","set_update","POST",checkResult,"status=foobar"
```

# jq.shake

To use jq.shake you must do the following

1. Call the javascript function and pass in a callback function to be executed when a shake is detected

``` js
jq.shake(function(){console.log("Shake Detected");});
```

An optional second parameter is a threshold for declaring accelerometer movement as a shake.  The default is 5.  Lowering it will trigger the callback more, raising it will trigger it less.

``` js
jq.shake(function(){console.log("Shake Detected");},10); //More shakes needed to trigger the callback
```

# Contribute

You can contribute to the core code by forking it and make a pull request.  Please keep in mind we do not want to add functionality that is a one-off case.  These are best dealt with via plugins.


# Bugs

Please use github to report any bugs found.  Please provide the following

1. Any error messages from the console

2. Line numbers of offending code

3. Test cases

4. Description of Error

5. Expected result

6. Browser/Device you are testing on


# License

jQ.Web is is licensed under the terms of the MIT License, see the included license.txt file.
