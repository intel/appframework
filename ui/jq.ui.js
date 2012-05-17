/**
 * jq.web.css3Animate - css3 animate class for html5 mobile apps
 * @copyright 2011 - AppMobi
 */ (function ($) {
    $.fn["css3Animate"] = function (opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new css3Animate(this[i], opts);
        }
        return this.length == 1 ? tmp : this;
    };

    $["css3AnimateQueue"] = function () {
        return new css3Animate.queue();
    }
    var css3Animate = (function () {

        if (!window.WebKitCSSMatrix) return;
        var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
        var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";

        var css3Animate = function (elID, options) {

                if (typeof elID == "string" || elID instanceof String) {
                    this.el = document.getElementById(elID);
                } else {
                    this.el = elID;
                }
                if (!(this instanceof css3Animate)) {
                    return new css3Animate(elID, options);
                }
                if (!this.el) return;
                var that = this;
                if (!options) {
                    alert("Please provide configuration options for animation of " + elID);
                    return;
                }
				
				if(options["time"]===undefined) options["time"]=0;

                if (options["callback"]) {
                    this.callback = options["callback"];
                    this.moving = true;
                    if(options["time"]!=0){
						this.timeout = window.setTimeout(function () {
		                    if (that.moving == true && that.callback && typeof (that.callback == "function")) {
		                        that.moving = false;
		                        that.callback();
		                        delete this.callback;
		                    }
		                }, numOnly(options["time"]) + 50);
					}
                } else {
                    this.moving = false;
                }

                
                if (!options["y"]) options["y"] = 0;
                if (!options["x"]) options["x"] = 0;
                if (options["previous"]) {
                    options.y += numOnly(new WebKitCSSMatrix(
                    window.getComputedStyle(this.el).webkitTransform).f);
                    options.x += numOnly(new WebKitCSSMatrix(
                    window.getComputedStyle(this.el).webkitTransform).e);
                }
                if (!options["origin"]) options.origin = "0% 0%";

                if (!options["scale"]) options.scale = "1";

                if (!options["rotateY"]) options.rotateY = "0";
                if (!options["rotateX"]) options.rotateX = "0";
                if (!options["skewY"]) options.skewY = "0";
                if (!options["skewX"]) options.skewX = "0";

                if (!options["timingFunction"]) options["timingFunction"] = "linear";

                //check for percent or numbers
                if (typeof (options.x) == "number" || (options.x.indexOf("%") == -1 && options.x.toLowerCase().indexOf("px") == -1 && options.x.toLowerCase().indexOf("deg") == -1)) options.x = parseInt(options.x) + "px";
                if (typeof (options.y) == "number" || (options.y.indexOf("%") == -1 && options.y.toLowerCase().indexOf("px") == -1 && options.y.toLowerCase().indexOf("deg") == -1)) options.y = parseInt(options.y) + "px";

                this.el.style.webkitTransform = "translate" + translateOpen + (options.x) + "," + (options.y) + translateClose + " scale(" + parseFloat(options.scale) + ") rotate(" + options.rotateX + ") rotateY(" + options.rotateY + ") skew(" + options.skewX + "," + options.skewY + ")";
                this.el.style.webkitBackfaceVisiblity = "hidden";
				var properties = "-webkit-transform";
                if (options["opacity"]!==undefined) {
                    this.el.style.opacity = options["opacity"];
					properties+=", opacity";
                }
                if (options["width"]) {
                    this.el.style.width = options["width"];
					properties = "all";
                }
                if (options["height"]) {
                    this.el.style.height = options["height"];
					properties = "all";
                }
				this.el.style.webkitTransitionProperty = properties;
				if((""+options["time"]).indexOf("s")==-1) var time = options["time"]+"ms";
				else var time = options["time"];
				this.el.style.webkitTransitionDuration = time;
				this.el.style.webkitTransitionTimingFunction = options["timingFunction"];
                this.el.style.webkitTransformOrigin = options.origin;
				if(options["time"]==0 && options["callback"]){
					setTimeout(function(){that.finishAnimation();},0);
				} else {
					this.el.addEventListener("webkitTransitionEnd", that.finishAnimation, false);
				}
            };


        css3Animate.prototype = {
            finishAnimation: function (event) {
                if(event) event.preventDefault();
                var that = this;
                if (!this.moving) return;

                this.moving = false;
                this.el.removeEventListener("webkitTransitionEnd", that.finishAnimation, false);
                if (this.callback && typeof (this.callback == "function")) {
                    if (this.timeout) window.clearTimeout(this.timeout);
                    this.callback();
                    delete this.callback;
                }
            }
        }
        return css3Animate;
    })();
    css3Animate.queue = function () {
        return {
            elements: [],
            push: function (el) {
                this.elements.push(el);
            },
            pop: function () {
                return this.elements.pop();
            },
            run: function () {
                var that = this;
                if (this.elements.length == 0) return;
                if (typeof (this.elements[0]) == "function") {
                    var func = this.shift();
                    func();
                }
                if (this.elements.length == 0) return;
                var params = this.shift();
                if (this.elements.length > 0) params.callback = function () {
                    that.run();
                };
                css3Animate(params.id, params);
            },
            shift: function () {
                return this.elements.shift();
            }
        }
    };
})(jq);
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
                    
                $(this.el).addClass("jq-scrollable");
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
                if( $(this.el).hasClass("blockscroll"))
                        return;
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
                        //    this.vscrollBar.style.opacity = 1;
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
                            
                          //  this.hscrollBar.style.opacity = 1;
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
                    if( $(this.el).hasClass("blockscroll"))
                        return;
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
                            this.vscrollBar.style.opacity=1;
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
                            this.hscrollBar.style.opacity=1;
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
/**
 * jq.popup - a popup/alert library for html5 mobile apps
 * @copyright Indiepath 2011 - Tim Fisher
 * Modifications/enhancements by appMobi for jqMobi
 * 
 */

/* EXAMPLE
  $('body').popup({
	    title:"Alert! Alert!",
	    message:"This is a test of the emergency alert system!! Don't PANIC!",
	    cancelText:"Cancel me", 
	    cancelCallback: function(){console.log("cancelled");},
	    doneText:"I'm done!",
	    doneCallback: function(){console.log("Done for!");},
	    cancelOnly:false,
        doneClass:'button',
        cancelClass:'button',
        onShow:function(){console.log('showing popup');}
        autoCloseDone:true, //default is true will close the popup when done is clicked.
        suppressTitle:false //Do not show the title if set to true
  });
  
  You can programatically trigger a close by dispatching a "close" event to it.
  
  $('body').popup({title:'Alert',id:'myTestPopup'});
  $("#myTestPopup").trigger("close");
  
 */
(function($) {
    
    $.fn.popup = function(opts) {
        return new popup(this[0], opts);
    };
    var queue = [];
    var popup = (function() {
        var popup = function(containerEl, opts) {
            
            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                alert("Error finding container for popup " + containerEl);
                return;
            }
            
            try {
                if (typeof (opts) === "string" || typeof (opts) === "number")
                    opts = {message: opts,cancelOnly: "true",cancelText: "OK"};
                this.id = id = opts.id = opts.id || $.uuid(); //opts is passed by reference
                var self = this;
                this.title = opts.suppressTitle?"":(opts.title || "Alert");
                this.message = opts.message || "";
                this.cancelText = opts.cancelText || "Cancel";
                this.cancelCallback = opts.cancelCallback || function() {
                };
                this.cancelClass = opts.cancelClass || "button";
                this.doneText = opts.doneText || "Done";
                this.doneCallback = opts.doneCallback || function(self) {
                	self.hide();
                };
                this.doneClass = opts.doneClass || "button";
                this.cancelOnly = opts.cancelOnly || false;
                this.onShow = opts.onShow || function(){};
                this.autoCloseDone=opts.autoCloseDone!==undefined?opts.autoCloseDone:true;
                
                queue.push(this);
                if (queue.length == 1)
                    this.show();
            } catch (e) {
                console.log("error adding popup " + e);
            }
        
        };
        
        popup.prototype = {
            id: null,
            title: null,
            message: null,
            cancelText: null,
            cancelCallback: null,
            cancelClass: null,
            doneText: null,
            doneCallback: null,
            doneClass: null,
            cancelOnly: false,
            onShow: null,
            autoCloseDone:true,
            supressTitle:false,
            show: function() {
                var self = this;
                var markup = '<div id="' + this.id + '" class="jqPopup hidden">\
	        				<header>' + this.title + '</header>\
	        				<div><div style="width:1px;height:1px;-webkit-transform:translate3d(0,0,0);float:right"></div>' + this.message + '</div>\
	        				<footer style="clear:both;">\
	        					<a href="javascript:;" class="'+this.cancelClass+'" id="cancel">' + this.cancelText + '</a>\
	        					<a href="javascript:;" class="'+this.doneClass+'" id="action">' + this.doneText + '</a>\
	        				</footer>\
	        			</div></div>';
                $(this.container).append($(markup));
                
                $("#" + this.id).bind("close", function(){
                	self.hide();
                })
                
                if (this.cancelOnly) {
                    $("#" + this.id).find('A#action').hide();
                    $("#" + this.id).find('A#cancel').addClass('center');
                }
                $("#" + this.id).find('A').each(function() {
                    var button = $(this);
                    button.bind('click', function(e) {
                        if (button.attr('id') == 'cancel') {
                            self.cancelCallback.call(self.cancelCallback, self);
                            self.hide();
                        } else {
                            self.doneCallback.call(self.doneCallback, self);
                            if(self.autoCloseDone)
                                self.hide();
                        }
                        e.preventDefault();
                     });
                });
                self.positionPopup();
                $.blockUI(0.5);
                $('#' + self.id).removeClass('hidden');
                $('#' + self.id).bind("orientationchange", function() {
                    self.positionPopup();
                });
                
                this.onShow(this);
                
            },
            
            hide: function() {
                var self = this;
                $('#' + self.id).addClass('hidden');
                $.unblockUI();
                setTimeout(function() {
                    self.remove();
                }, 250);
            },
            
            remove: function() {
                var self = this;
                var $el=$("#"+self.id);
                $el.find('BUTTON#action').unbind('click');
                $el.find('BUTTON#cancel').unbind('click');
                $el.unbind("orientationchange").remove();
                queue.splice(0, 1);
                if (queue.length > 0)
                    queue[0].show();
            },
            
            positionPopup: function() {
                var popup = $('#' + this.id);
                popup.css("top", ((window.innerHeight / 2.5) + window.pageYOffset) - (popup[0].clientHeight / 2) + "px");
                popup.css("left", (window.innerWidth / 2) - (popup[0].clientWidth / 2) + "px");
            }
        };
        
        return popup;
    })();
    var uiBlocked = false;
    $.blockUI = function(opacity) {
        if (uiBlocked)
            return;
        opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
        $('BODY').prepend($("<div id='mask'" + opacity + "></div>"));
        $('BODY DIV#mask').bind("touchstart", function(e) {
            e.preventDefault();
        });
        $('BODY DIV#mask').bind("touchmove", function(e) {
            e.preventDefault();
        });
        uiBlocked = true
    };
    
    $.unblockUI = function() {
        uiBlocked = false;
        $('BODY DIV#mask').unbind("touchstart");
        $('BODY DIV#mask').unbind("touchmove");
        $("BODY DIV#mask").remove();
    };
    /**
     * Here we override the window.alert function due to iOS eating touch events on native alerts
     */
    window.alert = function(text) {
        if(text===null||text===undefined)
            text="null";
        if($("#jQUi").length>0)
            $("#jQUi").popup(text.toString());
        else
            $(document.body).popup(text.toString());
    }
    window.confirm = function(text) {
        throw "Due to iOS eating touch events from native confirms, please use our popup plugin instead";
    }
})(jq);
/**
 * jq.web.actionsheet - a actionsheet for html5 mobile apps
 * Copyright 2012 - AppMobi 
 */
