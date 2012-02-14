# jqUi

jqUi is a UI/UX framework for building jqMobi mobile apps targeted at the Webkit browser.

# About

We've had a lot of requests for a UI framework.  There are a numerous mobile frameworks, but cross platform performance is not the best.  Some work great on iOS, but lack performance on Android.  We wanted to create a lightweight framework that is simple for users.  We do not want you to be writing crazy HTML, JavaScript, or CSS.  

# Demo

Please see the kitchensink application as it was built using jqUi

# How to use jqUi

To use jqUi, you need to include the javascript files.  We suggest using jqUi.min.js which has all the necesary files, otherwise include the source for all of them, along with the CSS.  A global variable, $.ui is created by default.  This is what you will use if you need to access it.

We have four special registered div blocks for your layout based off id's.  They are the header, content, navbar and app container

* jQUi - This is the container div.  If you do not include it, we create it and move everything inside.  This is for people who want to use jqUi inside a prexisting project

* header - this is the top header.  You can add additional buttons, turn other events on/off on clicks if you need.  We handle the back button and the title for you.  If this is not present, we will create it. 

* content - this is the content area.  You do not need to add anything here.  All page divs will be added here.  If you put a div in there, it will be shown first.

    Each div inside will need the class "panel".  jqUi will search for all elements with that classname and add them automatically.  These will scroll by default.
	
* navbar - this is the bottom navbar.  You can put your navigation buttons here.  We reset the history queue when you switch the navigation buttons.  This is optional.  If you do not include it, it will not be shown.

* You can manipulate the height of the divs via the CSS class.  If you do not want the header to be shown, you can set the display property to none.

* To add divs to the content, simply set the class to "panel".  This is a special css class that we search for at startup.
 
* jq.scroller is added automatically, along with jq.selectBox, jq.passwordBox, and jq.css3animate.

* Linking to pages - You can link two ways.  You can link to a file by setting the URL, which will load via AJAX.  Or you can set the href property to "#div_id"
``` html
<a href="#login">Login</a>
```

* We automatically launch the app for you.  If you would like to launch jqUi yourself, do the following
``` js
<script>
jq.ui.autoLaunch=false;
<script>
```	

* We throw an event when jqUi.launch has completed if you need one.  There is also a ready function
``` js
document.addEventListener("jq.ui.ready",jqUiLaunched,false);
jq.ui.ready(function(){});
```

* Ajax - using AppMobi, you can do cross domain requests.   We will crawl the pages and wire any links found.  We added new features to add the content to the dom, force refresh and more.
 

# jqUi semi-public methods

``` js
.ready(function) //Takes in a function and executes it when .launch has completed
.launch() //Manually invoke the launch of jqUi
.goBack() //Takes the user back in the history
.clearHistory() //Clears the history stack
.addContentDiv (el, content, refresh, refreshFunc) //Adds a div to the DOM and wires it up.  refresh and refreshFunc are used for the jq.scroller pull to refresh functions
.updateAnchors(element,resetHistoryOnClick) //Loops throuh a div and finds all anchors and wires them up for transitions, etc.  If resetHistoryOnClick is true, it will clear the history when the links are clicked
.setTitle(text) //Sets the page title via javascript
.setBackButtonText(text) //Sets the back button text
.showMask() //Shows the loading mask
.hideMask() //Hides the loading mask
.loadContent(target,newTab,goBackInHistory,transition); //Force a transition call via javascript. target is an element ID or URL.  newTab clears the stack as if a bottom navbar button was pressed.  goBackInHistory is the same as a back button being pressed.  Transition is the transition to show.
.updateBage(target,value) //Creates a badge on a target
.removeBadge(target) //Roves the bagde for the target
.scrollToTop(div_id) //Will scroll a content panel to the top of the page.  Usefull for "Go to Top" links
.toggleSideMenu() //Will hide or show the side menu
.toggleNavMenu() //will hide or show the bottom nav menu
.toggleHeaderMenu() //Will hide or show the header menu
```


#jqUi Side Menu

You can add a side menu by creating <nav> elements.  You can assign them to panels by setting the data-nav attribute.  Note, the first nav is the default and will be shown unless specificied with the data-nav attribute.
On tablets, this will be shown by default

``` html
<div id="welcome" data-nav="mainnav">
</div>
<nav id="mainnav">
 <h2>This is a custom nav</h2>
</nav>
```

#jqUi Custom Footers
You can add additional footer menus that can be assigned to each panel.

``` html
<div id="welcome" data-footer="footerui2">
</div>
 <footer id='footerui2'>
	 <div class="horzRule"></div>
      <a href="#main" id='navbar_home' class='navbar_home' >Home <span class='jq-badge lr'>6</span></a>
      <a href="#jqmtransitions" id='navbar_js' class="navbar_js" >Trans</a>
	  <a href="#jqmui" id='navbar_ui'  class="navbar_ui" >ui</a>
	  <a href="#uiapi" id='navbar_plugins'  class="navbar_plugins" >api</a>
</footer>	
```


