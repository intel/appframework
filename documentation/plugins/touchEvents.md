#Touch Events

This plugin adds additional touch events that you can register to listen for.  Simply include the plugin and it will do the rest.

##Events

```
tap                  Tap on the element
singleTap            Single tap on the elem (250ms delay after tap is triggered)
doubleTap            Double tap (quick) on the element
longTap              Long press on the element
swipe                The element was swiped (30px threshold)
swipeLeft            The element was swiped left
swipeRight           The element was swiped right
swipeUp              The element was swiped up
swipeDown            The element was swiped down
```

##Listening

You can listen for any of the events like any other event

```
$("#element").bind("doubleTap",function(){});
```