(function($) {
    $.fn["actionsheet"] = function(opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new actionsheet(this[i], opts);
        }
        return this.length == 1 ? tmp : this;
    };
    var actionsheet = (function() {
        if (!window.WebKitCSSMatrix)
            return;
        
        var actionsheet = function(elID, opts) {
            if (typeof elID == "string" || elID instanceof String) {
                this.el = document.getElementById(elID);
            } else {
                this.el = elID;
            }
            if (!this.el) {
                alert("Could not find element for actionsheet " + elID);
                return;
            }
            
            if (this instanceof actionsheet) {
                if(typeof(opts)=="object"){
                for (j in opts) {
                    this[j] = opts[j];
                }
                }
            } else {
                return new actionsheet(elID, opts);
            }
            
            try {
                var that = this;
                var markStart = '</div><div id="jq_actionsheet"><div style="width:100%">';
                var markEnd = '</div></div>';
                var markup;
                if (typeof opts == "string") {
                    markup = $(markStart + opts +"<a href='javascript:;' class='cancel'>Cancel</a>"+markEnd);
                } else if (typeof opts == "object") {
                    markup = $(markStart + markEnd);
                    var container = $(markup.children().get());
                    opts.push({text:"Cancel",cssClasses:"cancel"});
                    for (var i = 0; i < opts.length; i++) {
                        var item = $('<a href="javascript:;" >' + (opts[i].text || "TEXT NOT ENTERED") + '</a>');
                        item[0].onclick = (opts[i].handler || function() {});
                        if (opts[i].cssClasses && opts[i].cssClasses.length > 0)
                            item.addClass(opts[i].cssClasses);
                        container.append(item);
                    }
                }
                $(elID).find("#jq_actionsheet").remove();
                $(elID).find("#jq_action_mask").remove();
                actionsheetEl = $(elID).append(markup);
                
                markup.get().style.webkitTransition="all 0ms";
                markup.css("-webkit-transform", "translate3d(0,"+(window.innerHeight*2) + "px,0)");
                this.el.style.overflow = "hidden";
                markup.on("click", "a",function(){that.hideSheet()});
                this.activeSheet=markup;
                $(elID).append('<div id="jq_action_mask" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;z-index:9998;background:rgba(0,0,0,.4)"/>');
                setTimeout(function(){
                    markup.get().style.webkitTransition="all 200ms";
                    var height=window.innerHeight-parseInt(markup.css("height"));
                    markup.css("-webkit-transform", "translate3d(0,"+(height)+"px,0)");
                 },10);
            } catch (e) {
                alert("error adding actionsheet" + e);
            }
        };
        actionsheet.prototype = {
            activeSheet:null,
            hideSheet: function() {
                var that=this;
                this.activeSheet.off("click","a",function(){that.hideSheet()});
                $(this.el).find("#jq_action_mask").remove();
                this.activeSheet.get().style.webkitTransition="all 0ms";
                var markup = this.activeSheet;
                var theEl = this.el;
                setTimeout(function(){
                    
                	markup.get().style.webkitTransition="all 500ms";
                	markup.css("-webkit-transform", "translate3d(0,"+(window.innerHeight*2) + "px,0)");
                	setTimeout(function(){
		                markup.remove();
		                markup=null;
		                theEl.style.overflow = "none";
	                },500);
                },10);            
            }
        };
        return actionsheet;
    })();
})(jq);

/*
 * jq.web.passwordBox - password box replacement for html5 mobile apps on android due to a bug with CSS3 translate3d
 * @copyright 2011 - AppMobi
 */
(function ($) {
    $["passwordBox"] = function () {

        return new passwordBox();
    };

    var passwordBox = function () {
            this.oldPasswords = {};
        };
    passwordBox.prototype = {
        showPasswordPlainText: false,
        getOldPasswords: function (elID) {
         //   if ($.os.android == false) return; -  iOS users seem to want this too, so we'll let everyone join the party
            var container = elID && document.getElementById(elID) ? document.getElementById(elID) : document;
            if (!container) {
                alert("Could not find container element for passwordBox " + elID);
                return;
            }
            var sels = container.getElementsByTagName("input");

            var that = this;
            for (var i = 0; i < sels.length; i++) {
                if (sels[i].type != "password") continue;

                sels[i].type = "text";
                sels[i].style['-webkit-text-security'] = "disc";
            }
        },

        changePasswordVisiblity: function (what, id) {
            what = parseInt(what);
            var theEl = document.getElementById(id);
            if (what == 1) { //show
                theEl.style['-webkit-text-security'] = "none";
            } else {
                theEl.style['-webkit-text-security'] = "disc";
            }
            theEl = null;
        }
    };
})(jq);
/*
 * Copyright: AppMobi
 * Description:  This script will replace all drop downs with friendly select controls.  Users can still interact
 * with the old drop down box as normal with javascript, and this will be reflected
 
 */
