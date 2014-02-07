#Desktop Browsers

This plugin translate mouse events to touch events on desktop browsers, and MSPointer events to touch events for WP8 and Win8 touch devices.  We do not emulate multi touch.  

##Events

We map the following events.  If you are on a Windows device that supports MSPointer events, we use those.  Otherwise, we translate mouse events.

```
mousedown      ---->     touchstart
mousemove      ---->     touchmove
mouseup        ---->     touchend

//Windows Phone 8/Windows 8 Touch

MSPointerDown  ---->     touchstart
MSPointerMove  ---->     touchmove
MSPointerUp    ---->     touchend
```

Below is the snippet to see if your browser supports "touch" events. If it does not, include the af.desktopBrowser.js plugin.

```
if (!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)) {
    var script = document.createElement("script");
    script.src = "plugins/af.desktopBrowsers.js";
    var tag = $("head").append(script);
}
```