/**
 * jq.scroller - a scrolling library for jqMobi apps
 * Copyright 2011 - AppMobi 
 */ 
 (function($) {
    var cache = [];
    $.fn["scroller"] = function(opts) {
        var tmp;
        if (opts === undefined && this.length > 0) 
        {
            return cache[this[0].id] ? cache[this[0].id] : null;
        }
        for (var i = 0; i < this.length; i++) {
            tmp = new scroller(this[i], opts);
            if (this[i].id)
                cache[this[i].id] = tmp;
        }
        return this.length == 1 ? tmp : this;
    };
    var scroller = (function() {
        if (!window.WebKitCSSMatrix)
            return;
        var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
        var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";
        var touchStarted = false;
        
        var scroller = function(elID, opts) {
            
            if (typeof elID == "string" || elID instanceof String) {
                this.el = document.getElementById(elID);
            } else {
                this.el = elID;
            }
            if (!this.el) {
                alert("Could not find element for scroller " + elID);
                return;
            }
            
            if (this instanceof scroller) {
                for (j in opts) {
                    this[j] = opts[j];
                }
            } else {
                return new scroller(elID, opts);
            }
            try {
                this.container = this.el.parentNode;
                this.initEvents();
                var windowHeight = window.innerHeight;
                var windowWidth = window.innerWidth;
                
                
                if (this.verticalScroll && this.verticalScroll == true && this.scrollBars == true) {
                    var scrollDiv = createScrollBar(5, 20);
                    scrollDiv.style.top = "0px";
                    if (this.vScrollCSS)
                        scrollDiv.className = this.vScrollCSS;
                    scrollDiv.style.opacity = "0";
                    this.container.appendChild(scrollDiv);
                    this.vscrollBar = scrollDiv;
                    scrollDiv = null;
                }
                if (this.horizontalScroll && this.horizontalScroll == true && this.scrollBars == true) {
                    var scrollDiv = createScrollBar(20, 5);
                    scrollDiv.style.bottom = "0px";
                    
                    if (this.hScrollCSS)
                        scrollDiv.className = this.hScrollCSS;
                    scrollDiv.style.opacity = "0";
                    this.container.appendChild(scrollDiv);
                    this.hscrollBar = scrollDiv;
                    scrollDiv = null;
                }
                if (this.horizontalScroll)
                    this.el.style['float'] = "left";
                this.el.hasScroller=true;
            } catch (e) {
                alert("error adding scroller" + e);
            }
        
        };
        
        function createScrollBar(width, height) {
            var scrollDiv = document.createElement("div");
            scrollDiv.style.position = 'absolute';
            scrollDiv.style.width = width + "px";
            scrollDiv.style.height = height + "px";
            scrollDiv.style.webkitBorderRadius = "2px";
            scrollDiv.style.opacity = 0;
            scrollDiv.className = 'scrollBar';
            scrollDiv.style.background = "black";
            return scrollDiv;
        }
        
        scroller.prototype = {
            lockX: 0,
            lockY: 0,
            boolScrollLock: false,
            currentScrollingObject: null,
            bottomMargin: 0,
            maxTop: 0,
            startTop: 0,
            verticalScroll: true,
            horizontalScroll: false,
            scrollBars: true,
            vscrollBar: null,
            hscrollBar: null,
            hScrollCSS: "scrollBar",
            vScrollCSS: "scrollBar",
            divHeight: 0,
            lastScrollbar: "",
            timeMoved: 0,
            vdistanceMoved: 0,
            hdistanceMoved: 0,
            prevTime: 0,
            finishScrollingObject: null,
            container: null,
            maxLeft: 0,
            startLeft: 0,
            rightMargin: 0,
            divWidth: 0,
            refresh: false,
            refreshFunction: null,
            listeners: {
                start: "",
                move: "",
                end: ""
            },
            elementScrolling:false,
            scrollingFinishCB:false,
            handleEvent: function(e) {
        		switch(e.type) {
        			case 'touchstart': this.touchStart(e); break;
        			case 'touchmove': this.touchMove(e); break;
        			case 'touchend': this.touchEnd(e); break;
        		}
        	},
            initEvents: function () {
        		this.el.addEventListener('touchstart', this, false);
                this.el.addEventListener('touchmove', this, false);
    			this.el.addEventListener('touchend', this, false);
            },
            removeEvents: function () {
            	this.el.removeEventListener('touchstart', this);
                this.el.removeEventListener('touchmove', this);
    			this.el.removeEventListener('touchend', this);
            },
            hideScrollbars: function() {
                if (this.hscrollBar)
                {
                    this.hscrollBar.style.opacity = 0
                    this.hscrollBar.style.webkitTransitionDuration = "0ms";
                }
                if (this.vscrollBar){
                    this.vscrollBar.style.opacity = 0
                    this.vscrollBar.style.webkitTransitionDuration = "0ms";
                }
            },
            touchStart: function(event) {
                var container = this.container;
                var eleScrolling = this.el;
                that=this;
                if (!container)
                    return;
                if(this.elementScrolling){
                   clearTimeout(that.scrollingFinishCB);
                }
                touchStarted = true
                try {
                    // Allow interaction to legit calls, like select boxes, etc.
                    if (event.touches[0].target && event.touches[0].target.type != undefined) {
                        var tagname = event.touches[0].target.tagName.toLowerCase();
                        if (tagname == "select" || tagname == "input" || tagname == "button") // stuff we need to allow
                            // access to
                            return;
                    }
                    //Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
                    if (this.refresh && this.refresh == true && document.getElementById(this.el.id + "_pulldown") == null) {
                        //add the refresh div
                        var text = jq("<div id='" + this.el.id + "_pulldown' class='jqscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;top:0px;margin-left:5px;margin-right:5px;position:absolute;-webkit-transform: translate3d(0, -65px, 0);top:0,left:0,right:0;text-align:center;line-height:60px;color:white;'>Pull to Refresh</div>").get();
                        text.style.width = this.container.clientWidth + "px";
                        $(this.el).prepend(text);
                    }
                    
                    
                    this.timeMoved = 0;
                    this.vdistanceMoved = 0;
                    this.hdistanceMoved = 0;
                    this.prevTime = null;
                    this.finishScrollingObject = null;
                    var cnt=$(container);
                    this.bottomMargin = container.clientHeight > window.innerHeight ? window.innerHeight : container.clientHeight-numOnly(cnt.css("marginTop"))-numOnly(cnt.css("paddingTop"))-numOnly(cnt.css("marginBottom"))-numOnly(cnt.css("paddingBottom")); //handle css offsets
                    this.maxTop = eleScrolling.clientHeight - this.bottomMargin;
                    this.divHeight = eleScrolling.clientHeight;
                    this.rightMargin = container.clientWidth > window.innerWidth ? window.innerWidth : container.clientWidth-numOnly(cnt.css("marginLeft"))-numOnly(cnt.css("paddingLeft"))-numOnly(cnt.css("marginRight"))-numOnly(cnt.css("paddingRight"));
                    this.maxLeft = eleScrolling.clientWidth - this.rightMargin;
                    this.divWidth = eleScrolling.clientWidth;
                    if (this.maxTop < 0 && this.maxLeft < 0)
                        return;
                    
                    this.lockX = event.touches[0].pageX;
                    this.lockY = event.touches[0].pageY;
                    if (event.touches.length == 1 && this.boolScrollLock == false) {
                        try {
                            this.startTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(eleScrolling).webkitTransform).f) - numOnly(this.container.scrollTop);
                            this.startLeft = numOnly(new WebKitCSSMatrix(window.getComputedStyle(eleScrolling).webkitTransform).e) - numOnly(this.container.scrollLeft);
                        
                        } catch (e) {
                            this.startTop = 0 + this.container.scrollTop;
                            this.startLeft = 0 + this.container.scrollLeft;
                            console.log("error scroller touchstart " + e);
                        }
                        this.container.scrollTop = this.container.scrollLeft = 0;
                        this.currentScrollingObject = eleScrolling;
                        this.scrollerMoveCSS(eleScrolling, {
                            x: this.startLeft,
                            y: this.startTop
                        }, 0);
                        if (this.vscrollBar && this.maxTop > 0) {
                            this.vscrollBar.style.height = (parseFloat(this.bottomMargin / this.divHeight) * this.bottomMargin) + "px";
                            var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.maxTop + this.startTop) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
                            this.scrollerMoveCSS(this.vscrollBar, {
                                x: 0,
                                y: pos
                            }, 0);
                            
                            
                            if (this.container.clientWidth > window.innerWidth)
                                this.vscrollBar.style.left = (window.innerWidth - numOnly(this.vscrollBar.style.width) * 3) + "px";
                            else
                                this.vscrollBar.style.right = "0px";
                            this.vscrollBar.webkitTransition = '';
                            this.vscrollBar.style.opacity = 1;
                        }
                        
                        if (this.hscrollBar && this.maxLeft > 0) {
                            this.hscrollBar.style.width = (parseFloat(this.rightMargin / this.divWidth) * this.rightMargin) + "px";
                            var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.maxTop + this.startLeft) / this.maxtLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
                            this.scrollerMoveCSS(this.hscrollBar, {
                                x: pos,
                                y: 0
                            }, 0);
                            if (this.container.clientHeight > window.innerHeight)
                                this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height)) + "px";
                            else
                                this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
                            this.vscrollBar.webkitTransition = '';
                            
                            this.hscrollBar.style.opacity = 1;
                        }

                    //event.preventDefault();
                    // get the scrollbar
                    }
                } catch (e) {
                    alert("error in scrollStart: " + e);
                }
            },
            touchMove: function(event) {
                try {
                  
                    if (this.currentScrollingObject != null) {
                        event.preventDefault();
                        var scrollPoints = {
                            x: 0,
                            y: 0
                        };
                        var scrollbarPoints = {
                            x: 0,
                            y: 0
                        };
                        var newTop = 0, 
                        prevTop = 0, 
                        newLeft = 0, 
                        prevLeft = 0;
                        
                        if (this.verticalScroll && this.maxTop > 0) {
                            var deltaY = this.lockY - event.touches[0].pageY;
                            deltaY = -deltaY;
                            var newTop = this.startTop + deltaY;
                            var top = -newTop;
                            try {
                                var prevTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f);
                            } catch (prevTopE) {
                                var prevTop = 0;
                            }
                            
                            scrollPoints.y = newTop;
                        }
                        if (this.horizontalScroll && this.maxLeft > 0) {
                            var deltaX = this.lockX - event.touches[0].pageX;
                            deltaX = -deltaX;
                            var newLeft = this.startLeft + deltaX;
                            var left = newLeft;
                            try {
                                var prevLeft = -numOnly((new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e));
                            } catch (prevLeftE) {
                                var prevLeft = 0;
                            }
                            scrollPoints.x = left;
                        
                        }
                        var time = 0;
                        if ((this.maxTop > 0) && (scrollPoints.y > 0 || scrollPoints.y < -1 * this.maxTop)) 
                        {
                            
                            var overflow = scrollPoints.y > 0 ? (scrollPoints.y) : -1 * (scrollPoints.y + this.maxTop);
                            var height = (this.container.clientHeight - overflow) / this.container.clientHeight;
                            if (height < .5)
                                height = .5;
                            if (scrollPoints.y > 0)
                                scrollPoints.y = scrollPoints.y * height;
                            else {
                                scrollPoints.y = scrollPoints.y - ((scrollPoints.y + this.maxTop) * height);
                            
                            }
                        }
                        this.scrollerMoveCSS(this.currentScrollingObject, scrollPoints, time);
                        
                        if (this.vscrollBar) {
                            // We must calculate the position. Since we don't allow
                            // the page to scroll to the full content height, we use
                            // maxTop as height to work with.
                            var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.maxTop + newTop) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
                            this.scrollerMoveCSS(this.vscrollBar, {
                                x: 0,
                                y: pos
                            }, 0);
                        }
                        if (this.hscrollBar) {
                            // We must calculate the position. Since we don't allow
                            // the page to scroll to the full content height, we use
                            // maxTop as height to work with.
                            var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.maxLeft + newLeft) / this.maxLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
                            this.scrollerMoveCSS(this.hscrollBar, {
                                x: pos,
                                y: 0
                            }, 0);
                        }
                        
                        if (this.prevTime) {
                            var tmpDistanceY = Math.abs(prevTop) - Math.abs(newTop);
                            var tmpDistanceX = Math.abs(prevLeft) - Math.abs(newLeft);
                            var tmpTime = event.timeStamp - this.prevTime;
                            if (tmpTime < 500) { // movement is under a second,
                                // keep adding the differences
                                this.timeMoved += tmpTime;
                                this.vdistanceMoved += tmpDistanceY;
                                this.hdistanceMoved += tmpDistanceX;
                            } else { // We haven't moved in a second, lets reset
                                // the variables
                                this.timeMoved = 0;
                                this.vdistanceMoved = 0;
                                this.hdistanceMoved = 0;
                            }
                        }
                        this.prevTime = event.timeStamp;
                    }
                } catch (e) {
                    alert("error in scrollMove: " + e);
                }
            },
            touchEnd: function(event) {
                
                if (this.currentScrollingObject != null) {
                    //if (this.timeMoved == 0) 
                    //{
                        //event.preventDefault();
                       // if (this.onclick !== undefined)
                     //       this.onclick();
                      //  return false;
                   // }
                   
                    event.preventDefault();
                    this.finishScrollingObject = this.currentScrollingObject;
                    this.currentScrollingObject = null;
                    var scrollPoints = {
                        x: 0,
                        y: 0
                    };
                    var time = 300;
                    var moveY;
                    if (this.verticalScroll && this.maxTop > 0) {
                        var myDistance = -this.vdistanceMoved;
                        var time = this.timeMoved;
                        
                        
                        var move = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f);
                        moveY = move;
                        
                        var data = this.calculateMomentum(myDistance, time);
                        time = data.time;
                        if (move < 0)
                            move = move - data.dist;
                        
                        if (move > 0) {
                            move = 0;
                            time = 200;
                        }
                        
                        if (move < (-this.maxTop)) {
                            move = -this.maxTop;
                            time = 200;
                        }
                        
                        scrollPoints.y = move;
                    }
                    if (this.horizontalScroll && this.maxLeft > 0) {
                        var myDistance = -this.hdistanceMoved;
                        var time = this.timeMoved;
                        
                        var move = (new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e);
                        var data = this.calculateMomentum(myDistance, time);
                        time = data.time;
                        if (move < 0)
                            move = move - data.dist;
                        
                        if (move > 0) {
                            move = 0;
                            time = 200;
                        }
                        
                        if (move < (-this.maxLeft)) {
                            move = -this.maxLeft;
                            time = 200;
                        }
                        scrollPoints.x = move;
                    }
                    var that = this;
                    if (this.refresh && moveY > 60) {
                        if (this.refreshFunction) {
                            this.refreshFunction.call();
                        }
                    }
                    if (time < 300)
                        time = 300
                    this.scrollerMoveCSS(this.finishScrollingObject, scrollPoints, time, "cubic-bezier(0.33,0.66,0.66,1)");
                    if (this.vscrollBar) {
                        var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.maxTop + scrollPoints.y) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
                        if (pos > this.bottomMargin)
                            pos = this.bottomMargin;
                        if (pos < 0)
                            pos = 0;
                        this.scrollerMoveCSS(this.vscrollBar, {
                            x: 0,
                            y: pos
                        }, time, "cubic-bezier(0.33,0.66,0.66,1)");
                    }
                    if (this.hscrollBar) {
                        var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.maxLeft + scrollPoints.x) / this.maxLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
                        if (pos > this.rightMargin)
                            pos = this.rightMargin;
                        if (pos < 0)
                            pos = 0;
                        this.scrollerMoveCSS(this.hscrollBar, {
                            x: pos,
                            y: 0
                        }, time, "cubic-bezier(0.33,0.66,0.66,1)");
                    }
                    
                    if(isNaN(time))
                        that.hideScrollbars(),that.elementScrolling=false
                    else
                        this.scrollingFinishCB=setTimeout(function(){that.hideScrollbars();that.elementScrolling=false},time);
                    this.elementScrolling=true;
                }
                this.hdistanceMoved = 0;
                this.vdistanceMoved = 0;
                touchStarted = false;
            },
            
            scrollerMoveCSS: function(el, distanceToMove, time, timingFunction) {
                if (!time)
                    time = 0;
                if (!timingFunction)
                    timingFunction = "linear";
                
                el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
                el.style.webkitTransitionDuration = time + "ms";
                el.style.webkitBackfaceVisiblity = "hidden";
                el.style.webkitTransitionTimingFunction = timingFunction;
            },
            
            scrollTo: function(pos, time) {
                if (!time)
                    time = 0;
                this.scrollerMoveCSS(this.el, pos, time);
                if (this.vscrollBar) {
                    var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.maxTop + pos.y) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
                    if (pos > this.bottomMargin)
                        pos = this.bottomMargin;
                    if (pos < 0)
                        pos = 0;
                    this.scrollerMoveCSS(this.vscrollBar, {
                        x: 0,
                        y: pos
                    }, time, "ease-out");
                    this.vscrollBar.style.opacity = '0';
                
                }
                if (this.hscrollBar) {
                    var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.maxLeft + pos.x) / this.maxLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
                    if (pos > this.rightMargin)
                        pos = this.rightMargin;
                    if (pos < 0)
                        pos = 0;
                    this.scrollerMoveCSS(this.hscrollBar, {
                        x: pos,
                        y: 0
                    }, time, "ease-out");
                    this.hscrollBar.style.opacity = '0';
                }
            },
             scrollBy:function(pos,time) {
                this.startTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f) - numOnly(this.container.scrollTop);
                this.startLeft = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e) - numOnly(this.container.scrollLeft);
                console.log(this.startTop+"  "+this.startLeft);
                this.scrollTo({y:this.startTop-pos.y,x:this.startLeft-pos.x},time);
            },

            //Momentum adapted from iscroll4 http://www.cubiq.org
            calculateMomentum: function(dist, time) {
                var deceleration = 0.0012, 
                speed = Math.abs(dist) / time, 
                newDist = (speed * speed) / (2 * deceleration), newTime = 0
                
                newDist = newDist * (dist < 0 ? -1 : 1);
                newTime = speed / deceleration;
                return {dist: newDist,time: newTime};
            }
        };
        return scroller;
    })();
})(jq);