(function($) {
    $['selectBox'] = {
        oldSelects: {},
        scroller: null,
        getOldSelects: function(elID) {
            if ($.os.android == false)
                return;
            if (!$.fn['scroller']) {
                alert("This library requires jq.web.Scroller");
                return;
            }
            var container = elID && document.getElementById(elID) ? document.getElementById(elID) : document;
            if (!container) {
                alert("Could not find container element for jq.web.selectBox " + elID);
                return;
            }
            var sels = container.getElementsByTagName("select");
            var that = this;
            for (var i = 0; i < sels.length; i++) {
                if (this.oldSelects[sels[i].id])
                    continue;
                (function(theSel) {
                    var fakeInput = document.createElement("div");
                    var selWidth = parseInt(theSel.style.width) > 0 ? parseInt(theSel.style.width) : 100;
                    var selHeight = parseInt(theSel.style.height) > 0 ? parseInt(theSel.style.height) : 20;
                    fakeInput.style.width = selWidth + "px";
                    fakeInput.style.height = selHeight + "px";
                    fakeInput.style.position = "absolute";
                    fakeInput.style.left = "0px";
                    fakeInput.style.top = "0px";
                    fakeInput.style.zIndex = "1";
                    if (theSel.value)
                        fakeInput.innerHTML = theSel.options[theSel.selectedIndex].text;
                    fakeInput.style.background = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAIAAABFWWJ4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM1NjQxRUQxNUFEODExRTA5OUE3QjE3NjI3MzczNDAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM1NjQxRUQyNUFEODExRTA5OUE3QjE3NjI3MzczNDAzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzU2NDFFQ0Y1QUQ4MTFFMDk5QTdCMTc2MjczNzM0MDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzU2NDFFRDA1QUQ4MTFFMDk5QTdCMTc2MjczNzM0MDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6YWbdCAAAAlklEQVR42mIsKChgIBGwAHFPTw/xGkpKSlggrG/fvhGjgYuLC0gyMZAOoPb8//9/0Or59+8f8XrICQN66SEnDOgcp3AgKiqKqej169dY9Hz69AnCuHv3rrKyMrIKoAhcVlBQELt/gIqwstHD4B8quH37NlAQSKKJEwg3iLbBED8kpeshoGcwh5uuri5peoBFMEluAwgwAK+5aXfuRb4gAAAAAElFTkSuQmCC') right top no-repeat";
                    fakeInput.style.backgroundColor = "white";
                    fakeInput.className = "jqmobiSelect_fakeInput " + theSel.className;
                    fakeInput.id = theSel.id + "_jqmobiSelect";
                    
                    fakeInput.style.border = "1px solid gray";
                    fakeInput.style.color = "black";
                    fakeInput.linkId = theSel.id;
                    fakeInput.onclick = function(e) {
                        that.initDropDown(this.linkId);
                    };
                    theSel.parentNode.appendChild(fakeInput);
                    theSel.parentNode.style.position = "relative";
                    theSel.style.display = "none";
                    theSel.style.webkitAppearance = "none";
                    // Create listeners to watch when the select value has changed.
                    // This is needed so the users can continue to interact as normal,
                    // via jquery or other frameworks
                    for (var j = 0; j < theSel.options.length; j++) {
                        if (theSel.options[j].selected) {
                            fakeInput.value = theSel.options[j].text;
                        }
                        theSel.options[j].watch( "selected", function(prop, oldValue, newValue) {
                            if (newValue == true) {
                                that.updateMaskValue(this.parentNode.id, this.text, this.value);
                                this.parentNode.value = this.value;
                            }
                            return newValue;
                        });
                    }
                    theSel.watch("selectedIndex", function(prop, oldValue, newValue) {
                        if (this.options[newValue]) {
                            that.updateMaskValue(this.id, this.options[newValue].text, this.options[newValue].value);
                            this.value = this.options[newValue].value;
                        }
                        return newValue;
                    });
                    
                    fakeInput = null;
                    imageMask = null;
                    that.oldSelects[theSel.id] = 1;
                
                
                })(sels[i]);
            }
            that.createHtml();
        },
        updateDropdown: function(id) {
            var el = document.getElementById(id);
            if (!el)
                return;
            for (var j = 0; j < el.options.length; j++) {
                if (el.options[j].selected)
                    fakeInput.value = el.options[j].text;
                el.options[j].watch("selected", function(prop, oldValue, newValue) {
                    if (newValue == true) {
                        that.updateMaskValue(this.parentNode.id, this.text, this.value);
                        this.parentNode.value = this.value;
                    }
                    return newValue;
                });
            }
            el = null;
        },
        initDropDown: function(elID) {
            
            var that = this;
            var el = document.getElementById(elID);
            if (el.disabled)
                return;
            if (!el || !el.options || el.options.length == 0)
                return;
            var htmlTemplate = "";
            var foundInd = 0;
            document.getElementById("jqmobiSelectBoxScroll").innerHTML = "";
            
            document.getElementById("jqmobiSelectBoxHeaderTitle").innerHTML = (el.name != undefined && el.name != "undefined" && el.name != "" ? el.name : elID);
            
            for (var j = 0; j < el.options.length; j++) {
                var currInd = j;
                el.options[j].watch( "selected", function(prop, oldValue, newValue) {
                    if (newValue == true) {
                        that.updateMaskValue(this.parentNode.id, this.text, this.value);
                        this.parentNode.value = this.value;
                    }
                    return newValue;
                });
                var checked = (el.value == el.options[j].value) ? true : false;
                var button = "";
                var bg = "background-image: -webkit-gradient(linear,left bottom,left top,color-stop(0.17, rgb(102,102,102)),color-stop(0.59, rgb(94,94,94)))";
                var foundID;
                var div = document.createElement("div");
                div.className = "jqmobiSelectRow";
                if (checked) {
                    bg = "background-image: -webkit-gradient(linear,left bottom,left top,color-stop(0.17, rgb(8,8,8)),color-stop(0.59, rgb(38,38,38)))";
                    button = "checked";
                    foundInd = j;
                    foundID = "id='jqmobiSelectBox_found'";
                    div.className = "jqmobiSelectRowFound";
                } else {
                    foundID = "";
                }
                
                div.id = foundID;
                div.style.cssText = ";line-height:40px;font-size:14px;padding-left:10px;height:40px;width:100%;position:relative;width:100%;border-bottom:1px solid black;background:white;";
                var anchor = document.createElement("a");
                anchor.href = "javascript:;";
                div.tmpValue = j;
                div.onclick = function(e) {
                    that.setDropDownValue(elID, this.tmpValue);
                };
                anchor.style.cssText = "text-decoration:none;color:black;";
                anchor.innerHTML = el.options[j].text;
                var span = document.createElement("span");
                span.style.cssText = "float:right;margin-right:20px;margin-top:-2px";
                var rad = document.createElement("button");
                if (foundID) {
                    rad.style.cssText = "background: #000;padding: 0px 0px;border-radius:15px;border:3px solid black;";
                    rad.className = "jqmobiSelectRowButtonFound";
                } else {
                    rad.style.cssText = "background: #ffffff;padding: 0px 0px;border-radius:15px;border:3px solid black;";
                    rad.className = "jqmobiSelectRowButton";
                }
                rad.style.width = "20px";
                rad.style.height = "20px";
                
                rad.checked = button;
                
                anchor.className = "jqmobiSelectRowText";
                span.appendChild(rad);
                div.appendChild(anchor);
                div.appendChild(span);
                
                document.getElementById("jqmobiSelectBoxScroll").appendChild(div);
                
                span = null;
                rad = null;
                anchor = null;
            }
            try {
                document.getElementById("jqmobiSelectModal").style.display = 'block';
            } catch (e) {
                console.log("Error showing div " + e);
            }
            try {
                if (div) {
                    var scrollThreshold = numOnly(div.style.height);
                    var offset = numOnly(document.getElementById("jqmobiSelectBoxHeader").style.height);
                    
                    if (foundInd * scrollThreshold + offset >= numOnly(document.getElementById("jqmobiSelectBoxFix").clientHeight) - offset)
                        var scrollToPos = (foundInd) * -scrollThreshold + offset;
                    else
                        scrollToPos = 0;
                    this.scroller.scrollTo({
                        x: 0,
                        y: scrollToPos
                    });
                }
            } catch (e) {
                console.log("error init dropdown" + e);
            }
            div = null;
            el = null;
        },
        updateMaskValue: function(elID, value, val2) {
            
            var el = document.getElementById(elID + "_jqmobiSelect");
            var el2 = document.getElementById(elID);
            if (el)
                el.innerHTML = value;
            if (typeof (el2.onchange) == "function")
                el2.onchange(val2);
            el = null;
            el2 = null;
        },
        setDropDownValue: function(elID, value) {
            
            var el = document.getElementById(elID);
            if (el) {
                el.selectedIndex = value;
                $(el).trigger("change");
            }
            this.scroller.scrollTo({
                x: 0,
                y: 0
            });
            this.hideDropDown();
            el = null;
        },
        hideDropDown: function() {
            document.getElementById("jqmobiSelectModal").style.display = 'none';
            document.getElementById("jqmobiSelectBoxScroll").innerHTML = "";
        },
        createHtml: function() {
            var that = this;
            if (document.getElementById("jqmobiSelectBoxContainer")) {
                return;
            }
            var modalDiv = document.createElement("div");
            
            modalDiv.style.cssText = "position:absolute;top:0px;bottom:0px;left:0px;right:0px;background:rgba(0,0,0,.7);z-index:200000;display:none;";
            modalDiv.id = "jqmobiSelectModal";
            
            var myDiv = document.createElement("div");
            myDiv.id = "jqmobiSelectBoxContainer";
            myDiv.style.cssText = "position:absolute;top:8%;bottom:10%;display:block;width:90%;margin:auto;margin-left:5%;height:90%px;background:white;color:black;border:1px solid black;border-radius:6px;";
            myDiv.innerHTML = "<div id='jqmobiSelectBoxHeader' style=\"display:block;font-family:'Eurostile-Bold', Eurostile, Helvetica, Arial, sans-serif;color:#fff;font-weight:bold;font-size:18px;line-height:34px;height:34px; text-transform:uppercase;text-align:left;text-shadow:rgba(0,0,0,.9) 0px -1px 1px;    padding: 0px 8px 0px 8px;    border-top-left-radius:5px; border-top-right-radius:5px; -webkit-border-top-left-radius:5px; -webkit-border-top-right-radius:5px;    background:#39424b;    margin:1px;\"><div style='float:left;' id='jqmobiSelectBoxHeaderTitle'></div><div style='float:right;width:60px;margin-top:-5px'><div id='jqmobiSelectClose' class='button' style='width:60px;height:32px;line-height:32px;'>Close</div></div></div>";
            myDiv.innerHTML += '<div id="jqmobiSelectBoxFix"  style="position:relative;height:90%;background:white;overflow:hidden;width:100%;"><div id="jqmobiSelectBoxScroll"></div></div>';
            var that = this;
            modalDiv.appendChild(myDiv);
            
            $(document).ready(function() {
               
                if(jq("#jQUi"))
                   jq("#jQUi").append(modalDiv);
                else
                    document.body.appendChild(modalDiv);
                var close = $("#jqmobiSelectClose").get();
                close.onclick = function() {
                    that.hideDropDown();
                };
                
                var styleSheet = $("<style>.jqselectscrollBarV{opacity:1 !important;}</style>").get();
                document.body.appendChild(styleSheet);
                try {
                    that.scroller = $("#jqmobiSelectBoxScroll").scroller({
                        scroller: false,
                        verticalScroll: true,
                        vScrollCSS: "jqselectscrollBarV"
                    });
                
                } catch (e) {
                    console.log("Error creating select html " + e);
                }
                modalDiv = null;
                myDiv = null;
                styleSheet = null;
            });
        }
    };
    //The following is based off Eli Grey's shim
    //https://gist.github.com/384583
    //We use HTMLElement to not cause problems with other objects
    if (!HTMLElement.prototype.watch) {
        HTMLElement.prototype.watch = function (prop, handler) {
            var oldval = this[prop], newval = oldval,
            getter = function () {
                return newval;
            },
            setter = function (val) {
                oldval = newval;
                return newval = handler.call(this, prop, oldval, val);
            };
            if (delete this[prop]) { // can't watch constants
                if (HTMLElement.defineProperty) { // ECMAScript 5
                    HTMLElement.defineProperty(this, prop, {
                        get: getter,
                        set: setter,
                        enumerable: false,
                        configurable: true
                    });
                } else if (HTMLElement.prototype.__defineGetter__ && HTMLElement.prototype.__defineSetter__) { // legacy
                    HTMLElement.prototype.__defineGetter__.call(this, prop, getter);
                    HTMLElement.prototype.__defineSetter__.call(this, prop, setter);
                }
            }
        };
    }
    if (!HTMLElement.prototype.unwatch) {
        HTMLElement.prototype.unwatch = function (prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        };
    }   
})(jq);
/**
 * jq.ui - A User Interface library for creating jqMobi applications
 * 
 * @copyright 2011
 * @author AppMobi
 */(function($) {
    
    var hasLaunched = false;
    var startPath = window.location.pathname;
    var defaultHash = window.location.hash;
    var previousTarget = defaultHash;
    
 
    if(!("pushState" in window.history)){
       window.history['pushState']=function(){}
    }
    var ui = function() {
        // Init the page
        var that = this;
        if (window.AppMobi)
            document.addEventListener("appMobi.device.ready", function() {
                that.hasLaunched = true;
                if (that.autoLaunch) {
                    that.launch();
                }
            }, false);
        else if (document.readyState == "complete" || document.readyState == "loaded") {
            that.hasLaunched = true;
            if (that.autoLaunch) {
                that.launch();
            }
        } else
            document.addEventListener("DOMContentLoaded", function() {
                that.hasLaunched = true;
                if (that.autoLaunch) {
                    that.launch();
                }
            }, false);
        if (!window.AppMobi)
            AppMobi = {}, AppMobi.webRoot = "";
        window.addEventListener("popstate", function() {
            that.goBack();
        }, false);

        /**
         * Helper function to setup the transition objects
         * Custom transitions can be added via $.ui.availableTransitions
           ```
           $.ui.availableTransitions['none']=function();
           ```
         */
        (function(obj) {
            obj.availableTransitions = {};
            obj.availableTransitions['none'] = that.noTransition;
            obj.availableTransitions['default'] = that.noTransition;
        })(this);
    };
    
    
    ui.prototype = {
        fixAndroidInputs:true,
        isAjaxApp:false,
        isAppMobi: false,
        showLoading:true,
        navbar: "",
        header: "",
        viewportContainer: "",
        backButton: "",
        remotePages: {},
        history: [],
        homeDiv: "",
        screenWidth: "",
        content: "",
        modalWindow: "",
        customFooter: false,
        defaultFooter: "",
        defaultHeader: null,
        customMenu: false,
        defaultMenu: "",
        _readyFunc: null,
        doingTransition: false,
        passwordBox: new jq.passwordBox(),
        selectBox: jq.selectBox,
        ajaxUrl: "",
        transitionType: "slide",
        scrollingDivs: [],
        firstDiv: "",
        remoteJSPages: {},
        hasLaunched: false,
        launchCompleted: false,
        activeDiv: "",
        customClickHandler:"",
        
        
        css3animate: function(el, opts) {
            el = jq(el);
            if (!el.__proto__["css3Animate"])
                throw "css3Animate plugin is required";
            return el.css3Animate(opts);
        },
        /**
         * This is the time transitions will run for.
           ```
           $.ui.transitionTime='400ms';
           ```
         * @title $.ui.transitionTime;
         */
        transitionTime:"500",
        /**
         * this is a boolean when set to true (default) it will load that panel when the app is started
           ```
           $.ui.loadDefaultHash=false; //Never load the page from the hash when the app is started
           $.ui.loadDefaultHash=true; //Default
           ```
         *@title $.ui.loadDefaultHash
         */
        loadDefaultHash: true,

        /**
         * This is a boolean that when set to true will add "&cache=_rand_" to any ajax loaded link
           ```
           $.ui.useAjaxCacheBuster=true;
           ```
          *@title $.ui.useAjaxCacheBuster
          */
        useAjaxCacheBuster: false,
        /**
         * This is a shorthand call to the jq.actionsheet plugin.  We wire it to the jQUi div automatically
           ```
           $.ui.actionsheet("<a href='javascript:;' class='button'>Settings</a> <a href='javascript:;' class='button red'>Logout</a>")
           $.ui.actionsheet("[{
                        text: 'back',
                        cssClasses: 'red',
                        handler: function () { $.ui.goBack(); ; }
                    }, {
                        text: 'show alert 5',
                        cssClasses: 'blue',
                        handler: function () { alert("hi"); }
                    }, {
                        text: 'show alert 6',
                        cssClasses: '',
                        handler: function () { alert("goodbye"); }
                    }]");
           ```
         * @param {String,Array} links
         * @title $.ui.actionsheet()
         */
        actionsheet: function(opts) {
            el = jq("#jQUi");
            if (!el.__proto__["actionsheet"])
                throw "actionsheet plugin is required";
            return el.actionsheet(opts);
        },
        /**
         * This is a wrapper to jq.popup.js plugin.  If you pass in a text string, it acts like an alert box and just gives a message
           ```
           $.ui.popup(opts);
           $.ui.popup( {
                        title:"Alert! Alert!",
                        message:"This is a test of the emergency alert system!! Don't PANIC!",
                        cancelText:"Cancel me", 
                        cancelCallback: function(){console.log("cancelled");},
                        doneText:"I'm done!",
                        doneCallback: function(){console.log("Done for!");},
                        cancelOnly:false
                      });
           $.ui.popup('Hi there');
           ```
         * @param {Object|String} options
         * @title $.ui.popup(opts)
         */
        popup: function(opts) {
            el = jq("#jQUi");
            if (!el.__proto__["popup"])
                throw "popup plugin is required";
            return el.popup(opts);
        },

        /**
         *This will throw up a mask and block the UI
         ```
         $.ui.blockUI(.9)
         ````
         * @param {Float} opacity
         * @title $.ui.blockUI(opacity)
         */
        blockUI: function(opacity) {
            $.blockUI(opacity);
        },
        /**
         *This will remove the UI mask
         ```
         $.ui.unblockUI()
         ````
         * @title $.ui.unblockUI()
         */
        unblockUI: function() {
            $.unblockUI();
        },
        /**
         * Will remove the bottom nav bar menu from your application
           ```
           $.ui.removeFooterMenu();
           ```
         * @title $.ui.removeFooterMenu
         */
        removeFooterMenu: function() {
            jq("#navbar").hide();
            jq("#content").css("bottom", "0px");
            this.showNavMenu = false;
        },
        /**
         * Boolean if you want to show the bottom nav menu.
           ```
           $.ui.showNavMenu = false;
           ```
         * @title $.ui.showNavMenu
         */
        showNavMenu: true,
        /**
         * Boolean if you want to auto launch jqUi
           ```
           $.ui.autoLaunch = false; //
         * @title $.ui.autoLaunch
         */
        autoLaunch: true,
        /**
         * Boolean if you want to show the back button
           ```
           $.ui.showBackButton = false; //
         * @title $.ui.showBackButton
         */
        showBackbutton: true,
        /**
         * @api private
         */
        backButtonText: "",
        /**
         * Boolean if you want to reset the scroller position when navigating panels.  Default is true
           ```
           $.ui.resetScrollers=false; //Do not reset the scrollers when switching panels
           ```
         * @title $.ui.resetScrollers
         */
        resetScrollers: true,
        /**
         * function to fire when jqUi is ready and completed launch
           ```
           $.ui.ready(function(){console.log('jqUi is ready');});
           ```
         * @param {Function} function to execute
         * @title $.ui.ready
         */
        ready: function(param) {
            if (this.launchCompleted)
                param();
            else
                document.addEventListener("jq.ui.ready", param, false);
        },
        /**
         * Override the back button class name
           ```
           $.ui.setBackButtonStyle('newClass');
           ```
         * @param {String} new class name
         * @title $.ui.setBackButtonStyle(class)
         */
        setBackButtonStyle: function(className) {
            $am("backButton").className = className;
        },
        /**
         * Initiate a back transition
           ```
           $.ui.goBack()
           ```
           
         * @title $.ui.goBack()
         */
        goBack: function() {
            
            if (this.history.length > 0) {
                var tmpEl = this.history.pop();
                this.loadContent(tmpEl.target + "", 0, 1, tmpEl.transition);
                this.transitionType = tmpEl.transition;
            }
        },
        /**
         * Clear the history queue
           ```
           $.ui.clearHistory()
           ```
           
         * @title $.ui.clearHistory()
         */
        clearHistory: function() {
            this.history = [];
            this.backButton.style.visibility = "hidden";
        },
        /**
         * Update a badge on the selected target.  Position can be
            bl = bottom left
            tl = top left
            br = bottom right
            tr = top right (default)
           ```
           $.ui.updateBadge('#mydiv','3','bl');
           ```
         * @param {String} target
         * @param {String} Value
         * @param {String} [position]         
         * @title $.ui.updateBadge(target,value,[position])
         */
        updateBadge: function(target, value, position) {
            if (position === undefined)
                position = "";
            
            if (target[0] != "#")
                target = "#" + target;
            var badge = jq(target).find("span.jq-badge");
            if (badge.length == 0) {
                if (jq(target).css("position") != "absolute")
                    jq(target).css("position", "relative");
                badge = jq(target).append("<span class='jq-badge " + position + "'>" + value + "</span>");
            } else
                badge.html(value);
            badge.data("ignore-pressed","true");
        
        },
        /**
         * Removes a badge from the selected target.
           ```
           $.ui.removeBadge('#mydiv');
           ```
         * @param {String} target
         * @title $.ui.removeBadge(target)
         */
        removeBadge: function(target) {
            jq(target).find("span.jq-badge").remove();
        },
        /**
         * Toggles the bottom nav nav menu.  Force is a boolean to force show or hide.
           ```
           $.ui.toggleNavMenu();//toggle it
           $.ui.toggleNavMenu(true); //force show it
           ```
         * @param {Boolean} [force]
         * @title $.ui.toggleNavMenu([force])
         */
        toggleNavMenu: function(force) {
            if (!jq.ui.showNavMenu)
                return;
            if (jq("#navbar").css("display") != "none" && ((force !== undefined && force !== true) || force === undefined)) {
                jq("#content").css("bottom", "0px");
                jq("#navbar").hide();
            } else if (force === undefined || (force !== undefined && force === true)) {
                jq("#navbar").show();
                jq("#content").css("bottom", jq("#navbar").css("height"));
            
            }
        },
        /**
         * Toggles the top header menu.
           ```
           $.ui.toggleHeaderMenu();//toggle it
           ```
         * @param {Boolean} [force]
         * @title $.ui.toggleHeaderMenu([force])
         */
        toggleHeaderMenu: function(force) {
            
            if (jq("#header").css("display") != "none" && ((force !== undefined && force !== true) || force === undefined)) {
                jq("#content").css("top", "0px");
                jq("#header").hide();
            } else if (force === undefined || (force !== undefined && force === true)) {
                jq("#header").show();
                jq("#content").css("top", jq("#header").css("height"));
            
            }
        },
        /**
         * Toggles the side menu.  Force is a boolean to force show or hide.
           ```
           $.ui.toggleSideMenu();//toggle it
           ```
         * @param {Boolean} [force]
         * @title $.ui.toggleSideMenu([force])
         */
        toggleSideMenu: function(force) {
            var that = this;
            if (!jq("#content").hasClass("hasMenu"))
                return;
            if (jq("#menu").css("display") != "block" && ((force !== undefined && force !== false) || force === undefined)) {
                this.scrollingDivs["menu_scroller"].initEvents();
                jq("#menu").show();
                window.setTimeout(function() {
                    jq("#menu").addClass("on");
                    jq("#header").addClass("on");
                    jq("#navbar").addClass("on");
                    jq("#content").addClass("on");
                }, 1); //needs to run after
            
            } else if (force === undefined || (force !== undefined && force === false)) {
                this.scrollingDivs["menu_scroller"].removeEvents();
                
                jq("#header").removeClass("on");
                jq("#menu").removeClass("on");
                jq("#navbar").removeClass("on");
                jq("#content").removeClass("on");
                setTimeout(function() {
                    jq("#menu").hide();
                }, 300); //lame I know
            }
        },
        /**
         * depricated
           ```
           $.ui.updateNavbar();//toggle it
           ```
         * @title $.ui.updateNavbar([force])
         * @api private
         */
        updateNavbar: function() {
        },
        /**
         * Updates the elements in the navbar
           ```
           $.ui.updateNavbarElements(elements);
           ```
         * @param {String|Object} Elements
         * @title $.ui.updateNavbarElements(Elements)
         */
        updateNavbarElements: function(elems) {
            var nb = jq("#navbar");
            if (elems === undefined || elems == null)
                return;
            if (typeof (elems) == "string")
                return nb.html(elems), null;
            nb.html("");
            for (var i = 0; i < elems.length; i++) {
                var node = elems[i].cloneNode(true);
                nb.append(node);
            }
            jq("#navbar a").data("ignore-pressed", "true").data("resetHistory", "true");
        },
        /**
         * Updates the elements in the header
           ```
           $.ui.updateHeaderElements(elements);
           ```
         * @param {String|Object} Elements
         * @title $.ui.updateHeaderElement(Elements)
         */
        updateHeaderElements: function(elems) {
            var nb = jq("#header");
            if (elems === undefined || elems == null)
                return;
            if (typeof (elems) == "string")
                return nb.html(elems), null;
            nb.html("");
            for (var i = 0; i < elems.length; i++) {
                var node = elems[i].cloneNode(true);
                nb.append(node);
            }
        },

        /**
         * Updates the elements in the side menu
           ```
           $.ui.updateSideMenu(elements);
           ```
         * @param {String|Object} Elements
         * @title $.ui.updateSideMenu(Elements)
         */
        updateSideMenu: function(elems) {
            var that = this;
            
            var nb = jq("#menu_scroller");
            
            if (elems === undefined || elems == null)
                return;
            if (typeof (elems) == "string")
                return nb.html(elems), null;
            nb.html('');
            var close = document.createElement("a");
            close.className = "closebutton jqMenuClose";
            close.href = "javascript:;"
            close.onclick = function() {
                that.toggleSideMenu();
            };
            nb.append(close);
            var tmp = document.createElement("div");
            tmp.className = "jqMenuHeader";
            tmp.innerHTML = "Menu";
            nb.append(tmp);
            for (var i = 0; i < elems.length; i++) {
                var node = elems[i].cloneNode(true);
                if (elems[i].oldhash) {
                    node.href = elems[i].oldhref;
                    node.onclick = elems[i].oldonclick;
                }
                nb.append(node);
            }
            //Move the scroller to the top and hide it
            this.scrollingDivs['menu_scroller'].scrollTo({
                x: 0,
                y: 0
            }, "0");
        },
        /**
         * Set the title of the current panel
           ```
           $.ui.setTitle("new title");
           ```
           
         * @param {String} value
         * @title $.ui.setTitle(value)
         */
        setTitle: function(val) {
            jq("#header #pageTitle").html(val);
        },
        /**
         * Override the text for the back button
           ```
           $.ui.setBackButtonText("GO...");
           ```
           
         * @param {String} value
         * @title $.ui.setBackButtonText(value)
         */
        setBackButtonText: function(text) {
            if (this.backButtonText.length > 0)
                jq("#header #backButton").html(this.backButtonText);
            else
                jq("#header #backButton").html(text);
        },
        /**
         * Show the loading mask
           ```
           $.ui.showMask()
           $.ui.showMask(;Doing work')
           ```
           
         * @param {String} [text]
         * @title $.ui.showMask(text);
         */
        showMask: function(text) {
            if (!text)
                text = "Loading Content";
            jq("#jQui_mask>h1").html(text);
            $am("jQui_mask").style.display = "block";
        },
        /**
         * Hide the loading mask
         * @title $.ui.hideMask();
         */
        hideMask: function() {
            $am("jQui_mask").style.display = "none";
        },
        /**
         * Load a content panel in a modal window.  We set the innerHTML so event binding will not work.
           ```
           $.ui.showModal("#myDiv");
           ```
         * @param {String|Object} panel to show
         * @title $.ui.showModal();
         */
        showModal: function(id) {
            var that = this;
            
            if ($am(id)) {
                //jq("#modalContainer").html('<div style="width:1px;height:1px;-webkit-transform:translate3d(0,0,0);float:right"></div>' + $am(id).childNodes[0].innerHTML + '');
                jq("#modalContainer").html($am(id).childNodes[0].innerHTML);
                jq('#modalContainer').append("<a href='javascript:;' onclick='$.ui.hideModal();' class='closebutton modalbutton'></a>");
                this.modalWindow.style.display = "block";
                
                button = null;
                content = null;
                this.scrollingDivs['modal_container'].initEvents();
                this.scrollToTop('modal');
            }
        
        },
        /**
         * Hide the modal window and remove the content
           ```
           $.ui.hideModal("#myDiv");
           ```
         * @title $.ui.hideModal();
         */
        hideModal: function() {
            $am("modalContainer").innerHTML = "";
            $am("jQui_modal").style.display = "none";
            
            this.scrollingDivs['modal_container'].removeEvents();
        },

        /**
         * Update the HTML in a content panel
           ```
           $.ui.updateContentDiv("#myDiv","This is the new content");
           ```
         * @param {String,Object} panel
         * @param {String} html to update with
         * @title $.ui.updateContentDiv(id,content);
         */
        updateContentDiv: function(id, content) {
            var el = $am(id);
            if (!el)
                return;
            if (el.getAttribute("scrolling") && el.getAttribute("scrolling").toLowerCase() == "no")
                el.innerHTML = content;
            else
                el.childNodes[0].innerHTML = content;
        },
        /**
         * Dynamically create a new panel on the fly.  It wires events, creates the scroller, applies Android fixes, etc.
           ```
           $.ui.addContentDiv("myDiv","This is the new content","Title");
           ```
         * @param {String|Object} Element to add
         * @param {String} Content
         * @param {String} title
         * @title $.ui.addContentDiv(id,content,title);
         */
        addContentDiv: function(el, content, title, refresh, refreshFunc) {
            var myEl = $am(el);
            if (!myEl) {
                var newDiv = document.createElement("div");
                newDiv.id = el;
                newDiv.title = title;
                newDiv.innerHTML = content;
            } else {
                newDiv = myEl;
            }
            newDiv.className = "panel";
            var that = this;
            
            myEl = null;
            that.addDivAndScroll(newDiv, refresh, refreshFunc);
            newDiv = null;
            return;
        },
        /**
         *  Takes a div and sets up scrolling for it..
           ```
           $.ui.addDivAndScroll(object);
           ```
         * @param {Object} Element
         * @title $.ui.addDivAndScroll(element);
         * @api private
         */
        addDivAndScroll: function(tmp, refreshPull, refreshFunc) {
            var addScroller = true;
            if (tmp.getAttribute("scrolling") && tmp.getAttribute("scrolling").toLowerCase() == "no")
                addScroller = false;
            if (!addScroller) {
                this.content.appendChild(tmp);
                tmp = null;
                return;
            }
            //WE need to clone the div so we keep events
            var myDiv = tmp.cloneNode(false);
            
            
            tmp.title = null;
            tmp.id = null;
            tmp.removeAttribute("footer");
            tmp.removeAttribute("nav");
            jq(tmp).removeClass("panel");
            tmp.style.width = "100%";
            //tmp.style.height = "inherit";
            
            myDiv.appendChild(tmp);
            
            this.content.appendChild(myDiv);
            
            this.selectBox.getOldSelects(myDiv.id);
            this.passwordBox.getOldPasswords(myDiv.id);
            
            if (addScroller) {
                this.scrollingDivs[myDiv.id] = (jq(tmp).scroller({
                    scrollBars: true,
                    verticalScroll: true,
                    horizontalScroll: false,
                    vScrollCSS: "jqmScrollbar",
                    refresh: false
                }));
                this.scrollingDivs[myDiv.id].removeEvents();
            }
            
            
            myDiv = null;
            tmp = null;
        },

        /**
         * This has been depricated, as it was a design flaw on my end.  People were updating segments of the panel and not the whole part.  It's counter intuitive to have to call 
         * $.ui.updateAnchors(object,reset) after each change.
         * This will be removed in 1.1
         * @title $.ui.updateAnchors(element,resetHistory);
         * @api private
         */
        updateAnchors: function(domEl, reset) {
        },
        /**
         *  Scrolls a panel to the top
           ```
           $.ui.scrollToTop(id);
           ```
         * @param {String} id without hash
         * @title $.ui.scrollToTop(id);
         */
        scrollToTop: function(id) {
            if (this.scrollingDivs[id]) {
                this.scrollingDivs[id].scrollTo({
                    x: 0,
                    y: 0
                }, 0);
            }
        },
        /**
         *  Scrolls all panels to the top and fixes position when orientation changes
           ```
           $.ui.updateOrientation(event);
           ```
         * @param {Event} event
         * @title $.ui.updateOrientation(event);
         * @api private
         */
        updateOrientation: function(event) {
            for (var j in this.scrollingDivs) {
                if (typeof (this.scrollingDivs[j]) !== "function")
                    this.scrollToTop(j);
            }            
        },

        /**
         *  This is used when a transition fires to do helper events.  We check to see if we need to change the nav menus, footer, and fire
         * the load/onload functions for panels
           ```
           $.ui.parsePanelFunctions(currentDiv,oldDiv);
           ```
         * @param {Object} current div
         * @param {Object} old div
         * @title $.ui.parsePanelFunctions(currentDiv,oldDiv);
         * @api private
         */
        parsePanelFunctions: function(what, oldDiv) {
            var that = this;
            var hasFooter = what.getAttribute("data-footer");
            var hasHeader = what.getAttribute("data-header");
            window.setTimeout(function() {
                if (hasFooter && hasFooter.toLowerCase() == "none") {
                    that.toggleNavMenu(false);
                } else {
                    that.toggleNavMenu(true);
                }
                if (hasFooter && that.customFooter != hasFooter) {
                    that.customFooter = hasFooter;
                    that.updateNavbarElements(jq("#" + hasFooter).children());
                } else if (hasFooter != that.customFooter) {
                    if (that.customFooter)
                        that.updateNavbarElements(that.defaultFooter);
                    that.customFooter = false;
                }
                
                
                if (hasHeader && that.customHeader != hasHeader) {
                    that.customHeader = hasHeader;
                    that.updateHeaderElements(jq("#" + hasHeader).children());
                } else if (hasHeader != that.customHeader) {
                    if (that.customHeader)
                    {
                        that.updateHeaderElements(that.defaultHeader);
                        that.setTitle(that.activeDiv.title);
                    }
                    that.customHeader = false;
                }

                //Load inline footers
                var inlineFooters = $(what).find("footer");
                if (inlineFooters.length > 0) 
                {
                    that.customFooter = what.id;
                    that.updateNavbarElements(inlineFooters.children());
                }
                //load inline headers
                var inlineHeader = $(what).find("header");
                
                
                if (inlineHeader.length > 0) 
                {
                    that.customHeader = what.id;
                    that.updateHeaderElements(inlineHeader.children());
                }
                //check if the panel has a footer
                if (what.getAttribute("data-tab")) { //Allow the dev to force the footer menu
                    
                    jq("#navbar a").removeClass("selected");
                    jq("#navbar #" + what.getAttribute("data-tab")).addClass("selected");
                }
                 var hasMenu = what.getAttribute("data-nav");
                if (hasMenu && that.customMenu != hasMenu) {
                    that.customMenu = hasMenu;
                    that.updateSideMenu(jq("#" + hasMenu).children());
                } else if (hasMenu != that.customMenu) {
                    if (that.customMenu)
                        that.updateSideMenu(that.defaultMenu);
                    that.customMenu = false;
                }
                
            }, 10);
           
            
            
            var fnc = what.getAttribute("data-load");
            if (typeof fnc == "string" && window[fnc]) {
                window[fnc](what);
            }
            if (oldDiv) {
                fnc = oldDiv.getAttribute("data-unload");
                if (typeof fnc == "string" && window[fnc]) {
                    window[fnc](oldDiv);
                }
            }
            if (this.menu.style.display == "block")
                this.toggleSideMenu(); //Close on phones to prevent orientation change bug.
        
        },
        /**
         * Helper function that parses a contents html for any script tags and either adds them or executes the code
         * @api private
         */
        parseScriptTags: function(div) {
            if (!div)
                return;
            var scripts = div.getElementsByTagName("script");
            div = null;
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.length > 0 && !this.remoteJSPages[scripts[i].src]) {
                    var doc = document.createElement("script");
                    doc.type = scripts[i].type;
                    doc.src = scripts[i].src;
                    document.getElementsByTagName('head')[0].appendChild(doc);
                    this.remoteJSPages[scripts[i].src] = 1;
                    doc = null;
                } else {
                    window.eval(scripts[i].innerHTML);
                }
            }
        },
        /**
         * This is called to initiate a transition or load content via ajax.
         * We can pass in a hash+id or URL and then we parse the panel for additional functions
           ```
           $.ui.loadContent("#main",false,false,"up");
           ```
         * @param {String} target
         * @param {Boolean} newtab (resets history)
         * @param {Boolean} go back (initiate the back click)
         * @param {String} transition
         * @title $.ui.loadContent(target,newTab,goBack,transition);
         * @api public
         */
        loadContent: function(target, newTab, back, transition, anchor) {
            
            if (this.doingTransition)
                return;
            
            
            what = null;
            var that = this;
            that.hideMask();
            var loadAjax = true;
            if (target.indexOf("#") == -1) {
                var urlHash = "url" + crc32(target); //Ajax urls
                if ($am(urlHash)) {

                    //ajax div already exists.  Let's see if we should be refreshing it.
                    loadAjax = false;
                    if (anchor.getAttribute("data-refresh-ajax") === 'true' || (anchor.refresh && anchor.refresh === true)||this.isAjaxApp) {
                        loadAjax = true;
                    } else
                        target = "#" + urlHash;
                }
            }
            
            if (target.indexOf("#") == -1 && anchor && loadAjax) {

                // XML Request
                if (this.activeDiv.id == "jQui_ajax" && target == this.ajaxUrl)
                    return;
                if (target.indexOf("http") == -1)
                    target = AppMobi.webRoot + target;
               
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        this.doingTransition = false;
                        
                        var doReturn = false;

                        //Here we check to see if we are retaining the div, if so update it
                        if ($am(urlHash) !== undefined) {
                            that.updateContentDiv(urlHash, xmlhttp.responseText);
                            $am(urlHash).title = anchor.title ? anchor.title : target;
                        } else if (anchor.getAttribute("data-persist-ajax")||that.isAjaxApp) {
                            
                            var refresh = (anchor.getAttribute("data-pull-scroller") === 'true') ? true : false;
                            refreshFunction = refresh ? 
                            function() {
                                anchor.refresh = true;
                                that.loadContent(target, newTab, back, transition, anchor);
                                anchor.refresh = false;
                            } : null
                            that.addContentDiv(urlHash, xmlhttp.responseText, refresh, refreshFunction);
                            $am(urlHash).title = anchor.title ? anchor.title : target;
                        } else {
                            that.updateContentDiv("jQui_ajax", xmlhttp.responseText);
                            $am("jQui_ajax").title = anchor.title ? anchor.title : target;
                            that.loadContent("#jQui_ajax", newTab, back);
                            doReturn = true;
                        }
                        //Let's load the content now.
                        //We need to check for any script tags and handle them
                        var div = document.createElement("div");
                        div.innerHTML = xmlhttp.responseText;
                        that.parseScriptTags(div);
                        if (doReturn)
                            return;
                        
                        return that.loadContent("#" + urlHash);
                    
                    }
                };
                ajaxUrl = target;
                var newtarget = this.useAjaxCacheBuster ? target + (target.split('?')[1] ? '&' : '?') + "cache=" + Math.random() * 10000000000000000 : target;
                xmlhttp.open("GET", newtarget, true);
                xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xmlhttp.send();
                // show Ajax Mask
                if(this.showLoading)
                    this.showMask();
                return;
            } else {
                // load a div
                
                what = target.replace("#", "");
                
                var slashIndex = what.indexOf('/');
                var hashLink = "";
                if (slashIndex != -1) {
                    // Ignore everything after the slash for loading
                    hashLink = what.substr(slashIndex);
                    what = what.substr(0, slashIndex);
                }
                
                what = $am(what);
                
                if (!what)
                    throw ("Target: " + target + " was not found");
                if (what == this.activeDiv && !back)
                    return;
                
                if (what.getAttribute("data-modal") == "true" || what.getAttribute("modal") == "true") {
                    return this.showModal(what.id);
                }
                
                
                
                this.transitionType = transition;
                var oldDiv = this.activeDiv;
                var currWhat = what;
                
                
                if (oldDiv == currWhat) //prevent it from going to itself
                    return;
                
                if (newTab) {
                    
                    this.history = [];
                    if(("#" + this.firstDiv.id)!=target){
                        this.history.push({
                            target: "#" + this.firstDiv.id,
                            transition: transition
                        });
                    }
                } else if (!back) {
                    this.history.push({
                        target: previousTarget,
                        transition: transition
                    });
                
                }
                window.history.pushState(what.id, what.id, startPath + '#' + what.id + hashLink);
                $(window).trigger("hashchange", {newUrl: startPath + '#' + what.id + hashLink,oldURL: startPath + "#" + this.activeDiv.id});
                
                previousTarget = '#' + what.id + hashLink;
                
                if (this.resetScrollers && this.scrollingDivs[what.id]) {
                    this.scrollingDivs[what.id].scrollTo({
                        x: 0,
                        y: 0
                    });
                }
                $(what).addClass("active");
                
                what.style.display = "block";
                that.doingTransition = true;
                if (that.availableTransitions[transition])
                    that.availableTransitions[transition].call(that, oldDiv, currWhat, back);
                else
                    that.availableTransitions['default'].call(that, oldDiv, currWhat, back);

                

                this.activeDiv = what;
                
                if (this.scrollingDivs[this.activeDiv.id]) {
                    this.scrollingDivs[this.activeDiv.id].initEvents();
                }
                if (this.scrollingDivs[oldDiv.id]) {
                    this.scrollingDivs[oldDiv.id].removeEvents();
                }
                //Let's check if it has a function to run to update the data
               
                  
                
                setTimeout(function(){
                    that.parsePanelFunctions(what, oldDiv);
                },300);
                setTimeout(function(){
                  
                    if (back) {
                        if (that.history.length > 0) {
                            var val = that.history[that.history.length - 1];
                            
                            var el = $am(val.target.replace("#", ""));
                            that.setBackButtonText(el.title)
                        }
                    } else if (that.activeDiv.title)
                        that.setBackButtonText(that.activeDiv.title)
                    else
                        that.setBackButtonText("Back");
                    if (what.title) {
                        that.setTitle(what.title);
                    }
                    if (newTab) {
                        that.setBackButtonText(that.firstDiv.title)
                    }
                    
                    //Update the back buttons
                     if (that.history.length == 0) {
                        jq("#header #backButton").css("visibility","hidden");
                        that.history = [];
                    } else if (that.showBackbutton){
                        jq("#header #backButton").css("visibility","visible");
                    }
                },370);
                window.scrollTo(1, 1);
            
            }
        },

        /**
         * This is callled when you want to launch jqUi.  If autoLaunch is set to true, it gets called on DOMContentLoaded.
         * If autoLaunch is set to false, you can manually invoke it.
           ```
           $.ui.autoLaunch=false;
           $.ui.launch();
           ```
         * @title $.ui.launch();
         */
        launch: function() {
            
            if (this.hasLaunched == false || this.launchCompleted) {
                this.hasLaunched = true;
                return;
            }
            this.isAppMobi = (window.AppMobi && typeof (AppMobi) == "object" && AppMobi.app !== undefined) ? true : false;
            var that = this;
            this.viewportContainer = jq("#jQUi");
            this.navbar = $am("navbar");
            this.content = $am("content");
            this.header = $am("header");
            this.menu = $am("menu");
            if (this.viewportContainer.length == 0) {
                var container = document.createElement("div");
                container.id = "jQUi";
                var body = document.body;
                while (body.firstChild) {
                    container.appendChild(body.firstChild);
                }
                jq(document.body).prepend(container);
                this.viewportContainer = jq("#jQUi");
            }
            if (!this.navbar) {
                this.navbar = document.createElement("div");
                this.navbar.id = "navbar";
                this.navbar.style.cssText = "display:none";
                this.viewportContainer.append(this.navbar);
            }
            if (!this.header) {
                this.header = document.createElement("div");
                this.header.id = "header";
                this.viewportContainer.prepend(this.header);
            }
            if (!this.menu) {
                this.menu = document.createElement("div");
                this.menu.id = "menu";
                this.menu.style.overflow = "hidden";
                this.menu.innerHTML = "<div id='menu_scroller'></div>";
                this.viewportContainer.append(this.menu);
                this.scrollingDivs["menu_scroller"] = jq("#menu_scroller").scroller({
                    scrollBars: true,
                    verticalScroll: true,
                    vScrollCSS: "jqmScrollbar"
                });
            }
            
            
            if (!this.content) {
                this.content = document.createElement("div");
                this.content.id = "content";
                this.viewportContainer.append(this.content);
            }
            this.header.innerHTML = '<a id="backButton"  href="javascript:;"></a> <h1 id="pageTitle"></h1>' + this.header.innerHTML;
            this.backButton = $am("backButton");
            this.backButton.className = "button";
            
            jq(document).on("click", "#backButton", function() {
                that.goBack();
            });
            this.backButton.style.visibility = "hidden";
            this.addContentDiv("jQui_ajax", "");
            var maskDiv = document.createElement("div");
            maskDiv.id = "jQui_mask";
            maskDiv.className = "ui-loader";
            maskDiv.innerHTML = "<span class='ui-icon ui-icon-loading spin'></span><h1>Loading Content</h1>";
            maskDiv.style.zIndex = 20000;
            maskDiv.style.display = "none";
            document.body.appendChild(maskDiv);
            var modalDiv = document.createElement("div");
            modalDiv.id = "jQui_modal";
            
            this.viewportContainer.append(modalDiv);
            modalDiv.appendChild(jq("<div id='modalContainer'></div>").get());
            this.scrollingDivs['modal_container'] = jq("#modalContainer").scroller({
                scrollBars: true,
                vertical: true,
                vScrollCSS: "jqmScrollbar"
            });
            
            this.modalWindow = modalDiv;
            var defer = [];
            var contentDivs = this.viewportContainer.get().querySelectorAll(".panel");
            for (var i = 0; i < contentDivs.length; i++) {
                var el = contentDivs[i];
                var tmp = el;
                var id;
                if (el.parentNode && el.parentNode.id != "content") {
                    el.parentNode.removeChild(el);
                    var id = el.id;
                    this.addDivAndScroll(tmp);
                    if (tmp.getAttribute("selected"))
                        this.firstDiv = $am(id);
                } else if (!el.parsedContent) {
                    el.parsedContent = 1;
                    el.parentNode.removeChild(el);
                    var id = el.id;
                    this.addDivAndScroll(tmp);
                    if (tmp.getAttribute("selected"))
                        this.firstDiv = $am(id);
                }
                if (el.getAttribute("data-defer")){
                    defer[id] = el.getAttribute("data-defer");
                    defer.length++;
                }
                el = null;
            }
            if(!this.firstDiv)
               this.firstDiv=$("#content").children().get(0);
            contentDivs = null;
            var loadingDefer=false;
            var toLoad=defer.length;
            if(toLoad>0){
                loadingDefer=true;
                var loaded=0;
                for (var j in defer) {
                    (function(j) {
                        jq.ajax({url:AppMobi.webRoot + defer[j], success:function(data) {
                            if (data.length == 0)
                                return;
                            $.ui.updateContentDiv(j, data);
                            that.parseScriptTags(jq(j).get());
                            loaded++;
                            if(loaded>=toLoad){
                               $(document).trigger("defer:loaded");
                               loadingDefer=false;
                               
                            }
                        },error:function(msg){
                            //still trigger the file as being loaded to not block jq.ui.ready
                            console.log("Error with deferred load "+AppMobi.webRoot+defer[j])
                            loaded++;
                            if(loaded>=toLoad){
                               $(document).trigger("defer:loaded");
                               loadingDefer=false;
                            }
                        }});
                    })(j);
                }
            }
            if (this.firstDiv) {
                
                var that = this;
                // Fix a bug in iOS where translate3d makes the content blurry
                this.activeDiv = this.firstDiv;
              
                //window.setTimeout(function() {
                var loadFirstDiv=function(){
                    //activeDiv = firstDiv;
                    if (defaultHash.length > 0 && that.loadDefaultHash&&defaultHash!=("#"+that.firstDiv.id))
                    {
                        
                        that.activeDiv=$(defaultHash).get();
                        jq("#header #backButton").css("visibility","visible");
                        that.setBackButtonText(that.activeDiv.title)
                        that.history=[{target:"#"+that.firstDiv.id}]; //Reset the history to the first div
                    }
                    else
                        previousTarget="#"+that.activeDiv.id;
                    if (that.scrollingDivs[that.activeDiv.id]) {
                        that.scrollingDivs[that.activeDiv.id].initEvents();
                    }
                    that.activeDiv.style.display = "block";
                    
                   
                    if (that.activeDiv.title)
                        that.setTitle(that.activeDiv.title);
                    that.parsePanelFunctions(that.activeDiv);
                    //Load the default hash
                    
                    that.history=[{target:"#"+that.firstDiv.id}]; //Reset the history to the first div
                    modalDiv = null;
                    maskDiv = null;
                    that.launchCompleted = true;
                    
                   if(jq("#navbar a").length>0){
                        jq("#navbar a").data("ignore-pressed", "true").data("resetHistory", "true");
                        that.defaultFooter = jq("#navbar").children();
                        that.updateNavbarElements(that.defaultFooter);
                    }
                    var firstMenu = jq("nav").get();
                    if(firstMenu){
                        that.defaultMenu = jq(firstMenu).children();
                        that.updateSideMenu(that.defaultMenu);
                    }
                    that.defaultHeader = jq("#header").children();
                    jq(document).trigger("jq.ui.ready");
                    jq("#splashscreen").remove();
                };
                if(loadingDefer){
                    $(document).one("defer:loaded",loadFirstDiv);
                }
                else
                    loadFirstDiv();
            }
        
        },
        
        noTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: 0,
                    time: "1ms"
                });
            
            } else {
                
                that.css3animate(oldDiv, {
                    x: 0,
                    y: 0,
                    time: "1ms"
                });
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms"
                });
            }
            that.finishTransition(oldDiv);
            currDiv.style.zIndex = 2;
            oldDiv.style.zIndex = 1;
            $(oldDiv).removeClass('active');
        },

        /**
         * This must be called at the end of every transition to hide the old div and reset the doingTransition variable
         *
         * @param {Object} Div that transitioned out
         * @title $.ui.finishTransition(oldDiv)
         */
        finishTransition: function(oldDiv) {
            
            oldDiv.style.display = 'none';
            this.doingTransition = false;
        
        }
    /**
         * END
         * @api private
         */
    };
    
    function $am(el) {
        el = el.indexOf("#") == -1 ? "#" + el : el;
        return jq(el).get(0);
    }
    
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D"; /* Number */
    var crc32 = function( /* String */str,  /* Number */crc) {
        if (crc == undefined)
            crc = 0;
        var n = 0; //a number between 0 and 255 
        var x = 0; //an hex number 
        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            n = (crc ^ str.charCodeAt(i)) & 0xFF;
            x = "0x" + table.substr(n * 9, 8);
            crc = (crc >>> 8) ^ x;
        }
        return crc ^ (-1);
    };
    
    
    $.ui = new ui;
})(jq);

