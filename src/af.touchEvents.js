//Touch events are based from zepto/touch.js
//Many modifications and enhancements made
/**
 * Simply include this in your project to get access to the following touch events on an element
 * tap
 * doubleTap
 * singleTap
 * longPress
 * swipe(Left,Right,Up,Down)
* swipeStart(Left,Right,Up,Down)
 */

(function($) {
    "use strict";
    var touch = {}, touchTimeout;

    function parentIfText(node) {
        return "tagName" in node ? node : node.parentNode;
    }

    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            return (x1 - x2 > 0 ? "Left" : "Right");
        } else {
            return (y1 - y2 > 0 ? "Up" : "Down");
        }
    }

    var longTapDelay = 750;
    function longTap() {
        if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
            touch.el.trigger("longTap");
            touch = {};
        }
    }
    var swipeCounter;
    var longTapTimer;
    var parentChecker=false;
    var didParentCheck=false;
    $(document).ready(function() {
        var prevEl;
        $(document.body).bind("touchstart", function(e) {
            swipeCounter=0;
            if (e.originalEvent)
                e = e.originalEvent;
            if (!e.touches || e.touches.length === 0) return;
            var now = Date.now(), delta = now - (touch.last || now);
            if (!e.touches || e.touches.length === 0) return;
            touch.el = $(parentIfText(e.touches[0].target));
            touchTimeout && clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            touch.x2 = touch.y2 = 0;
            if (delta > 0 && delta <= 250)
                touch.isDoubleTap = true;
            touch.last = now;
            longTapTimer = setTimeout(longTap, longTapDelay);

            if ($.afui.useAutoPressed && !touch.el.attr("data-ignore-pressed"))
                touch.el.addClass("pressed");
            if (prevEl && $.afui.useAutoPressed && !prevEl.attr("data-ignore-pressed") && prevEl[0] !== touch.el[0])
                prevEl.removeClass("pressed");
            prevEl = touch.el;
            parentChecker=false;
            didParentCheck=false;
        }).bind("touchmove", function(e) {
            if(e.originalEvent)
                e = e.originalEvent;
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
            if(!didParentCheck&&(Math.abs(touch.x2-touch.x1)>5||Math.abs(touch.y2-touch.y1)>5))
            {
                var moveX=Math.abs(touch.x2-touch.x1)>5;
                var moveY=Math.abs(touch.y2-touch.y1)>5;

                didParentCheck=true;
                touch.el.trigger("swipeStart",[e]);
                touch.el.trigger("swipeStart" + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)), [touch,e]);
                var parentContainers=touch.el.closest(".swipe, .swipe-reveal, .swipe-x, .swipe-y");
                var elScroller=touch.el.closest(".x-scroll, .y-scroll, .scroll");


                parentChecker=touch.el.closest(".swipe, .swipe-reveal").length!==0;
                if(elScroller.parent(parentContainers).length!==0)
                {
                    parentChecker=false;
                }
                else if(moveX&&touch.el.closest(".swipe-x").length!==0)
                    parentChecker=true;
                else if(moveY&&touch.el.closest(".swipe-y").length!==0)
                    parentChecker=true;
            }

            if($.os.android){
                if(didParentCheck&&parentChecker)
                    e.preventDefault();
            }
            clearTimeout(longTapTimer);
        }).bind("touchend", function(e) {
            if(e.originalEvent)
                e=e.originalEvent;
            if (!touch.el)
                return;
            if ($.afui.useAutoPressed && !touch.el.attr("data-ignore-pressed"))
                touch.el.removeClass("pressed");
            if (touch.isDoubleTap) {
                touch.el.trigger("doubleTap");
                touch = {};
            } else if (touch.x2 > 0 || touch.y2 > 0) {
                (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) &&
                touch.el.trigger("swipe");
                //touch.el.trigger("swipe" + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)), touch);
                //@TODO - don't dispatch when you need to block it (scrolling areas)
                var direction= (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2));
                var scrollDir=".x-scroll";
                var swipeDir=".swipe-x";
                if(direction.toLowerCase()==="up"||direction.toLowerCase()==="down"){
                    scrollDir=".y-scroll";
                    swipeDir=".swipe-y";
                }
                var swipe=touch.el.closest(swipeDir);
                var scroller=touch.el.closest(scrollDir);

                if((swipe.length===0||scroller.length===0)||swipe.find(scroller).length===0)
                {
                    touch.el.trigger("swipe"+direction);
                }

                touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
            } else if ("last" in touch) {
                touch.el.trigger("tap");
                touchTimeout = setTimeout(function() {
                    touchTimeout = null;
                    if (touch.el)
                        touch.el.trigger("singleTap");
                    touch = {};
                }, 250);
            }

        }).bind("touchcancel", function() {
            if(touch.el && $.afui.useAutoPressed && !touch.el.attr("data-ignore-pressed"))
                touch.el.removeClass("pressed");
            touch = {};
            clearTimeout(longTapTimer);
        });
    });

    ["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap", "singleTap", "longTap"].forEach(function(m) {
        $.fn[m] = function(callback) {
            return this.bind(m, callback);
        };
    });
})(jQuery);