#jqUi anchor properties

Anchors can have special properties for wiring transitions and events

``` html
<a href="#id" data-transition="pop">Pop</a>  //data-transition allows you to set the transtion
<a href="http://www.mysite.com/api/getdata" data-refresh-ajax="true">Get Latest Data</a> //data-refresh-ajax allows you to always get the latest data from an Ajax request
<a href="http://www.mysite.com/api/twitterfeed" data-pull-scroller="true">Get latest twitter feed</a> // data-pull-scroller will tell the scrolling div to enable Pull to Refresh
<a href="http://www.mysite.com/api/twitterfeed" data-persist-ajax="true">Add this to the dom</a> // data-persist-ajax will take the result and add it to the dom.  When users navigate to that URL now, it will no longer make an Ajax refresh and adds the div to the container. 
``` 

#jqUi panel properties

Each div/panel has properties you can set that will change the app.  Below are the properties
``` html
   data-footer = "_id_"  //Change the custom footer
   
   data-nav = "_id_" //Change the custom nav
   
   data-load="function_name" //Function that is called when a panel is loaded - passes in the div
   
   data-unload="function_name" //Function that is called when a panel is unloaded - passes in the div
   
   data-modal="true" //Load the panel in a modal window
   
   data-defer="filename.html" //Defer loading teh panel until $.ui.ready and specify the path of the html file to load
```
# Tips

* Ajax - you can add an ajax request into the DOM that will be accessible by the URL referenced by setting the data-persist attribute.  You can force a refresh by setting data-refresh-ajax="true".  You can also make the scroller "pull to refresh" by setting data-pull-scroller="true"

``` html
    <a href="http://www.appmobi.com" data-persist="true">AppMobi</a>  //Div will be added to the dom
    <a href="http://www.appmobi.com" data-persist="true" data-refresh-ajax="true">AppMobi</a>  //Everytime the link is clicked, it will fetch the data
    <a href="http://www.appmobi.com" data-pull-scroller="true">AppMobi</a>  //When the scroller content is pulled down, it will refresh the page
```	

* To open links in a new window, set the target property

``` html
    <a href="http://www.appmobi.com" target="_blank">AppMobi</a>
```

* We handle history and transitions.  You can select from six transitions by setting the data-transition property.  The default is slide.

``` html
    <a href="#login" data-transition="slide">Login</a>  //slide left/right
    <a href="#login" data-transition="up">Login</a>  //slide up/down
    <a href="#login" data-transition="down">Login</a>  //slide down/up
    <a href="#login" data-transition="flip">Login</a>  //Flip the page
    <a href="#login" data-transition="fade">Login</a>  //Fade in/out
    <a href="#login" data-transition="pop">Login</a>  //Pop in/out
```
	
* To update the content of a div, you must call the function updateContentDiv(_id_,_content_);

``` js
<script>$.ui.updateContentDiv("login","New Login HTML");
```	

* To dynamically add a new div, you can call the function addContentDiv(_id_,_content_);

``` js
<script>$.ui.addContentDiv("newdiv","This is some new html");
```	

* To navigate to a a page transition via javascript, you can call the function loadContent(_id_,clearHistory,goBackInHistory,transition)

``` js
<scritp>$.ui.loadContent("my_id",false,false,"pop");</script>
```

* To prevent a div from scrolling, set the property "scrolling" to "no" on the div

``` html
<div class="panel" scrolling="no"></div>
```

* To get the current active div/page

``` html
<script>$.ui.activeDiv //reference to the div</script>
<script>var activeId=$.ui.activeDiv.id</script>
``` 
	
* To make the back button text static

``` html
<script>$.ui.backButtonText="Back...";</script>
```

* To change the back button text dynamically

``` html
<script>$.ui.setBackButtonText("Go Back");</script>
```

* To reprocess a div and autowire the anchors again

``` html
<script $.ui.updateAnchors(_element);</script>	
```
	
* You can assign a javascript function to be executed on panel load and unload.
   
``` html
<script>
function getApps(targetDiv)
{
    targetDiv.innerHTML="The id called = "+obj.id;
}
function getAppsClosed(targetDiv)
{
    targetDiv.innerHTML="The id called = "+obj.id+" and the panel was unloaded";
}
</script>
<a href="#games" data-function="getApps" data-load="getApps" data-onunload="getAppsClosed"> Games </a>
```
	
* Please see jqUi.css for additional button colors and ways to change the theme				

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

jqUi is is licensed under the terms of the MIT License, see the included license.txt file.


