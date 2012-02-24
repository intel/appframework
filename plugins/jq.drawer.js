/**
 * jq.web.drawer - a drawer for html5 mobile apps
 * Copyright 2011 - AppMobi 
 */ (function ($) {
    $.fn["drawer"] = function (opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new drawer(this[i], opts);
        }
        return this.length == 1 ? tmp : this;
    };
    var drawer = (function () {
        if (!window.WebKitCSSMatrix) return;
        var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
        var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";
        var touchStarted = false;

        var drawer = function (elID, opts) {
                if (typeof elID == "string" || elID instanceof String) {
                    this.el = document.getElementById(elID);
                } else {
                    this.el = elID;
                }
                if (!this.el) {
                    alert("Could not find element for drawer " + elID);
                    return;
                }

                if (this instanceof drawer) {
                    for (j in opts) {
                        this[j] = opts[j];
                    }
                } else {
                    return new drawer(elID, opts);
                }
                this.direction=this.direction.toLowerCase();
                try {
                    this.handle = this.el.querySelectorAll(".drawer_handle")[0];
                    if (!this.handle) return alert("Could not find handle for drawer -  " + elID);
                    var that = this;
                    this.handle.addEventListener('touchmove', function (e) {
                        that.touchMove(e);
                    }, false);
                    this.handle.addEventListener('touchend', function (e) {
                        that.touchEnd(e);
                    }, false);

                } catch (e) {
                    alert("error adding drawer" + e);
                }
                this.zIndex=$(this.el).css("zIndex");
            };

        drawer.prototype = {
            lockY: 0,
            lockX:0,
            boolScrollLock: false,
            currentDrawer: null,
            maxTop: 0,
            startTop: 0,
            maxLeft:0,
            startLeft:0,
            timeMoved: 0,
            vdistanceMoved: 0,
            hdistanceMoved:0,
            direction: "down",
            prevTime: 0,
            handle: null,
            zIndex:1,
            // horizontal scrolling
            // handle the moving function
            touchMove: function (event) {
                try {
                    if (!touchStarted) {
                        touchStarted = true;
                        this.touchStart(event);
                    }
                    if (this.currentDrawer != null) {
                        event.preventDefault();
                        var drawerPoints = {
                            x: 0,
                            y: 0
                        };
                        if(this.direction=="down"||this.direction=="up"){
                            var newTop = 0,
                                prevTop = 0;
                            var deltaY = this.lockY - event.touches[0].pageY;
                            deltaY = -deltaY;
                            var newTop = this.startTop + deltaY;
                            var top = -newTop;
                            try {
                                var prevTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f);
                            } catch (prevTopE) {
                                var prevTop = 0;
                            }
                            drawerPoints.y = newTop;
                            this.vdistanceMoved += Math.abs(prevTop) - Math.abs(newTop);
                        }
                        else {
                            var newLeft = 0,
                                prevLeft = 0;
                            var deltaX = this.lockX - event.touches[0].pageX;
                            deltaX = -deltaX;
                            var newLeft = this.startLeft + deltaX;
                            var left = -newLeft;
                            try {
                                var prevLeft = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e);
                            } catch (prevTopE) {
                                var prevLeft = 0;
                            }
                            drawerPoints.x = newLeft;
                            this.hdistanceMoved += Math.abs(prevLeft) - Math.abs(newLeft);
                        }
                        this.drawerMove(this.currentDrawer, drawerPoints, 0);
                    }
                } catch (e) {
                    alert("error in scrollMove: " + e);
                }
            },

            touchStart: function (event) {

                var handle = this.handle;
                var eleScrolling = this.el;
                if (!handle) return;

                try {
                    // Allow interaction to legit calls, like select boxes, etc.
                    if (event.touches[0].target && event.touches[0].target.type != undefined) {
                        var tagname = event.touches[0].target.tagName.toLowerCase();
                        if (tagname == "select" || tagname == "input" || tagname == "button") // stuff we need to allow
                        // access to
                        return;
                    }
                    this.vdistanceMoved = 0;
                    this.hdistanceMoved = 0;

                    this.maxTop = numOnly(this.el.style.height) - numOnly(this.handle.style.height);
                    this.maxLeft = numOnly(this.el.style.width) - numOnly(this.handle.style.width);
                    
                    if (this.direction == "up") this.maxTop *= -1;
                    if (this.direction=="left") this.maxLeft*=-1;
                    if (event.touches.length == 1 && this.boolScrollLock == false) {
                        try {
                            this.startTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(eleScrolling).webkitTransform).f);
                            this.startLeft = numOnly(new WebKitCSSMatrix(window.getComputedStyle(eleScrolling).webkitTransform).e);
                        } catch (e) {
                            this.startTop = 0;
                            this.startLeft=0;
                            console.log("error drawer touchstart " + e);
                        }
                        this.lockY = event.touches[0].pageY;
                        this.lockX=event.touches[0].pageX;
                        this.currentDrawer = eleScrolling;
                        event.preventDefault();
                    }
                } catch (e) {
                    alert("error in drawer start: " + e);
                }
            },

            // touchend callback. Set the current scrolling object and scrollbar to
            // null
            touchEnd: function (event) {
                if (this.currentDrawer != null) {
                    event.preventDefault();
                    event.stopPropagation();

                    var drawerPoints = {
                        x: 0,
                        y: 0
                    };
                    if(this.direction=="up"||this.direction=="down"){
                        var myDistance = -this.vdistanceMoved;
                        var percentMoved = Math.ceil(Math.abs(myDistance) / Math.abs(this.maxTop) * 100);
                        var prevTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f);
                        if (percentMoved > 17) {

                            if (myDistance > 0) drawerPoints.y = this.maxTop;
                            else drawerPoints.y = 0;
                        } else {
                            if (Math.floor(this.maxTop / prevTop) > 2) drawerPoints.y = 0;
                            else drawerPoints.y = this.maxTop;
                        }
                        
                    }
                    else {
                        var myDistance = -this.hdistanceMoved;
                        var percentMoved = Math.ceil(Math.abs(myDistance) / Math.abs(this.maxLeft) * 100);
                        var prevLeft = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e);
                        if (percentMoved > 17) {

                            if (myDistance > 0) drawerPoints.x = this.maxLeft;
                            else drawerPoints.x = 0;
                        } else {
                            if (Math.floor(this.maxLeft / prevLeft) > 2) drawerPoints.y = 0;
                            else drawerPoints.x = this.maxLeft;
                        }                        
                    }
                    if(drawerPoints.y>0||drawerPoints.x>0)
                       this.el.zIndex="9999";
                    else
                       this.el.zIndex=this.zIndex;

                    this.drawerMove(this.currentDrawer, drawerPoints, 300, "ease-out");
                    this.currentDrawer = null;
                }
                this.vdistanceMoved = 0;
                touchStarted = false;
            },

            drawerMove: function (el, distanceToMove, time, timingFunction) {
                if (!time) time = 0;
                if (!timingFunction) timingFunction = "linear";

                el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x+"px," + distanceToMove.y + "px" + translateClose;
                el.style.webkitTransitionDuration = time + "ms";
                el.style.webkitBackfaceVisiblity = "hidden";
                el.style.webkitTransitionTimingFunction = timingFunction;
            }
        };
        return drawer;
    })();
})(jq);