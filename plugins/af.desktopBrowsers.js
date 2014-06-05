/*
 * desktopBrowsers contributed by Carlos Ouro @ Badoo
 * translates desktop browsers events to touch events and prevents defaults
 * It can be used independently in other apps but it is required for using the touchLayer in the desktop
 *
 * @param {Function} $ The appframework selector function
 */
 /* global DocumentTouch*/
(function ($) {
    "use strict";
    var cancelClickMove = false;
    //See if we can create a touch event
    var tmp;
    try {
        tmp = document.createEvent("TouchEvent");
        return;
    } catch (ex) {

    }
    $.os.supportsTouch=true;
    var preventAll = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    var ieThreshold=navigator.userAgent.match(/Phone/i)?2:7;
    /**
     * Stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
     *
     * @param {Event} event
     * @param {HTMLElement} target
     */
    var preventAllButInputs = function(event, target) {
        var tag = target.tagName.toUpperCase();
        if (tag.indexOf("SELECT") > -1 || tag.indexOf("TEXTAREA") > -1 || tag.indexOf("INPUT") > -1) {
            return;
        }
        preventAll(event);
    };
    function TouchList(){
        this.length=0;
    }
    TouchList.prototype = {
        item:function(ind){
            return this[ind];
        },
        _add:function(touch){
            this[this.length]=touch;
            this.length++;            
        }
    };

    var touchIdentifier=1000;
    function Touch() {
        this.touchIdentifier=touchIdentifier++;
    }

    Touch.prototye = {
        "clientX":0,
        "clientY":0,
        "screenX":0,
        "screenY":0,
        "pageX":0,
        "pageY":0,
        "identifier":0
    }



    var redirectMouseToTouch = function (type, originalEvent, newTarget,skipPrevent) {

        var theTarget = newTarget ? newTarget : originalEvent.target;
        if(!skipPrevent)
            preventAllButInputs(originalEvent, theTarget);

        var touchevt = document.createEvent("MouseEvent");

        touchevt.initEvent(type, true, true);
        touchevt.initMouseEvent(type, true, true, window, originalEvent.detail, originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY, originalEvent.ctrlKey, originalEvent.shiftKey, originalEvent.altKey, originalEvent.metaKey, originalEvent.button, originalEvent.relatedTarget);
        touchevt.touches=  new TouchList();
        touchevt.changedTouches = new TouchList();
        touchevt.targetTouches = new TouchList();
        var thetouch=new Touch();
        thetouch.pageX=originalEvent.pageX;
        thetouch.pageY=originalEvent.pageY;
        thetouch.target=originalEvent.target;
        touchevt.changedTouches._add(thetouch);
        if (type !== "touchend") {
            touchevt.touches = touchevt.changedTouches;
            touchevt.targetTouches = touchevt.changedTouches;
        }        
        //target

        touchevt.mouseToTouch = true;
        if ($.os.ie) {
            // handle inline event handlers for target and parents (for bubbling)
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
            redirectMouseToTouch("touchstart", e,null,true);
            cancelClickMove = false;
            prevX=e.clientX;
            prevY=e.clientY;
        }, true);

        document.addEventListener("MSPointerUp", function (e) {
            if (!mouseDown) return;
            redirectMouseToTouch("touchend", e, lastTarget,true); // bind it to initial mousedown target
            lastTarget = null;
            mouseDown = false;
        }, true);
        document.addEventListener("MSPointerMove", function (e) {
            //IE is very flakey...we need 7 pixel movement before we trigger it

            if(Math.abs(e.clientX-prevX)<=ieThreshold||Math.abs(e.clientY-prevY)<=ieThreshold) return;
            if (!mouseDown) return;
            redirectMouseToTouch("touchmove", e, lastTarget,true);

            cancelClickMove = true;

        }, true);
    }

    // prevent all mouse events which don't exist on touch devices
    document.addEventListener("drag", preventAll, true);
    document.addEventListener("dragstart", preventAll, true);
    document.addEventListener("dragenter", preventAll, true);
    document.addEventListener("dragover", preventAll, true);
    document.addEventListener("dragleave", preventAll, true);
    document.addEventListener("dragend", preventAll, true);
    document.addEventListener("drop", preventAll, true);
    // Allow selection of input elements
    document.addEventListener("selectstart", function(e){
        preventAllButInputs(e, e.target);
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

})(this.af);
