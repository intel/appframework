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
		//override nativeScroll for old browsers
		if(!$.os.supportsNativeScroll) opts.useJsScroll=true;
		
        for (var i = 0; i < this.length; i++) {
            tmp = scroller(this[i], opts);
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
		var jsScroller, nativeScroller;
		
		//initialize and js/native mode selector
        var scroller = function(elID, opts) {
            
            if (typeof elID == "string" || elID instanceof String) {
                var el = document.getElementById(elID);
            } else {
                var el = elID;
            }
            if (!el) {
                alert("Could not find element for scroller " + elID);
                return;
            }
            
            if(opts.useJsScroll) return new jsScroller(el, opts);
			return new nativeScroller(el, opts);
        
        };
		
		//parent abstract class (common functionality)
        var scrollerCore = function() {};
		scrollerCore.prototype = {
			//core default properties
			refresh:false,
            refreshListeners:{
            	trigger:null,
				cancel:null,
				release:null	//Note: .release() - return false; will cancel auto-closing refresh, use .hideRefresh() to close it manually
            },
			refreshHangTimeout:2000,
			refreshHeight:60,
			scrollTop:0,
			scrollLeft:0,
			//methods
			init:function(el, opts) {
				this.el = el;
				this.jqEl = $(this.el);
				this.defaultProperties();
	            for (j in opts) {
	                this[j] = opts[j];
	            }
	        },
			handleEvent : function(e){
	    		switch(e.type) {
					case 'touchstart': this.onTouchStart(e); break;
					case 'touchmove': this.onTouchMove(e); break;
					case 'touchend': this.onTouchEnd(e); break;
	    		}
			},
			//Momentum adapted from iscroll4 http://www.cubiq.org
	        calculateMomentum:function(dist, time) {
	            var deceleration = 0.0012, 
	            speed = Math.abs(dist) / time, 
	            newDist = (speed * speed) / (2 * deceleration), newTime = 0
                
	            newDist = newDist * (dist < 0 ? -1 : 1);
	            newTime = speed / deceleration;
	            return {dist: newDist,time: newTime};
	        }
			
		}
		
		//extend to jsScroller and nativeScroller (constructs)
		jsScroller = function(el, opts){
			this.init(el, opts);
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
		nativeScroller = function(el, opts){
			this.init(el, opts);
			//test
			this.refresh=true;
			this.container = this.el;
            //Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
            if (this.refresh) {
                //add the refresh div
                var el = jq("<div class='jqscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;position:relative;bottom:0;text-align:center;line-height:60px;color:white;width:100%;'>Pull to Refresh</div>").get();
				this.refreshContainer = jq("<div style=\"overflow:visible;width:100%;height:0;margin:0;padding:0;padding-left:5px;padding-right:5px;\"></div>");
                $(this.el).append(this.refreshContainer.append(el, 'top').append("<div style=\"clear:both;\"></div>", 'bottom'), 'top');
				this.refreshContainer = this.refreshContainer[0];
            }
			
			this.initEvents();
		}
		nativeScroller.prototype = new scrollerCore();
		jsScroller.prototype = new scrollerCore();
		
		
		
		///Native scroller
		nativeScroller.prototype.defaultProperties = function(){

			this.refreshContainer=null;
			this.preventHideRefresh=true;
			this.moved=false;
			this.hasCanceled=false;
			this.dY = this.cY = 0;
			this.cancelPropagation = false;
		}
        nativeScroller.prototype.initEvents=function () {
            if(this.refresh) this.el.addEventListener('touchstart', this, false);
        }
        nativeScroller.prototype.removeEvents=function () {
            this.el.removeEventListener('touchstart', this, false);
        }
        nativeScroller.prototype.onTouchStart=function (e) {
			this.moved = false;
			this.preventHideRefresh=true;
			if(this.refresh&&this.el.scrollTop==0){
				this.el.addEventListener('touchmove', this, false);
	            this.dY = e.touches[0].pageY;
			}
        }
        nativeScroller.prototype.onTouchMove=function (e) {
			
			var newcY = e.touches[0].pageY - this.dY;
			if(!this.moved&&newcY<0){
				//forget about it
				this.el.removeEventListener('touchmove', this, false);
				this.el.removeEventListener('touchend', this, false);
				return;
			}
			
			if(!this.moved && newcY>0){
				//lets try
				this.scrollTop = this.el.scrollTop = this.refreshHeight;
				this.refreshContainer.style.height=this.refreshHeight+'px';
				this.el.addEventListener('touchend', this, false);
				this.moved=true;
			} else this.scrollTop = this.el.scrollTop;
			var difY = newcY-this.cY;
			//check for trigger
			if(this.refreshListeners.trigger && this.scrollTop>0 && (this.scrollTop-difY)<=0)
				this.refreshListeners.trigger.call();
			//check for cancel
			else if(!this.hasCanceled && this.refreshListeners.cancel && this.scrollTop<=0 && (this.scrollTop-difY)>0){
				this.refreshListeners.cancel.call();
				this.hasCanceled=true;
			}
			
			this.cY = newcY;
			e.stopPropagation();
        }
        nativeScroller.prototype.onTouchEnd=function (e) {
			var triggered = this.el.scrollTop<=0;
			var autoCancel = true;
			if(this.refreshListeners.release) autoCancel = this.refreshListeners.release.call(this, triggered)!==false;
			if(!triggered){
				this.preventHideRefresh = false;
			    this.hideRefresh();
			} else if(autoCancel) {
				var that = this;
				this.preventHideRefresh = false;
				if(this.refreshHangTimeout>0) setTimeout(function(){that.hideRefresh()}, this.refreshHangTimeout);
            }
			this.dY = this.cY = 0;
			this.hasCanceled=false;
			this.el.removeEventListener('touchmove', this, false);
			this.el.removeEventListener('touchend', this, false);
			e.stopPropagation();
        }
		nativeScroller.prototype.hideRefresh=function(){
			var that = this;
			if(that.preventHideRefresh) return;
			
			
			that.jqEl.css3Animate({
                y: (this.el.scrollTop-that.refreshHeight)+"px",
                x: "0%",
                time: "75ms",
				callback: function(){
					that.el.style.webkitTransform="none";
					that.el.style.webkitTransitionProperty="none";
					that.refreshContainer.style.height='0';
					that.el.scrollTop=0;
					that.dY = that.cY = 0;
				}
            });
			
			
			this.el.addEventListener('touchend', this, false);
		}
        nativeScroller.prototype.hideScrollbars=function() {}
        nativeScroller.prototype.scrollTo=function(pos) {
            this.el.scrollTop=-(pos.y);
            this.el.scrollLeft=-(pos.x);
        }
        nativeScroller.prototype.scrollBy=function(pos) {
            this.el.scrollTop+=pos.y;
            this.el.scrollLeft+=pos.x;
        }
		
		
		
		
		
		
		//JS scroller
		jsScroller.prototype.defaultProperties = function(){
            this.lockX=0;
            this.lockY=0;
            this.boolScrollLock=false;
            this.currentScrollingObject=null;
            this.bottomMargin=0;
            this.maxTop=0;
            this.startTop=0;
            this.verticalScroll=true;
            this.horizontalScroll=false;
            this.scrollBars=true;
            this.vscrollBar=null;
            this.hscrollBar=null;
            this.hScrollCSS="scrollBar";
            this.vScrollCSS="scrollBar";
            this.divHeight=0;
            this.lastScrollbar="";
            this.timeMoved=0;
            this.vdistanceMoved=0;
            this.hdistanceMoved=0;
            this.prevTime=0;
            this.finishScrollingObject=null;
            this.container=null;
            this.maxLeft=0;
            this.startLeft=0;
            this.rightMargin=0;
            this.divWidth=0;
            this.elementScrolling=false;
            this.scrollingFinishCB=false;
		}
        
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
        jsScroller.prototype.initEvents=function () {
    		this.el.addEventListener('touchstart', this, false);
            this.el.addEventListener('touchmove', this, false);
			this.el.addEventListener('touchend', this, false);
        }
        jsScroller.prototype.removeEvents=function () {
        	this.el.removeEventListener('touchstart', this);
            this.el.removeEventListener('touchmove', this);
			this.el.removeEventListener('touchend', this);
        }
        jsScroller.prototype.hideScrollbars=function() {
            if (this.hscrollBar)
            {
                this.hscrollBar.style.opacity = 0
                this.hscrollBar.style.webkitTransitionDuration = "0ms";
            }
            if (this.vscrollBar){
                this.vscrollBar.style.opacity = 0
                this.vscrollBar.style.webkitTransitionDuration = "0ms";
            }
        }
        jsScroller.prototype.onTouchStart=function(event) {
            var container = this.container;
            var eleScrolling = this.el;
            that=this;
            if (!container)
                return;
            if(this.elementScrolling){
               clearTimeout(that.scrollingFinishCB);
            }
            touchStarted = true
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
        }
        jsScroller.prototype.onTouchMove=function(event) {
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
                    var deltaY = event.touches[0].pageY - this.lockY;
                    var newTop = this.startTop + deltaY;
                    try {
                        var prevTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f);
                    } catch (prevTopE) {
                        var prevTop = 0;
                    }
                            
                    scrollPoints.y = newTop;
                }
                if (this.horizontalScroll && this.maxLeft > 0) {
                    var deltaX = event.touches[0].pageX - this.lockX;
                    var newLeft = this.startLeft + deltaX;
                    try {
                        var prevLeft = -numOnly((new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e));
                    } catch (prevLeftE) {
                        var prevLeft = 0;
                    }
                    scrollPoints.x = newLeft;
                        
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
        }
        jsScroller.prototype.onTouchEnd=function(event) {
                
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
                    if (this.refreshEnd) {
                        this.refreshEnd.call();
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
        }
        jsScroller.prototype.scrollerMoveCSS=function(el, distanceToMove, time, timingFunction) {
            if (!time)
                time = 0;
            if (!timingFunction)
                timingFunction = "linear";
                
            el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
            el.style.webkitTransitionDuration = time + "ms";
            el.style.webkitBackfaceVisiblity = "hidden";
            el.style.webkitTransitionTimingFunction = timingFunction;
        }
        jsScroller.prototype.scrollTo=function(pos, time) {
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
        }
        jsScroller.prototype.scrollBy=function(pos,time) {
            this.startTop = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f) - numOnly(this.container.scrollTop);
            this.startLeft = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e) - numOnly(this.container.scrollLeft);
            this.scrollTo({y:this.startTop-pos.y,x:this.startLeft-pos.x},time);
        }
		//return main function
        return scroller;
    })();
})(jq);