//The following functions are utilitiy functions for jqUi.  They are not apart of the base class, but help with locking the page scroll,
//input box issues, remove the address bar on iOS and android, etc
(function() {
    var jQUi;

    //Check to see if any <nav> items are found. If so, add the CSS classes
    jq(document).ready(function() {
        if (jq("nav").length > 0) {
            jq("#jQUi #header").addClass("hasMenu");
            jq("#jQUi #content").addClass("hasMenu");
            jq("#jQUi #navbar").addClass("hasMenu");
        }
        jQUi = jq("#jQUi");
        setTimeout(function(){
        hideAddressBar();
        },100);
    });
    
    document.addEventListener("appMobi.device.ready", function() { //in AppMobi, we need to undo the height stuff since it causes issues.
        setTimeout(function() {
            jQUi.css("height", "100%"), document.body.style.height = "100%";
            document.documentElement.style.minHeight = window.innerHeight;
        }, 300);
    });
    
    
    window.addEventListener("orientationchange", function(e) {
        jq.ui.updateOrientation()
        window.setTimeout(function() {
            hideAddressBar();
        }, 200);
    }, false);
    
    if (jq.os.android) 
    {
        window.addEventListener("resize", function(e) {
            window.scrollTo(0,1);            
             jq.ui.updateOrientation();
            if(document.body.clientWidth>=700)
                $.ui.toggleSideMenu(false);
            window.setTimeout(function() {
                hideAddressBar();
            }, 100);
        }, false);
    }
    
    
    function hideAddressBar() {
        if (jq.os.desktop)
            return jQUi.css("height", "100%");
        if (jq.os.android) {
            window.scrollTo(1, 1);
            if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio)
                jQUi.css("height", (window.outerHeight / window.devicePixelRatio) + 'px');
        } 
        else {
            document.documentElement.style.height = "5000px";
            
            window.scrollTo(0, 1);
            document.documentElement.style.height = window.innerHeight + "px";
            jQUi.css("height", window.innerHeight + "px");
        }
    }
    //The following is based on Cubiq.org - iOS no click delay.  We use this to capture events to input boxes to fix Android...and fix iOS ;)
    //We had to make a lot of fixes to allow access to input elements on android, etc.
    function NoClickDelay(el) {
        if (typeof (el) === "string")
            el = document.getElementById(el);
        el.addEventListener('touchstart', this, true);
    }
    var prevClickField;
    var prevPanel;
    var prevField;
    NoClickDelay.prototype = {
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                    this.onTouchStart(e);
                    break;
                case 'touchmove':
                    this.onTouchMove(e);
                    break;
                case 'touchend':
                    this.onTouchEnd(e);
                    break;
            }
        },
        
        onTouchStart: function(e) {
            
            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;

            var theTarget = e.target;
            if (theTarget.nodeType == 3)
                theTarget = theTarget.parentNode;
            
            if(prevField){
                prevField.blur();
                prevField=null;
            }
            if(prevPanel){
                //prevField.blur();
                prevPanel.css("-webkit-transform","translate3d(0px,0px,0px)");
                prevPanel.css("left","0");
                prevField=null;
                prevPanel=null;
            }
            
            var tagname = theTarget.tagName.toLowerCase();
            var type=theTarget.type||"";
            if((tagname=="a"&& theTarget.href.indexOf("tel:")===0)||((tagname=="input")||tagname=="textarea"||tagname=="select")){
                prevField=theTarget;
                if(jq.os.android&&$.ui.fixAndroidInputs){
                    theTarget.focus();
                    prevField=theTarget;
                    prevPanel=$(theTarget).closest(".panel");
                    prevPanel.css("left","-100%");
                    prevPanel.css("-webkit-transition-duration","0ms");
                    prevPanel.css("-webkit-transform","translate3d(100%,0px,0px)");
                    prevPanel.css("position","absolute");
                    return;
                }
            }
            else
                e.preventDefault();
            this.moved = false;
            document.addEventListener('touchmove', this, true);
            document.addEventListener('touchend', this, true);
        },
        
        onTouchMove: function(e) {
            this.moved = true;
            this.cX = e.touches[0].pageX - this.dX;
            this.cY = e.touches[0].pageY - this.dY;
           // e.preventDefault();
        },
        
        onTouchEnd: function(e) {
            
            document.removeEventListener('touchmove', this, false);
            document.removeEventListener('touchend', this, false);
            
            if ((!jq.os.blackberry && !this.moved) || (jq.os.blackberry && (Math.abs(this.cX) < 5 || Math.abs(this.cY) < 5))) {
                var theTarget = e.target;
                if (theTarget.nodeType == 3)
                    theTarget = theTarget.parentNode;
                
                var theEvent = document.createEvent('MouseEvents');
                theEvent.initEvent('click', true, true);
                theTarget.dispatchEvent(theEvent);
                
            }
            prevClickField = null;
            this.dX = this.cX = this.cY = this.dY = 0;
        }
    };
    
    
    
    jq(document).ready(function() {
        document.body.addEventListener('touchmove', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.scrollTo(1, 1);
        }, false);
        if (!jq.os.desktop)
            new NoClickDelay(document.getElementById("jQUi"));
            
        document.getElementById("jQUi").addEventListener("click", function(e) {
            
            var theTarget = e.target;
            if (theTarget.nodeType == 3)
                theTarget = theTarget.parentNode;
            if (checkAnchorClick(theTarget)) {
                e.preventDefault();
                return false;
            }
        }, true);
        
        jq("#navbar").on("click", "a", function(e) {
            jq("#navbar a").removeClass("selected");
            setTimeout(function() {
                $(e.target).addClass("selected");
            }, 10);
        });
    });
    
    function checkAnchorClick(theTarget) {
        var parent = false;
        if (theTarget.tagName.toLowerCase() != "a" && theTarget.parentNode)
            parent = true, theTarget = theTarget.parentNode; //let's try the parent so <a href="#foo"><img src="whatever.jpg"></a> will work
        if (theTarget.tagName.toLowerCase() == "a") {
        
        
            var custom=(typeof jq.ui.customClickHandler=="function")?jq.ui.customClickHandler:false;
            if(custom!==false&&jq.ui.customClickHandler(theTarget.href)){
               return true;
            }
            if (theTarget.href.toLowerCase().indexOf("javascript:") !== -1 || theTarget.getAttribute("data-ignore")) {
                return false;
            }
            
            if (theTarget.onclick && !jq.os.desktop) {
                theTarget.onclick();
            }
            
            if(theTarget.href.indexOf("tel:")===0)
               return false;
            if (theTarget.hash.indexOf("#") === -1 && theTarget.target.length > 0) 
            {
                
                if (theTarget.href.toLowerCase().indexOf("javascript:") != 0) {
                    if (jq.ui.isAppMobi)
                        AppMobi.device.launchExternal(theTarget.href);
                    else if (!jq.os.desktop)
                        brokerClickEventMobile(theTarget);
                    else
                        window.open(theTarget);
                    return true;
                }
                return false;
            }
            if ((theTarget.href.indexOf("#") !== -1 && theTarget.hash.length == 0) || theTarget.href.length == 0)
                return true;
            
            var mytransition = theTarget.getAttribute("data-transition");
            var resetHistory = theTarget.getAttribute("data-resetHistory");
            
            resetHistory = resetHistory && resetHistory.toLowerCase() == "true" ? true : false;
            
            var href = theTarget.hash.length > 0 ? theTarget.hash : theTarget.href;
            jq.ui.loadContent(href, resetHistory, 0, mytransition, theTarget);
            return true;
        }
    }
    function brokerClickEventMobile(theTarget) {
        if (jq.os.desktop)
            return;
        var clickevent = document.createEvent('Event');
        clickevent.initEvent('click', true, false);
        theTarget.target = "_blank";
        theTarget.dispatchEvent(clickevent);
    }
})();

