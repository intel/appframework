#Scroller

This plugin allows you to create a scrollable area.  We use a JavaScript scroller unless the device supports -webkit-overflow-scrolling:touch .  It has many fixes for Android <3 and iOS native scrolling.

```
$(selector).scroller({}) //create
$(selector).scroller() //get the scroller object
```

## Properties

#### Attributes

```
scrollbars                   (bool) ID of DOM elemenet for the popup container
verticalScroll               (bool) Allow vertical scrolling
horizontalScroll             (bool) Allow horizontal scrolling
useJsScroll                  (bool) Force using the JavaScript scroller
lockBounce                   (bool) Prevent the rubber band effect
autoEnable                   (bool) Auto enable the scroller
refresh                      (bool) Enable pull to refresh
infinite                     (bool) Enable infinite scrolling
initScrollProgress           (bool) Dispatch progress on touch move
vScrollCSS                   (string) Classname for vertical scroll bar
hScrollCSS                   (string) Classname for horizontal scroll bar
```

#### Functions
```
none
```



## Methods

```
enable()                     Enable the scroller
disable()                    Disable the scroller
scrollToBottom(time)         Scroll to the bottom of the content
scrollToTop(time)            Scroll to the top of the content
scrollTo(obj,time)           Scroll to x/y coords
scrollBy(obj,time)           Move the scroller by the x/y coords from the previous spot
addPullToRefresh()           Enable pull to refresh for the scroller
setRefreshContent(string)    Set the pull to refresh content text
addInfinite()                Enable infinite scrolling events
clearInfinite()              Clear internal variables after you've consumed the inifinite-scroll-end event
scrollToItem(DOMNode,time)   Scroll to a specific element on the screen
```

## Events
Events must be registered on the scroller using $.bind()

```
//scroller object events
scrollstart                  Scrolling started on a scroller object
scroll                       Scrolling progress on a scroller object
scrollend                    Scrolling stopped on a scroller object

//pull to refresh
refresh-trigger              Pull to refresh scroll started
refresh-release              Event when pull to refresh is has happened
refresh-cancel               User cancelled pull to refresh by scrolling
refresh-finish               Pull to refresh has finished and hidden

//infinite scroll
infinite-scroll              User scrolled to the bottom of the content
infinite-scroll-end          User finished scrolling

```

## CSS/Customize

Below is an example used by App Framework's iOS7 theme to customize the look and feel of the popup

```
.scrollBar { 
    position: absolute ;
    width: 5px !important;
    height: 20px !important;
    border-radius: 2px !important;
    border: 1px solid black !important;
    background: red !important;
    opacity: 0 !important;
}

```


## Examples

When creating your scroller, first create the HTML element with the width and height of the viewable area you want.

```
||div id="scroll" style='width:100%;height:200;'></div>
```

Now we can create the scroller object

```
var myScroller=$("#scroll").scroller({
   verticalScroll:true,
   horizontalScroll:false,
   autoEnable:true
})
```

You can now call functions on the myScroller object

```
myScroller.addPullToRefresh();
```

You can also fetch the scroller from cache

```
var myScroller=$("#scroll").scroller(); //no parameters
```

##Pull to refresh

The following is an example of how to bind events and implement pull to refresh.  You must use $.bind on the scroller object.

```
myScroller.addPullToRefresh();

//User is dragging the page down exposing the pull to refresh message.
$.bind(myScroller, "refresh-trigger", function () {
    console.log("Refresh trigger");
});

//Here we listen for the user to pull the page down and then let go to start the pull to refresh callbacks.
var hideClose;
$.bind(myScroller, "refresh-release", function () {
    var that = this;
    console.log("Refresh release");
    clearTimeout(hideClose);
    //For the demo, we set a timeout of 5 seconds to show how to hide it asynchronously
    hideClose = setTimeout(function () {
        console.log("hiding manually refresh");
        that.hideRefresh();
    }, 5000);
    return false; //tells it to not auto-cancel the refresh
});

//This event is triggered when the user has scrolled past and the pull to refresh block is no longer available
$.bind(myScroller, "refresh-cancel", function () {
    clearTimeout(hideClose);
    console.log("cancelled");
});
```

##infinite scrolling

The following shows how to implement infinite scrolling.  Like pull to refresh, you must use $.bind on the scroller object.

```
myScroller.addInfinite();

//Bind the infinite scroll event
$.bind(myScroller, "infinite-scroll", function () {
    var self = this;
    console.log("infinite triggered");
    //Append text at the bottom
    $(this.el).append("<div id='infinite' style='border:2px solid black;margin-top:10px;width:100%;height:20px'>Fetching content...</div>");
    //Register for the infinite-scroll-end - this is so we do not get it multiple times, or a false report while infinite-scroll is being triggered;
    $.bind(myScroller, "infinite-scroll-end", function () {
        //unbind the event since we are handling it
        $.unbind(myScroller, "infinite-scroll-end");
        self.scrollToBottom();
        //Example to show how it could work asynchronously
        setTimeout(function () {
            $(self.el).find("#infinite").remove();
            //We must call clearInfinite() when we are done to reset internal variables;
            self.clearInfinite();
            $(self.el).append("<div>This was loaded via inifinite scroll<br>More Content</div>");
            self.scrollToBottom();
        }, 3000);
    });
});
```

