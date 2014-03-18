#Touch Layer

This plugin handles a lot of OS fixes for apps, and is core to App Framework UI.  It handles the following

* 300ms click delay
* bugs from fixing the 300ms click delay
* resizing the viewport to fit the screen
* dispatching scroll events
* handling orientation change and updating the viewport

Simply include the plugin and then call $.touchLayer on the dom node you want to use it on (this can be doucment).

```
//App Framework UI Touch layer
$.touchLayer($("#afui").get(0));
```

Any references to $.touchLayer will return an object now that you can bind events to.

##Events

```
scrollstart            Scroll started on an element in the touch layer
scrollend              Scroll finished on an eelement in the touch layer
enter-edit             A form element recieved focus
exit-edit              A form element lost focus
```

Please see App Framework UI source on how to use this plugin