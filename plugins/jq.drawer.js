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
            };

        drawer.prototype = {
            lockY: 0,
            boolScrollLock: false,
            currentDrawer: null,
            maxTop: 0,
            startTop: 0,
            timeMoved: 0,
            vdistanceMoved: 0,
            direction: "down",
            prevTime: 0,
            handle: null,
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

                        if (newTop >= Math.abs(this.maxTop)) return;
                        this.drawerMove(this.currentDrawer, drawerPoints, 0);
                        this.vdistanceMoved += Math.abs(prevTop) - Math.abs(newTop);
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


                    this.maxTop = numOnly(this.el.style.height) - numOnly(this.handle.style.height);
                    if (this.direction == "up") this.maxTop *= -1;
                    if (event.touches.length == 1 && this.boolScrollLock == false) {
                        try {
                            this.startTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(eleScrolling).webkitTransform).f);
                        } catch (e) {
                            this.startTop = 0;
                            console.log("error scroller touchstart " + e);
                        }
                        this.lockY = event.touches[0].pageY;
                        this.currentDrawer = eleScrolling;
                        event.preventDefault();
                    }
                } catch (e) {
                    alert("error in touchStart: " + e);
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
                    if (drawerPoints.y == this.maxTop) this.currentDrawer.style.zIndex = "999";
                    else this.currentDrawer.style.zIndex = "1";

                    this.drawerMove(this.currentDrawer, drawerPoints, 300, "ease-out");
                    this.currentDrawer = null;
                }
                this.vdistanceMoved = 0;
                touchStarted = false;
            },

            drawerMove: function (el, distanceToMove, time, timingFunction) {
                if (!time) time = 0;
                if (!timingFunction) timingFunction = "linear";

                el.style.webkitTransform = "translate" + translateOpen + "0px," + distanceToMove.y + "px" + translateClose;
                el.style.webkitTransitionDuration = time + "ms";
                el.style.webkitBackfaceVisiblity = "hidden";
                el.style.webkitTransitionTimingFunction = timingFunction;
            }
        };
        return drawer;
    })();

    // Helper function to get only
    if (!window.numOnly) {
        function numOnly(val) {
            if (isNaN(parseFloat(val))) val = val.replace(/[^0-9.-]/, "");

            return parseFloat(val);
        }
    }
})(jq);