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
			refreshElement:null,
			scrollTop:0,
			scrollLeft:0,
			preventHideRefresh:true,
            verticalScroll: true,
            horizontalScroll: false,
			
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
					case 'scroll': 
						if(this.onScroll) this.onScroll(e);
					break;
	    		}
			},
			coreAddPullToRefresh : function(rEl){
				if(rEl) this.refreshElement=rEl; 
	            //Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
                //add the refresh div
				var orginalEl = document.getElementById(this.container.id + "_pulldown");
				if(this.refreshElement==null && orginalEl==null){
	                var jqEl = jq("<div id='" + this.container.id + "_pulldown' class='jqscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;position:relative;text-align:center;line-height:60px;color:white;width:100%;'>Pull to Refresh</div>");
				} else if(orginalEl!=null) {
					var jqEl = jq(orginalEl);
				} else {
					var jqEl = jq(this.refreshElement);
				}
				var el = jqEl.get();
					
				this.refreshContainer = jq("<div style=\"overflow:hidden;width:100%;height:0;margin:0;padding:0;padding-left:5px;padding-right:5px;\"></div>");
                $(this.el).prepend(this.refreshContainer.append(el, 'top'));
				this.refreshContainer = this.refreshContainer[0];
			},
			fireRefreshRelease:function(triggered, allowHide){
				if(!this.refresh) return;
				var autoCancel = true;
				if(this.refreshListeners.release!=null) autoCancel = this.refreshListeners.release.call(this, triggered)!==false;
				this.preventHideRefresh = false;
				if(!triggered){
					if(allowHide){
					    this.hideRefresh();
					}
				} else if(autoCancel) {
					var that = this;
					if(this.refreshHangTimeout>0) setTimeout(function(){that.hideRefresh()}, this.refreshHangTimeout);
	            }
			}
		}
		
		//extend to jsScroller and nativeScroller (constructs)
		jsScroller = function(el, opts){
			this.init(el, opts);
			//test
			this.refresh=true;
			
            this.container = this.el.parentNode;

			this.addPullToRefresh(null, true);
            this.initEvents();
            var windowHeight = window.innerHeight;
            var windowWidth = window.innerWidth;
                
            //create vertical scroll
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
			//create horizontal scroll
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
            
		};
		nativeScroller = function(el, opts){
			this.init(el, opts);
			//test
			this.refresh=true;
			
			this.el.style.overflow='auto';
            if(this.verticalScroll) this.el.style.overflowY='auto';
            if(this.horizontalScroll) this.el.style.overflowX='auto';
            
			
			
			this.container = this.el;
			this.addPullToRefresh(null, true);
			this.initEvents();
		}
		nativeScroller.prototype = new scrollerCore();
		jsScroller.prototype = new scrollerCore();
		
		
		
		///Native scroller
		nativeScroller.prototype.defaultProperties = function(){

			this.refreshContainer=null;
			this.moved=false;
			this.hasCanceled=false;
			this.dY = this.cY = 0;
			this.cancelPropagation = false;
		}
        nativeScroller.prototype.initEvents=function () {
            if(this.refresh) this.el.addEventListener('touchstart', this, false);
			this.el.addEventListener('scroll', this, false);
        }
        nativeScroller.prototype.removeEvents=function () {
            this.el.removeEventListener('touchstart', this, false);
        }
		nativeScroller.prototype.addPullToRefresh=function(el, leaveRefresh){
			if(!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh == true) {
	                this.coreAddPullToRefresh(el);
            }
		}
        nativeScroller.prototype.onTouchStart=function (e) {
			this.moved = false;
			this.preventHideRefresh=true;
			//get refresh ready
			if(this.refresh&&this.el.scrollTop==0){
				this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
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
            this.fireRefreshRelease(triggered, true);
			
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

            this.boolScrollLock=false;
            this.currentScrollingObject=null;
			this.elementInfo = null;
            this.verticalScroll=true;
            this.horizontalScroll=false;
            this.scrollBars=true;
            this.vscrollBar=null;
            this.hscrollBar=null;
            this.hScrollCSS="scrollBar";
            this.vScrollCSS="scrollBar";

            this.lastScrollbar="";

            this.finishScrollingObject=null;
            this.container=null;
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
		jsScroller.prototype.addPullToRefresh=function(el, leaveRefresh){
			if(!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh == true) {
	                this.coreAddPullToRefresh(el);
					this.el.style.overflow='visible';
					this.el.style.overflowX='visible';
					this.el.style.overflowY='visible';
            }
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
            if (!this.container)
                return;
            if(this.elementScrolling){
               clearTimeout(this.scrollingFinishCB);
            }
            touchStarted = true;
			
			//disable if locked
			if(event.touches.length != 1 || this.boolScrollLock) return;
			
            // Allow interaction to legit calls, like select boxes, etc.
            if (event.touches[0].target && event.touches[0].target.type != undefined) {
                var tagname = event.touches[0].target.tagName.toLowerCase();
                if (tagname == "select" || tagname == "input" || tagname == "button") // stuff we need to allow
                    // access to legit calls
                    return;
            }
			
			//save event
			this.saveEventInfo(event);
			
			//default variables
			var scrollInfo = {
				//current position
				top:0,
				left:0,
				//current movement
				speedY:0,
				absSpeedY:0,
				absSpeedX:0,
				y:0,
				x:0,
				targetTime:0,
				duration:0
            };
			//element info
			var cnt = $(this.container);
			this.elementInfo = {};
			this.elementInfo.bottomMargin 	= (this.container.clientHeight > window.innerHeight ? window.innerHeight : this.container.clientHeight-numOnly(cnt.css("marginTop"))-numOnly(cnt.css("paddingTop"))-numOnly(cnt.css("marginBottom"))-numOnly(cnt.css("paddingBottom")));
			this.elementInfo.maxTop 		= (this.el.clientHeight - this.elementInfo.bottomMargin);
			this.elementInfo.divHeight  	= this.el.clientHeight;
	        this.elementInfo.rightMargin 	= (this.container.clientWidth > window.innerWidth ? window.innerWidth : this.container.clientWidth-numOnly(cnt.css("marginLeft"))-numOnly(cnt.css("paddingLeft"))-numOnly(cnt.css("marginRight"))-numOnly(cnt.css("paddingRight")));
	        this.elementInfo.maxLeft 		= (this.el.clientWidth - this.elementInfo.rightMargin);
	        this.elementInfo.divWidth 		= this.el.clientWidth;
			this.elementInfo.hasVertScroll 	= this.elementInfo.maxTop > 0;
			this.elementInfo.hasHorScroll 	= this.elementInfo.maxLeft > 0;
			this.elementInfo.requiresVScrollBar 	= this.vscrollBar && this.elementInfo.hasVertScroll;
			this.elementInfo.requiresHScrollBar 	= this.hscrollBar && this.elementInfo.hasHorScroll;
			
			//get the current top
            try {
                scrollInfo.top = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).f) - numOnly(this.container.scrollTop);
                scrollInfo.left = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform).e) - numOnly(this.container.scrollLeft);
                        
            } catch (e) {
                scrollInfo.top = 0 + this.container.scrollTop;
                scrollInfo.left = 0 + this.container.scrollLeft;
                console.log("error scroller touchstart " + e);
            }
			this.container.scrollTop = this.container.scrollLeft = 0;
			this.currentScrollingObject = this.el;
			
			//get refresh ready
			if(this.refresh&&scrollInfo.top==0){
				this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
				this.refreshContainer.firstChild.style.top=(-this.refreshHeight)+'px';
				this.refreshContainer.style.overflow='visible';
			}
			
			//set target
			scrollInfo.x = scrollInfo.left;
			scrollInfo.y = scrollInfo.top;
			
			//set everything in position
            this.scrollerMoveCSS(this.el, scrollInfo, 0);

			//vertical scroll bar
			if(this.setVScrollBar(scrollInfo)){
	            if (this.container.clientWidth > window.innerWidth)
	                this.vscrollBar.style.left = (window.innerWidth - numOnly(this.vscrollBar.style.width) * 3) + "px";
	            else
	                this.vscrollBar.style.right = "0px";
	            this.vscrollBar.style.webkitTransition = '';
	            this.vscrollBar.style.opacity = 1;
			}
			
			//horizontal scroll
			if(this.setHScrollBar(scrollInfo)){
                if (this.container.clientHeight > window.innerHeight)
                    this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height)) + "px";
                else
                    this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
                this.vscrollBar.style.webkitTransition = ''; 
                this.hscrollBar.style.opacity = 1;
			}

			//save scrollInfo
			this.lastScrollInfo = scrollInfo;
        }
		jsScroller.prototype.saveEventInfo=function(event){
			this.lastEventInfo = {
	            pageX: event.touches[0].pageX,
	            pageY: event.touches[0].pageY,
				time: event.timeStamp
			}
		}
		jsScroller.prototype.setVScrollBar=function(scrollInfo, timingFunction){
			if(!this.elementInfo.requiresVScrollBar) return false;
			var newHeight = (parseFloat(this.elementInfo.bottomMargin / this.elementInfo.divHeight) * this.elementInfo.bottomMargin) + "px";
			if(newHeight!=this.vscrollBar.style.height) this.vscrollBar.style.height = newHeight;
			var pos = (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.elementInfo.maxTop + scrollInfo.y) / this.elementInfo.maxTop) * (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)));      
            if (pos > this.elementInfo.bottomMargin)
                pos = this.elementInfo.bottomMargin;
            if (pos < 0)
                pos = 0;
			this.scrollerMoveCSS(this.vscrollBar, {x: 0,y: pos}, scrollInfo.duration, timingFunction);
			return true;
		}
		jsScroller.prototype.setHScrollBar=function(scrollInfo, timingFunction){
			if(!this.elementInfo.requiresHScrollBar) return false;
			var newWidth = (parseFloat(this.elementInfo.rightMargin / this.elementInfo.divWidth) * this.elementInfo.rightMargin) + "px";
			if(newWidth!=this.hscrollBar.style.width) this.hscrollBar.style.width = newWidth;
            var pos = (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.elementInfo.maxLeft + scrollInfo.x) / this.elementInfo.maxLeft) * (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)));     
            
            if (pos > this.elementInfo.rightMargin)
                pos = this.elementInfo.rightMargin;
            if (pos < 0)
                pos = 0;
			
			this.scrollerMoveCSS(this.hscrollBar, {x: pos,y: 0}, scrollInfo.duration, timingFunction);
			return true;
		}
		
		
		
        jsScroller.prototype.onTouchMove=function(event) {
            if (this.currentScrollingObject == null) return;
			event.preventDefault();
			
			var scrollInfo = this.calculateMovement(event);
			
			
			if(this.checkSignificance(scrollInfo)){
				
				var elasticOverflow = scrollInfo.top>=0 || scrollInfo.top <= -this.elementInfo.maxTop;
				
				var runFactor = (scrollInfo.duration>0 && !elasticOverflow ? 10 : 1);
				scrollInfo=this.calculateTarget(scrollInfo, runFactor, elasticOverflow);
				
				//pull to refresh elastic
	            if (elasticOverflow && (scrollInfo.y > 0 || scrollInfo.y < -this.elementInfo.maxTop)) 
	            {   
	                var overflow = (scrollInfo.deltaY + this.elementInfo.maxTop);
	                var height = (this.container.clientHeight - overflow) / this.container.clientHeight;  
	                if (height < .5)
	                    height = .5;
	                if (scrollInfo.y > 0)
	                    scrollInfo.y = scrollInfo.y + scrollInfo.deltaY * height;
	                else {
	                    scrollInfo.y = scrollInfo.y - scrollInfo.deltaY * height;
	                }
					scrollInfo.y = Math.floor(scrollInfo.y);
	            }
				
				//significant move
                this.scrollerMoveCSS(this.currentScrollingObject, scrollInfo, scrollInfo.duration);
				this.setVScrollBar(scrollInfo, 0);
				this.setHScrollBar(scrollInfo, 0);
				
				//check refresh triggering
				if(this.refresh){
					if(this.lastScrollInfo.top<this.refreshHeight && scrollInfo.top>this.refreshHeight){
						if(this.refreshListeners.trigger) this.refreshListeners.trigger.call();
					} else if(this.lastScrollInfo.top>this.refreshHeight && scrollInfo.top<this.refreshHeight){
						if(this.refreshListeners.cancel) this.refreshListeners.cancel.call();
					}
				}
				
				this.lastScrollInfo = scrollInfo;
			}
			
			this.saveEventInfo(event);
        }
		
		//TODO: improve/tweak for best smoothnesss and performance
		jsScroller.prototype.checkSignificance=function(scrollInfo){
			
			//really small move - make it immediate
			//console.log(scrollInfo.duration+" -- "+(scrollInfo.deltaY+scrollInfo.deltaX));
            if (Math.abs(scrollInfo.deltaY+scrollInfo.deltaX)<10){
            	scrollInfo.duration = 0;
				return true;
            }
			
			//Y significance
			var significantY, significantX;
			if(this.elementInfo.hasVertScroll){
				//change direction
				significantY = this.lastScrollInfo.speedY<0 ? scrollInfo.speedY>0 : scrollInfo.speedY<0;
				//if(significantY) console.log("significant direction");
				//significant speedchange
				significantY = significantY || this.lastScrollInfo.absSpeedY*0.5>scrollInfo.absSpeedY || this.lastScrollInfo.absSpeedY*1.5<scrollInfo.absSpeedY;
				//if(significantY) console.log("significant speedchange");
				//TODO - movement significance
				//
			} else significantY = false;
				
			//X significance
			if(this.elementInfo.hasHorScroll){
				//change direction
				significantX = this.lastScrollInfo.speedX<0 ? scrollInfo.speedX>0 : scrollInfo.speedX<0;
				//significant speedchange
				significantX = significantX || this.lastScrollInfo.absSpeedX*0.5>scrollInfo.absSpeedX || this.lastScrollInfo.absSpeedX*1.5<scrollInfo.absSpeedX;
				//TODO - movement significance
				//
				
			} else significantX = false;
			
			return significantY || significantX;
		}
		
		jsScroller.prototype.calculateMovement=function(event){
			//default variables
			var scrollInfo = {
				//current position
				top:0,
				left:0,
				//current movement
				speedY:0,
				speedX:0,
				absSpeedY:0,
				absSpeedX:0,
				deltaY:0,
				deltaX:0,
				y:0,
				x:0,
				targetTime:0,
				duration:0
            };
			
			
			if(event.touches && event.touches.length==1){
	        	scrollInfo.deltaY = this.elementInfo.hasVertScroll ? event.touches[0].pageY - this.lastEventInfo.pageY : 0;
	            scrollInfo.deltaX = this.elementInfo.hasHorScroll ? event.touches[0].pageX - this.lastEventInfo.pageX : 0;
				scrollInfo.duration = event.timeStamp - this.lastEventInfo.time;
			} else {
	        	scrollInfo.deltaY = this.lastScrollInfo.deltaY;
	            scrollInfo.deltaX = this.lastScrollInfo.deltaX;
				scrollInfo.duration = this.lastScrollInfo.duration;
			}
			
			//do not divide by 0! breaks stuff
			if(scrollInfo.duration!=0){
				scrollInfo.speedY = scrollInfo.deltaY/scrollInfo.duration;
				scrollInfo.speedX = scrollInfo.deltaX/scrollInfo.duration;
			} else {
				scrollInfo.speedY =  0;
				scrollInfo.speedX = 0;
			}
			
			scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
			scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
			
			return scrollInfo;
		}
		jsScroller.prototype.calculateTarget=function(scrollInfo,factor, elasticOverflow){
			var transf = new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform);
			scrollInfo.top = numOnly(transf.f);
			scrollInfo.left = numOnly(transf.e);
			
			scrollInfo.y = Math.floor(scrollInfo.top+scrollInfo.deltaY*factor);
			scrollInfo.x = Math.floor(scrollInfo.left+scrollInfo.deltaX*factor);
			scrollInfo.duration = Math.floor(scrollInfo.duration*factor);
			
			//boundaries
            if (!elasticOverflow && scrollInfo.y > 0) {
                scrollInfo.y = 0;
                scrollInfo.duration = 200;
            } else if(scrollInfo.x > 0){
                scrollInfo.x = 0;
                scrollInfo.duration = 200;
            }
                        
            if (!elasticOverflow && scrollInfo.y < (-this.elementInfo.maxTop)) {
                scrollInfo.y = -this.elementInfo.maxTop;
                scrollInfo.duration = 200;
            } else if (scrollInfo.x < (-this.elementInfo.maxLeft)) {
                scrollInfo.x = -this.elementInfo.maxLeft;
                scrollInfo.duration = 200;
            }
			
			
			
			return scrollInfo;
		}
		jsScroller.prototype.hideRefresh=function(){
			this.scrollerMoveCSS(this.el, {x:0,y:0}, 75);
		}
		
		jsScroller.prototype.setMomentum=function(scrollInfo) {
            var deceleration = 0.0012; 
			
			if(scrollInfo.y>0){
				scrollInfo.deltaY = (scrollInfo.deltaY < 0 ? -1 : 1) * (scrollInfo.absSpeedY * scrollInfo.absSpeedY) / (2 * deceleration);
				scrollInfo.duration = scrollInfo.absSpeedY / deceleration;
			} else {
				scrollInfo.deltaX = (scrollInfo.deltaX < 0 ? -1 : 1) * (scrollInfo.absSpeedX * scrollInfo.absSpeedY) / (2 * deceleration);
				scrollInfo.duration = scrollInfo.absSpeedX / deceleration;
			}

            return scrollInfo;
		}
		
		
        jsScroller.prototype.onTouchEnd=function(event) {

            if (this.currentScrollingObject == null) return;
            
			event.preventDefault();
            this.finishScrollingObject = this.currentScrollingObject;
            this.currentScrollingObject = null;
            
			var scrollInfo = this.calculateMovement(event);
			scrollInfo=this.setMomentum(scrollInfo);
			scrollInfo=this.calculateTarget(scrollInfo, 10, false);
			var triggered = scrollInfo.top > this.refreshHeight;
            this.fireRefreshRelease(triggered, scrollInfo.top>0);

			//refresh hang in
			if(this.refresh && triggered) {
				scrollInfo.y = this.refreshHeight;
				scrollInfo.duration = 75;
			//top boundary
			} else if(scrollInfo.y >= 0){
				scrollInfo.y = 0;
				scrollInfo.duration = 75;
			//lower boundary
			} else if(-scrollInfo.y > this.elementInfo.maxTop){
				scrollInfo.y = -this.elementInfo.maxTop;
				scrollInfo.duration = 75;
			//all others
			} else {
	            if (scrollInfo.duration < 300)
	                scrollInfo.duration = 300;
			}
			
            this.scrollerMoveCSS(this.finishScrollingObject, scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			this.setVScrollBar(scrollInfo, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setHScrollBar(scrollInfo, "cubic-bezier(0.33,0.66,0.66,1)");
			
			if(isNaN(scrollInfo.duration)){
				this.hideScrollbars();
				this.elementScrolling=false;
				if(this.onScroll) this.onScroll(e);
			} else {
				var that = this;
				this.scrollingFinishCB=setTimeout(function(){that.hideScrollbars();that.elementScrolling=false;if(this.onScroll) this.onScroll(e);},scrollInfo.duration);
			}

			this.elementScrolling=true;
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
