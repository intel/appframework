//desktopBrowsers contributed by Carlos Ouro @ Badoo
//translates desktop browsers events to touch events and prevents defaults
//It can be used independently in other apps but it is required for using the touchLayer in the desktop
/* global af*/
(function ($) {
    "use strict";
    var cancelClickMove = false;
    var preventAll = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };

    var redirectMouseToTouch = function (type, originalEvent, newTarget) {

        var theTarget = newTarget ? newTarget : originalEvent.target;

        //stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
        if (theTarget.tagName.toUpperCase().indexOf("SELECT") === -1 &&
            theTarget.tagName.toUpperCase().indexOf("TEXTAREA") === -1 &&
            theTarget.tagName.toUpperCase().indexOf("INPUT") === -1) //SELECT, TEXTAREA & INPUT
        {
            preventAll(originalEvent);
        }

        var touchevt = document.createEvent("MouseEvent");

        touchevt.initEvent(type, true, true);
        touchevt.initMouseEvent(type, true, true, window, originalEvent.detail, originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY, originalEvent.ctrlKey, originalEvent.shiftKey, originalEvent.altKey, originalEvent.metaKey, originalEvent.button, originalEvent.relatedTarget);
        if (type !== "touchend") {
            touchevt.touches = [];
            touchevt.touches[0] = {};
            touchevt.touches[0].pageX = originalEvent.pageX;
            touchevt.touches[0].pageY = originalEvent.pageY;
            //target
            touchevt.touches[0].target = theTarget;
            touchevt.changedTouches = touchevt.touches;
            touchevt.targetTouches = touchevt.touches;
        }
        //target

        touchevt.mouseToTouch = true;
        if ($.os.ie) {
            //handle inline event handlers for target and parents (for bubbling)
            var elem = originalEvent.target;
            while (elem !== null) {
                if (elem.hasAttribute("on" + type)) {
                    eval(elem.getAttribute("on" + type));
                }
                elem = elem.parentElement;
            }
        }
        theTarget.dispatchEvent(touchevt);
    };

    var mouseDown = false,
        lastTarget = null,
        prevX=0,
        prevY=0;
    if (!window.navigator.msPointerEnabled) {

        document.addEventListener("mousedown", function (e) {
            mouseDown = true;
            lastTarget = e.target;
            if (e.target.nodeName.toLowerCase() === "a" && e.target.href.toLowerCase() === "javascript:;")
                e.target.href = "#";
            redirectMouseToTouch("touchstart", e);
            cancelClickMove = false;
            prevX=e.clientX;
            prevY=e.clientY;
        }, true);

        document.addEventListener("mouseup", function (e) {
            if (!mouseDown) return;
            redirectMouseToTouch("touchend", e, lastTarget); //bind it to initial mousedown target
            lastTarget = null;
            mouseDown = false;
        }, true);

        document.addEventListener("mousemove", function (e) {
            if(e.clientX===prevX&&e.clientY===prevY) return;
            if (!mouseDown) return;
            redirectMouseToTouch("touchmove", e, lastTarget);
            e.preventDefault();

            cancelClickMove = true;
        }, true);
    } else { //Win8
        var skipMove=false;
        document.addEventListener("MSPointerDown", function (e) {

            mouseDown = true;
            skipMove=true;
            lastTarget = e.target;
            if (e.target.nodeName.toLowerCase() === "a" && e.target.href.toLowerCase() === "javascript:;")
                e.target.href = "";
            redirectMouseToTouch("touchstart", e);
            cancelClickMove = false;
            prevX=e.clientX;
            prevY=e.clientY;
            //  e.preventDefault();e.stopPropagation();
        }, true);

        document.addEventListener("MSPointerUp", function (e) {
            if (!mouseDown) return;
            redirectMouseToTouch("touchend", e, lastTarget); //bind it to initial mousedown target
            lastTarget = null;
            mouseDown = false;
            //	e.preventDefault();e.stopPropagation();
        }, true);

        document.addEventListener("MSPointerMove", function (e) {
            if(skipMove){
                skipMove=false;
                return;
            }
            if(e.clientX===prevX&&e.clientY===prevY) return;
            if (!mouseDown) return;
            redirectMouseToTouch("touchmove", e, lastTarget);
            e.preventDefault();
            //e.stopPropagation();

            cancelClickMove = true;

        }, true);
    }


    //prevent all mouse events which dont exist on touch devices
    document.addEventListener("drag", preventAll, true);
    document.addEventListener("dragstart", preventAll, true);
    document.addEventListener("dragenter", preventAll, true);
    document.addEventListener("dragover", preventAll, true);
    document.addEventListener("dragleave", preventAll, true);
    document.addEventListener("dragend", preventAll, true);
    document.addEventListener("drop", preventAll, true);
    //Allow selection of input elements
    document.addEventListener("selectstart", function(e){
        var theTarget = e.target;
        if (theTarget.tagName.toUpperCase().indexOf("SELECT") === -1 &&
            theTarget.tagName.toUpperCase().indexOf("TEXTAREA") === -1 &&
            theTarget.tagName.toUpperCase().indexOf("INPUT") === -1) //SELECT, TEXTAREA & INPUT
        {
            preventAll(e);
        }
    }, true);
    document.addEventListener("click", function (e) {
        if (!e.mouseToTouch && e.target === lastTarget) {
            preventAll(e);
        }
        if (cancelClickMove) {
            preventAll(e);
            cancelClickMove = false;
        }
    }, true);


    window.addEventListener("resize", function () {
        var touchevt = document.createEvent("Event");
        touchevt.initEvent("orientationchange", true, true);
        document.dispatchEvent(touchevt);
    }, false);

})(af);
