/**
 * jq.scroller - a scrolling library for jqMobi apps
 * Copyright 2011 - AppMobi 
 */ 
 (function($) {
    var cache = [];
	var objId=function(obj){
		if(!obj.jqmScrollerId) obj.jqmScrollerId=$.uuid();
		return obj.jqmScrollerId;
	}
    $.fn["scroller"] = function(opts) {
        var tmp, id;
        for (var i = 0; i < this.length; i++) {
			//cache system
			id = objId(this[i]);
			if(!cache[id]){
				if(!opts) opts = {};
				if(!$.feat.nativeTouchScroll) opts.useJsScroll = true;
				tmp = scroller(this[i], opts);
				cache[id] = tmp;
			} else {
				tmp = cache[id];
			}
        }
        return this.length == 1 ? tmp : this;
    };
    var scroller = (function() {
        if (!window.WebKitCSSMatrix)
            return;
		var allows3D = 'm11' in new WebKitCSSMatrix();
        var translateOpen = allows3D ? "3d(" : "(";
        var translateClose = allows3D ? ",0)" : ")";
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
			refreshCancelCB:null,
			scrollTop:0,
			scrollLeft:0,
			preventHideRefresh:true,
            verticalScroll: true,
            horizontalScroll: false,
			refreshTriggered: false,
			moved : false,
			eventsActive:false,
			rememberEventsActive:false,
			scrollingLocked:false,
			autoEnable:true,
			
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
				if(!this.scrollingLocked){
		    		switch(e.type) {
						case 'touchstart': 
							this.preventHideRefresh = true;
							this.moved = false;
							this.onTouchStart(e); 
						break;
						case 'touchmove': this.onTouchMove(e); break;
						case 'touchend': this.onTouchEnd(e); break;
						case 'scroll': 
							if(this.onScroll) this.onScroll(e);
						break;
		    		}
				}
			},
			coreAddPullToRefresh : function(rEl){
				if(rEl) this.refreshElement=rEl; 
	            //Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
                //add the refresh div
				
				if(this.refreshElement==null){
					var orginalEl = document.getElementById(this.container.id + "_pulldown");
					if(orginalEl!=null){
						var jqEl = jq(orginalEl);
					} else {
						var jqEl = jq("<div id='" + this.container.id + "_pulldown' class='jqscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;position:relative;text-align:center;line-height:60px;color:white;width:100%;'>Pull to Refresh</div>");
					}
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
					if(this.refreshHangTimeout>0) this.refreshCancelCB = setTimeout(function(){that.hideRefresh()}, this.refreshHangTimeout);
	            }
			},
			lock:function(){
				if(this.scrollingLocked) return;
				this.scrollingLocked=true;
				this.rememberEventsActive = this.eventsActive;
				if(!this.eventsActive){
					this.initEvents();
				}
			},
			unlock:function(){
				if(!this.scrollingLocked) return;
				this.scrollingLocked=false;
				if(!this.rememberEventsActive){
					this.removeEvents();
				}
			}
		}
		
		//extend to jsScroller and nativeScroller (constructs)
		jsScroller = function(el, opts){
			this.init(el, opts);
			//test
			//this.refresh=true;
			
            this.container = this.el.parentNode;
			
			if(this.container.style.overflow != 'hidden' && this.container.style.overflow != 'visible') this.container.style.overflow = 'hidden';

			this.addPullToRefresh(null, true);
            if(this.autoEnable) this.enable();
                
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
			//this.refresh=true;

			this.container = this.el;
			this.addPullToRefresh(null, true);
			if(this.autoEnable) this.enable();
		}
		nativeScroller.prototype = new scrollerCore();
		jsScroller.prototype = new scrollerCore();
		
		
		
		///Native scroller
		nativeScroller.prototype.defaultProperties = function(){

			this.refreshContainer=null;
			this.dY = this.cY = 0;
			this.cancelPropagation = false;
		}
        nativeScroller.prototype.enable=function () {
			this.el.style.overflow='auto';
            if(this.refresh) this.el.addEventListener('touchstart', this, false);
			this.el.addEventListener('scroll', this, false);
			this.eventsActive = true;
        }
        nativeScroller.prototype.disable=function () {
			this.el.style.overflow='hidden';
            this.el.removeEventListener('touchstart', this, false);
			this.el.removeEventListener('scroll', this, false);
			this.eventsActive = false;
        }
		nativeScroller.prototype.addPullToRefresh=function(el, leaveRefresh){
			if(!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh == true) {
	                this.coreAddPullToRefresh(el);
            }
		}
        nativeScroller.prototype.onTouchStart=function (e) {
			if(this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
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
			if(this.refreshListeners.trigger && !this.refreshTriggered && (this.scrollTop-difY)<=0){
				this.refreshTriggered = true;
				this.refreshListeners.trigger.call();
			//check for cancel
			} else if(this.refreshListeners.cancel && this.refreshTriggered && (this.scrollTop-difY)>0){
				this.refreshTriggered = false;
				this.refreshListeners.cancel.call();
			}
			
			this.cY = newcY;
			//e.stopPropagation();
        }
        nativeScroller.prototype.onTouchEnd=function (e) {
			var triggered = this.el.scrollTop<=0;
            this.fireRefreshRelease(triggered, true);
			
			this.dY = this.cY = 0;
			this.el.removeEventListener('touchmove', this, false);
			this.el.removeEventListener('touchend', this, false);
			//e.stopPropagation();
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
			
			this.refreshTriggered=false;
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
			this.firstEventInfo=null;
			this.moved=false;
			this.preventPullToRefresh = true;
			this.doScrollInterval = null;
			this.refreshRate = 75;

            this.lastScrollbar="";
            this.finishScrollingObject=null;
            this.container=null;
            this.scrollingFinishCB=null;
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
        jsScroller.prototype.enable=function () {
    		this.container.addEventListener('touchstart', this, false);
            this.container.addEventListener('touchmove', this, false);
			this.container.addEventListener('touchend', this, false);
			this.eventsActive = true;
        }
        jsScroller.prototype.disable=function () {
        	this.container.removeEventListener('touchstart', this, false);
            this.container.removeEventListener('touchmove', this, false);
			this.container.removeEventListener('touchend', this, false);
			this.eventsActive = false;
        }
		jsScroller.prototype.addPullToRefresh=function(el, leaveRefresh){
			if(!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh == true) {
	                this.coreAddPullToRefresh(el);
					this.el.style.overflow='visible';
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
			
			this.moved = false;
			this.currentScrollingObject = null;
			
			if (!this.container)
                return;
			if(this.refreshCancelCB) {
				clearTimeout(this.refreshCancelCB);
				this.refreshCancelCB = null;
			}
            if(this.scrollingFinishCB) {
				clearTimeout(this.scrollingFinishCB);
				this.scrollingFinishCB=null;
			}
			
			//disable if locked
			if(event.touches.length != 1 || this.boolScrollLock) return;
			
            // Allow interaction to legit calls, like select boxes, etc.
            if (event.touches[0].target && event.touches[0].target.type != undefined) {
                var tagname = event.touches[0].target.tagName.toLowerCase();
                if (tagname == "select" || tagname == "input" || tagname == "button") // stuff we need to allow
                    // access to legit calls
                    return;
            }

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
				absDeltaY:0,
				absDeltaX:0,
				y:0,
				x:0,
				duration:0
            };
			
			//element info
			var cnt = $(this.container);
			this.elementInfo = {};
			this.elementInfo.bottomMargin 	= (this.container.clientHeight > window.innerHeight ? window.innerHeight : this.container.clientHeight-numOnly(cnt.css("marginTop"))-numOnly(cnt.css("paddingTop"))-numOnly(cnt.css("marginBottom"))-numOnly(cnt.css("paddingBottom")));
			this.elementInfo.maxTop 		= (this.el.clientHeight - this.elementInfo.bottomMargin);
			if(this.elementInfo.maxTop<0) this.elementInfo.maxTop = 0;
			this.elementInfo.divHeight  	= this.el.clientHeight;
	        this.elementInfo.rightMargin 	= (this.container.clientWidth > window.innerWidth ? window.innerWidth : this.container.clientWidth-numOnly(cnt.css("marginLeft"))-numOnly(cnt.css("paddingLeft"))-numOnly(cnt.css("marginRight"))-numOnly(cnt.css("paddingRight")));
	        this.elementInfo.maxLeft 		= (this.el.clientWidth - this.elementInfo.rightMargin);
			if(this.elementInfo.maxLeft<0) this.elementInfo.maxLeft = 0;
	        this.elementInfo.divWidth 		= this.el.clientWidth;
			this.elementInfo.hasVertScroll 	= this.verticalScroll || this.elementInfo.maxTop > 0;
			this.elementInfo.hasHorScroll 	= this.elementInfo.maxLeft > 0;
			this.elementInfo.requiresVScrollBar 	= this.vscrollBar && this.elementInfo.hasVertScroll;
			this.elementInfo.requiresHScrollBar 	= this.hscrollBar && this.elementInfo.hasHorScroll;
			
			//save event
			this.saveEventInfo(event);
			this.saveFirstEventInfo(event);
			
			//get the current top
			var cssMatrix = this.getCSSMatrix(this.el);
            scrollInfo.top = numOnly(cssMatrix.f) - numOnly(this.container.scrollTop);
            scrollInfo.left = numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft);

			this.container.scrollTop = this.container.scrollLeft = 0;
			this.currentScrollingObject = this.el;
			
			//get refresh ready
			if(this.refresh&&scrollInfo.top==0){
				this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
				this.refreshContainer.firstChild.style.top=(-this.refreshHeight)+'px';
				this.refreshContainer.style.overflow='visible';
				this.preventPullToRefresh = false;
			} else if(scrollInfo.top<0) {
				this.preventPullToRefresh = true;
				if(this.refresh) this.refreshContainer.style.overflow='hidden';
			}
			
			//set target
			scrollInfo.x = scrollInfo.left;
			scrollInfo.y = scrollInfo.top;

			//vertical scroll bar
			if(this.setVScrollBar(scrollInfo, 0, 0)){
	            if (this.container.clientWidth > window.innerWidth)
	                this.vscrollBar.style.left = (window.innerWidth - numOnly(this.vscrollBar.style.width) * 3) + "px";
	            else
	                this.vscrollBar.style.right = "0px";
	            this.vscrollBar.style.webkitTransition = '';
	            this.vscrollBar.style.opacity = 1;
			}
			
			//horizontal scroll
			if(this.setHScrollBar(scrollInfo, 0, 0)){
                if (this.container.clientHeight > window.innerHeight)
                    this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height)) + "px";
                else
                    this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
                this.vscrollBar.style.webkitTransition = ''; 
                this.hscrollBar.style.opacity = 1;
			}

			//save scrollInfo
			this.lastScrollInfo = scrollInfo;
			
			//just in case...
			if(this.doScrollInterval) window.clearInterval(this.doScrollInterval);
			this.doScrollInterval = null;
			var that = this;
			this.doScrollInterval = window.setInterval(function(){that.doScroll();}, this.refreshRate);
        }
		jsScroller.prototype.getCSSMatrix = function(el){
			var str = window.getComputedStyle(el).webkitTransform;	//fix for BB transform 'none'
			if(str=='none') return {f:0,e:0};
			var obj = new WebKitCSSMatrix(str);
			return obj;
		}
		jsScroller.prototype.saveEventInfo=function(event){
			this.lastEventInfo = {
	            pageX: event.touches[0].pageX,
	            pageY: event.touches[0].pageY,
				time: event.timeStamp
			}
		}
		jsScroller.prototype.saveFirstEventInfo=function(event){
			this.firstEventInfo = {
	            pageX: event.touches[0].pageX,
	            pageY: event.touches[0].pageY,
				time: event.timeStamp
			}
		}
		jsScroller.prototype.setVScrollBar=function(scrollInfo, time, timingFunction){
			if(!this.elementInfo.requiresVScrollBar) return false;
			var newHeight = (parseFloat(this.elementInfo.bottomMargin / this.elementInfo.divHeight) * this.elementInfo.bottomMargin) + "px";
			if(newHeight!=this.vscrollBar.style.height) this.vscrollBar.style.height = newHeight;
			var pos = (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.elementInfo.maxTop + scrollInfo.y) / this.elementInfo.maxTop) * (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)));      
            if (pos > this.elementInfo.bottomMargin)
                pos = this.elementInfo.bottomMargin;
            if (pos < 0)
                pos = 0;
			this.scrollbarMoveCSS(this.vscrollBar, {x: 0,y: pos}, time, timingFunction);
			return true;
		}
		jsScroller.prototype.setHScrollBar=function(scrollInfo, time, timingFunction){
			if(!this.elementInfo.requiresHScrollBar) return false;
			var newWidth = (parseFloat(this.elementInfo.rightMargin / this.elementInfo.divWidth) * this.elementInfo.rightMargin) + "px";
			if(newWidth!=this.hscrollBar.style.width) this.hscrollBar.style.width = newWidth;
            var pos = (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.elementInfo.maxLeft + scrollInfo.x) / this.elementInfo.maxLeft) * (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)));     
            
            if (pos > this.elementInfo.rightMargin)
                pos = this.elementInfo.rightMargin;
            if (pos < 0)
                pos = 0;
			
			this.scrollbarMoveCSS(this.hscrollBar, {x: pos,y: 0}, time, timingFunction);
			return true;
		}
		
		
		
        jsScroller.prototype.onTouchMove=function(event) {
            if (this.currentScrollingObject == null) return;
			//event.preventDefault();
			
			var scrollInfo = this.calculateMovement(event);
			this.calculateTarget(scrollInfo);
				
			this.lastScrollInfo = scrollInfo;
			this.moved = true;

			this.saveEventInfo(event);
        }
		
		jsScroller.prototype.doScroll=function(){
			var cssMatrix = this.getCSSMatrix(this.el);
			this.lastScrollInfo.top = numOnly(cssMatrix.f);
			this.lastScrollInfo.left = numOnly(cssMatrix.e);
			
			this.recalculateDeltaY(this.lastScrollInfo);
			this.recalculateDeltaX(this.lastScrollInfo);
			
			//boundaries control
			this.checkYboundary(this.lastScrollInfo);
			if(this.elementInfo.hasHorScroll) this.checkXboundary(this.lastScrollInfo);
					
			//pull to refresh elastic
			var positiveOverflow = this.lastScrollInfo.y > 0 && this.lastScrollInfo.deltaY>0;
			var negativeOverflow = this.lastScrollInfo.y < -this.elementInfo.maxTop && this.lastScrollInfo.deltaY<0;
            if (positiveOverflow || negativeOverflow) 
            {   
                var overflow = positiveOverflow ? this.lastScrollInfo.y : -this.lastScrollInfo.y-this.elementInfo.maxTop;
                var pcent = (this.container.clientHeight - overflow) / this.container.clientHeight;  
				if(pcent<.5) pcent = .5;
				//cur top, maxTop or 0?
				var baseTop = 0;
				if((positiveOverflow && this.lastScrollInfo.top>0) || (negativeOverflow && this.lastScrollInfo.top<-this.elementInfo.maxTop)){
					baseTop = this.lastScrollInfo.top;
				} else if(negativeOverflow){
					baseTop = -this.elementInfo.maxTop;
				}
				var changeY = this.lastScrollInfo.deltaY * pcent;
				var absChangeY = Math.abs(this.lastScrollInfo.deltaY * pcent);
				if(absChangeY<1) changeY = positiveOverflow ? 1 : -1;
                this.lastScrollInfo.y = baseTop + changeY;
            }
					
			//move
            this.scrollerMoveCSS(this.lastScrollInfo, 0);
			this.setVScrollBar(this.lastScrollInfo, 0, 0);
			this.setHScrollBar(this.lastScrollInfo, 0, 0);
				
			//check refresh triggering
			if(this.refresh && !this.preventPullToRefresh){
				if(!this.refreshTriggered && this.lastScrollInfo.top>this.refreshHeight){
					this.refreshTriggered=true;
					if(this.refreshListeners.trigger) this.refreshListeners.trigger.call();
				} else if(this.refreshTriggered && this.lastScrollInfo.top<this.refreshHeight){
					this.refreshTriggered=false;
					if(this.refreshListeners.cancel) this.refreshListeners.cancel.call();
				}
			}
			
		}
		
		jsScroller.prototype.calculateMovement=function(event, last){
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
				absDeltaY:0,
				absDeltaX:0,
				y:0,
				x:0,
				duration:0
            };
			
			var prevEventInfo = last ? this.firstEventInfo : this.lastEventInfo ;
			var pageX = last ? event.pageX : event.touches[0].pageX;
			var pageY = last ? event.pageY : event.touches[0].pageY;
			var time = last ? event.time : event.timeStamp;
			
        	scrollInfo.deltaY = this.elementInfo.hasVertScroll ? pageY - prevEventInfo.pageY : 0;
            scrollInfo.deltaX = this.elementInfo.hasHorScroll ? pageX - prevEventInfo.pageX : 0;
			scrollInfo.time = time;
			
			scrollInfo.duration = time - prevEventInfo.time;
			
			return scrollInfo;
		}
		
		jsScroller.prototype.calculateTarget=function(scrollInfo){
			scrollInfo.y = this.lastScrollInfo.y+scrollInfo.deltaY;
			scrollInfo.x = this.lastScrollInfo.x+scrollInfo.deltaX;
		}
		jsScroller.prototype.checkYboundary=function(scrollInfo){
			var minTop = this.container.clientHeight/2;
			var maxTop = this.elementInfo.maxTop+minTop;
			//y boundaries
			if(scrollInfo.y>minTop) scrollInfo.y = minTop;
			else if(-scrollInfo.y>maxTop) scrollInfo.y = -maxTop;
			else return;
			
			this.recalculateDeltaY(scrollInfo);
		}
		jsScroller.prototype.checkXboundary=function(scrollInfo){
			//x boundaries
			if(scrollInfo.x>0) scrollInfo.x = 0;
			else if(-scrollInfo.x>this.elementInfo.maxLeft) scrollInfo.x = -this.elementInfo.maxLeft;
			else return;
						
			this.recalculateDeltaY(scrollInfo);
		}
		jsScroller.prototype.recalculateDeltaY=function(scrollInfo){
			//recalculate delta
			var oldAbsDeltaY = Math.abs(scrollInfo.deltaY);
			scrollInfo.deltaY = scrollInfo.y - scrollInfo.top;
			newAbsDeltaY = Math.abs(scrollInfo.deltaY);
			//recalculate duration at same speed
			scrollInfo.duration = scrollInfo.duration * newAbsDeltaY / oldAbsDeltaY;
			
		}
		jsScroller.prototype.recalculateDeltaX=function(scrollInfo){
			//recalculate delta
			var oldAbsDeltaX = Math.abs(scrollInfo.deltaX);
			scrollInfo.deltaX = scrollInfo.x - scrollInfo.left;
			newAbsDeltaX = Math.abs(scrollInfo.deltaX);
			//recalculate duration at same speed
			scrollInfo.duration = scrollInfo.duration * newAbsDeltaX / oldAbsDeltaX;
			
		}
		
		
		
		//freak of mathematics, but for our cases it works
		jsScroller.prototype.divide=function(a, b){
			return b!=0 ? a/b : 0;
		}
		
		jsScroller.prototype.hideRefresh=function(){
			if(this.preventHideRefresh) return;
			this.scrollerMoveCSS({x:0,y:0}, 75);
			this.refreshTriggered=false;
		}
		
		jsScroller.prototype.setMomentum=function(scrollInfo) {
            var deceleration = 0.0012; 
			
			//calculate movement speed
			scrollInfo.speedY = this.divide(scrollInfo.deltaY, scrollInfo.duration);
			scrollInfo.speedX = this.divide(scrollInfo.deltaX, scrollInfo.duration);
			
			scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
			scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
			
			scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
			scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);
			
			//set momentum
			if(scrollInfo.absDeltaY>0){
				scrollInfo.deltaY = (scrollInfo.deltaY < 0 ? -1 : 1) * (scrollInfo.absSpeedY * scrollInfo.absSpeedY) / (2 * deceleration);
				scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
				scrollInfo.duration = scrollInfo.absSpeedY / deceleration;
				scrollInfo.speedY = scrollInfo.deltaY/scrollInfo.duration;
				scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
				if(scrollInfo.absSpeedY<deceleration*100)
					scrollInfo.deltaY = scrollInfo.absDeltaY = scrollInfo.duration = scrollInfo.speedY = scrollInfo.absSpeedY = 0;
			} else if(scrollInfo.absDeltaX) {
				scrollInfo.deltaX = (scrollInfo.deltaX < 0 ? -1 : 1) * (scrollInfo.absSpeedX * scrollInfo.absSpeedX) / (2 * deceleration);
				scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);
				scrollInfo.duration = scrollInfo.absSpeedX / deceleration;
				scrollInfo.speedX = scrollInfo.deltaX/scrollInfo.duration;
				scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
				if(scrollInfo.absSpeedX<deceleration*100)
					scrollInfo.deltaX = scrollInfo.absDeltaX = scrollInfo.duration = scrollInfo.speedX = scrollInfo.absSpeedX = 0;
			}
		}
		
		
        jsScroller.prototype.onTouchEnd=function(event) {
			
			window.clearInterval(this.doScrollInterval);
			this.doScrollInterval = null;
			
            if (this.currentScrollingObject == null || !this.moved) return;
			//event.preventDefault();
			
            this.finishScrollingObject = this.currentScrollingObject;
            this.currentScrollingObject = null;
            
			var scrollInfo = this.calculateMovement(this.lastEventInfo, true);
			this.setMomentum(scrollInfo);
			this.calculateTarget(scrollInfo);
			//boundaries control
			this.checkYboundary(scrollInfo);
			if(this.elementInfo.hasHorScroll) this.checkXboundary(scrollInfo);
			
			//get the current top
			var cssMatrix = this.getCSSMatrix(this.el);
            scrollInfo.top = numOnly(cssMatrix.f);
            scrollInfo.left = numOnly(cssMatrix.e);
			
			var triggered = !this.preventPullToRefresh && (scrollInfo.top > this.refreshHeight || scrollInfo.y > this.refreshHeight);
            this.fireRefreshRelease(triggered, scrollInfo.top>0);
			
			//refresh hang in
			if(this.refresh && triggered) {
				scrollInfo.y = this.refreshHeight;
				scrollInfo.duration = 75;
			//top boundary
			} else if(scrollInfo.y >= 0){
				scrollInfo.y = 0;
				if(scrollInfo.top >= 0) scrollInfo.duration = 75;
			//lower boundary
			} else if(-scrollInfo.y > this.elementInfo.maxTop || this.elementInfo.maxTop==0){
				scrollInfo.y = -this.elementInfo.maxTop;
				if(-scrollInfo.top > this.elementInfo.maxTop) scrollInfo.duration = 75;
			//all others
			}
			
            this.scrollerMoveCSS(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			this.setVScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setHScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			
			var that = this;
			this.scrollingFinishCB=setTimeout(function(){
				that.hideScrollbars();
				if(that.onScroll) that.onScroll();
			},scrollInfo.duration);
        }
		
		
        jsScroller.prototype.scrollerMoveCSS=function(distanceToMove, time, timingFunction) {
            if (!time)
                time = 0;
            if (!timingFunction)
                timingFunction = "linear";
			
			if(this.el && this.el.style){
	            this.el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
	            this.el.style.webkitTransitionDuration = time + "ms";
	            this.el.style.webkitTransitionTimingFunction = timingFunction;
			}
        }
		jsScroller.prototype.scrollbarMoveCSS=function(el, distanceToMove, time, timingFunction) {
            if (!time)
                time = 0;
            if (!timingFunction)
                timingFunction = "linear";
			
			if(el && el.style){
	            el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
	            el.style.webkitTransitionDuration = time + "ms";
	            el.style.webkitTransitionTimingFunction = timingFunction;
			}
        }
        jsScroller.prototype.scrollTo=function(pos, time) {
            if (!time)
				time = 0;
            this.scrollerMoveCSS(this.el, pos, time);
        }
        jsScroller.prototype.scrollBy=function(pos,time) {
			var cssMatrix = this.getCSSMatrix(this.el);
            this.startTop = numOnly(cssMatrix.f) - numOnly(this.container.scrollTop);
            this.startLeft = numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft);
            this.scrollTo({y:this.startTop-pos.y,x:this.startLeft-pos.x},time);
        }
		
		//debug JS scrolling
		//jsScroller = $.debug.type(jsScroller, 'jsScroller');
		
		//return main function
        return scroller;
    })();
})(jq);