//Touch events are from zepto/touch.js

(function($) {
    var touch = {}, touchTimeout;

    function parentIfText(node) {
        return 'tagName' in node ? node : node.parentNode;
    }

    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            return (x1 - x2 > 0 ? 'Left' : 'Right');
        } else {
            return (y1 - y2 > 0 ? 'Up' : 'Down');
        }
    }

    var longTapDelay = 750;
    function longTap() {
        if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
            touch.el.trigger('longTap');
            touch = {};
        }
    }
    $(document).ready(function() {
        $(document.body).bind('touchstart', function(e) {
            var now = Date.now(), delta = now - (touch.last || now);
            touch.el = $(parentIfText(e.touches[0].target));
            touchTimeout && clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            if (delta > 0 && delta <= 250)
                touch.isDoubleTap = true;
            touch.last = now;
            setTimeout(longTap, longTapDelay);
            if (!touch.el.data("ignore-pressed"))
                touch.el.addClass("selected");
            else
                touch.el.closest(".selectable").addClass("selected");
        }).bind('touchmove', function(e) {
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
        }).bind('touchend', function(e) {
            if (!touch.el) {
                touch = {};
                return;
                }
            if (!touch.el.data("ignore-pressed"))
                touch.el.removeClass("selected");
            else
                touch.el.closest(".selectable").removeClass("selected");
            if (touch.isDoubleTap) {
                touch.el.trigger('doubleTap');
                touch = {};
            } else if (Math.abs(touch.x1 - touch.x2) > 5 || Math.abs(touch.y1 - touch.y2) > 5) {
                (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) &&
                touch.el.trigger('swipe') &&
                touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
                touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
                touch={};
            } else if ('last' in touch) {
                touch.el.trigger('tap');
                touchTimeout = setTimeout(function() {
                    touchTimeout = null;
                    if (touch.el)
                        touch.el.trigger('singleTap');
                    touch = {};
                }, 250);
            }
        }).bind('touchcancel', function() {
            touch = {}
        });
    });

    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m) {
        $.fn[m] = function(callback) {
            return this.bind(m, callback)
        }
    });
})(jq);
(function($ui){
    
        function fadeTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    opacity: .1,
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            opacity: 1
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                currDiv.style.opacity = 0;
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms",
                            opacity: 1
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.fade = fadeTransition;
})($.ui);
(function($ui){
    
        function flipTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
                that.css3animate(oldDiv, {
                    x: "10%",
                    time: "200ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            opacity: 1
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    scale: '.8',
                    rotateY: "180deg",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms"
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.flip = flipTransition;
})($.ui);
(function($ui){
        
         function popTransition(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    opacity: .1,
                    scale: .2,
                    origin: "50% 50%",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms"
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "0%",
                    y: "0%",
                    time: "1ms",
                    scale: .2,
                    origin: "50% 50%",
                    opacity: .1,
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms",
                            scale: 1,
                            opacity: 1,
                            origin: "0% 0%"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.pop = popTransition;
})($.ui);
(function($ui){
    
        /**
         * Initiate a sliding transition.  This is a sample to show how transitions are implemented.  These are registered in $ui.availableTransitions and take in three parameters.
         * @param {Object} previous panel
         * @param {Object} current panel
         * @param {Boolean} go back
         * @title $ui.slideTransition(previousPanel,currentPanel,goBack);
         */
        function slideTransition(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            
            if (back) {
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "0ms"
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "-100%",
                    time: "0ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            } else {
                that.css3animate(oldDiv, {
                    x: "-100%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "0ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.slide = slideTransition;
        $ui.availableTransitions['default'] = slideTransition;
})($.ui);
(function($ui){
    
        function slideDownTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui;
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    y: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    y: "-100%",
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms"
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    y: "-100%",
                    x: "0%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.down = slideDownTransition;
})($.ui);
(function($ui){
    
        function slideUpTransition(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui;
            if (back) {
                that.css3animate(currDiv, {
                    x: "00%",
                    y: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    y: "100%",
                    x: "00%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms"
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "00%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    y: "100%",
                    x: "00%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "00%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.up = slideUpTransition;
})($.ui);

