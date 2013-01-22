/**
 * jq.scroller - rewritten by Carlos Ouro @ Badoo
 * Supports iOS native touch scrolling and a much improved javascript scroller
 */
(function($) {
	var HIDE_REFRESH_TIME = 75; // hide animation of pull2ref duration in ms
	var cache = [];
	var objId = function(obj) {
			if(!obj.jqmScrollerId) obj.jqmScrollerId = $.uuid();
			return obj.jqmScrollerId;
		}
	$.fn["scroller"] = function(opts) {
		var tmp, id;
		for(var i = 0; i < this.length; i++) {
			//cache system
			id = objId(this[i]);
			if(!cache[id]) {
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
	var boundTouchLayer = false;

	function checkConsistency(id) {
		if(!cache[id].el) {
			delete cache[id];
			return false;
		}
		return true;
	}

	function bindTouchLayer() {
		//use a single bind for all scrollers
		if(jq.os.android && !jq.os.chrome&&jq.os.webkit) {
			var androidFixOn = false;
			//connect to touchLayer to detect editMode
			$.bind($.touchLayer, 'pre-enter-edit', function(focusEl) {
				if(!androidFixOn) {
					//console.log("deploying forms scroll android fix"); // @debug
					androidFixOn = true;
					//activate on scroller
					for(el in cache)
					if(checkConsistency(el) && cache[el].needsFormsFix(focusEl)) cache[el].startFormsMode();
				}
			});
			$.bind($.touchLayer, ['cancel-enter-edit', 'exit-edit'], function(focusEl) {
				if(androidFixOn) {
					//console.log("removing forms scroll android fix"); // @debug
					androidFixOn = false;
					//dehactivate on scroller
					for(el in cache)
					if(checkConsistency(el) && cache[el].androidFormsMode) cache[el].stopFormsMode();
				}
			});
		}
		boundTouchLayer = true;
	}
	var scroller = (function() {
        var translateOpen =$.feat.cssTransformStart;
        var translateClose = $.feat.cssTransformEnd;
		var jsScroller, nativeScroller;

		//initialize and js/native mode selector
		var scroller = function(elID, opts) {


				if(!boundTouchLayer && $.touchLayer && $.isObject($.touchLayer)) bindTouchLayer()
				else if(!($.touchLayer && $.isObject($.touchLayer))) $.touchLayer = {};

				if(typeof elID == "string" || elID instanceof String) {
					var el = document.getElementById(elID);
				} else {
					var el = elID;
				}
				if(!el) {
					alert("Could not find element for scroller " + elID);
					return;
				}
				if(jq.os.desktop)
					return new scrollerCore(el,opts);
				else if(opts.useJsScroll) return new jsScroller(el, opts);
				return new nativeScroller(el, opts);

			};

		//parent abstract class (common functionality)
		var scrollerCore = function(el,opts) {
			this.el=el;
			this.jqEl = $(this.el);
			for(j in opts) {
				this[j] = opts[j];
			}
		};
		scrollerCore.prototype = {
			//core default properties
			refresh: false,
			refreshContent: "Pull to Refresh",
			refreshHangTimeout: 2000,
			refreshHeight: 60,
			refreshElement: null,
			refreshCancelCB: null,
			refreshRunning: false,
			scrollTop: 0,
			scrollLeft: 0,
			preventHideRefresh: true,
			verticalScroll: true,
			horizontalScroll: false,
			refreshTriggered: false,
			moved: false,
			eventsActive: false,
			rememberEventsActive: false,
			scrollingLocked: false,
			autoEnable: true,
			blockFormsFix: false,
			loggedPcentY: 0,
			loggedPcentX: 0,
			infinite: false,
			infiniteEndCheck: false,
			infiniteTriggered: false,
			scrollSkip: false,
			scrollTopInterval:null,
			scrollTo:function(params){
				this.el.scrollTop=Math.abs(params.y);
				this.el.scrollLeft=Math.abs(params.x);
			},
            enable:function(){},
            disable:function(){},
            hideScrollbars:function(){},
            addPullToRefresh:function(){},
            /**
              * We do step animations for 'native' - iOS is acceptable and desktop browsers are fine
              * instead of css3
              */
            scrollToTop:function(time){
                var time=parseInt(time);
                if(time==0||isNaN(time))
            	   return this.el.scrollTop=0;
                else {
                    var singleTick=10;
                   	var distPerTick=(this.el.scrollHeight-this.el.scrollTop)/Math.ceil(time/singleTick);
                    var self=this;
                   	self.scrollTopInterval=window.setInterval(function(){
                        self.el.scrollTop-=distPerTick;
                        if(self.el.scrollTop<=0)
                            clearInterval(self.scrollTopInterval);
                    },singleTick);
                }
            },
            scrollToBottom:function(){
            	this.el.scrollTop=this.el.scrollHeight;
            },

			//methods
			init: function(el, opts) {
				this.el = el;
				this.jqEl = $(this.el);
				this.defaultProperties();
				for(j in opts) {
					this[j] = opts[j];
				}
				//assign self destruct
				var that = this;
				var orientationChangeProxy = function() {
						//no need to readjust if disabled...
						if(that.eventsActive) that.adjustScroll();
					}
				this.jqEl.bind('destroy', function() {
					that.disable(true); //with destroy notice
					var id = that.el.jqmScrollerId;
					if(cache[id]) delete cache[id];
					$.unbind($.touchLayer, 'orientationchange-reshape', orientationChangeProxy);
				});
				$.bind($.touchLayer, 'orientationchange-reshape', orientationChangeProxy);
			},
			needsFormsFix: function(focusEl) {
				return this.useJsScroll && this.isEnabled() && this.el.style.display != "none" && $(focusEl).closest(this.jqEl).size() > 0;
			},
			handleEvent: function(e) {
				if(!this.scrollingLocked) {
					switch(e.type) {
					case 'touchstart':
                        clearInterval(this.scrollTopInterval);
						this.preventHideRefresh = !this.refreshRunning; // if it's not running why prevent it xD
						this.moved = false;
						this.onTouchStart(e);
						break;
					case 'touchmove':
						this.onTouchMove(e);
						break;
					case 'touchend':
						this.onTouchEnd(e);
						break;
					case 'scroll':
						this.onScroll(e);
						break;
					}
				}
			},
			coreAddPullToRefresh: function(rEl) {
				if(rEl) this.refreshElement = rEl;
				//Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
				//add the refresh div
				if(this.refreshElement == null) {
					var orginalEl = document.getElementById(this.container.id + "_pulldown");
					if(orginalEl != null) {
						var jqEl = jq(orginalEl);
					} else {
						var jqEl = jq("<div id='" + this.container.id + "_pulldown' class='jqscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;position:relative;text-align:center;line-height:60px;color:white;width:100%;'>" + this.refreshContent + "</div>");
					}
				} else {
					var jqEl = jq(this.refreshElement);
				}
				var el = jqEl.get();

				this.refreshContainer = jq("<div style=\"overflow:hidden;width:100%;height:0;margin:0;padding:0;padding-left:5px;padding-right:5px;display:none;\"></div>");
				$(this.el).prepend(this.refreshContainer.append(el, 'top'));
				this.refreshContainer = this.refreshContainer[0];
			},
			fireRefreshRelease: function(triggered, allowHide) {
				if(!this.refresh || !triggered) return;

				var autoCancel = $.trigger(this, 'refresh-release', [triggered]) !== false;
				this.preventHideRefresh = false;
				this.refreshRunning = true;
				if(autoCancel) {
					var that = this;
					if(this.refreshHangTimeout > 0) this.refreshCancelCB = setTimeout(function() {
						that.hideRefresh()
					}, this.refreshHangTimeout);
				}
			},
			setRefreshContent: function(content) {
				jq(this.container).find(".jqscroll_refresh").html(content);
			},
			lock: function() {
				if(this.scrollingLocked) return;
				this.scrollingLocked = true;
				this.rememberEventsActive = this.eventsActive;
				if(!this.eventsActive) {
					this.initEvents();
				}
			},
			unlock: function() {
				if(!this.scrollingLocked) return;
				this.scrollingLocked = false;
				if(!this.rememberEventsActive) {
					this.removeEvents();
				}
			},
			scrollToItem: function(el, where) { //TODO: add functionality for x position
				if(!$.is$(el)) el = $(el);

				if(where == 'bottom') {
					var itemPos = el.offset();
					var newTop = itemPos.top - this.jqEl.offset().bottom + itemPos.height;
					newTop += 4; //add a small space
				} else {
					var itemTop = el.offset().top;
					var newTop = itemTop - document.body.scrollTop;
					var panelTop = this.jqEl.offset().top;
					if(document.body.scrollTop < panelTop) {
						newTop -= panelTop;
					}
					newTop -= 4; //add a small space
				}

				this.scrollBy({
					y: newTop,
					x: 0
				}, 0);
			},
			setPaddings: function(top, bottom) {
				var el = $(this.el);
				var curTop = numOnly(el.css('paddingTop'));
				el.css('paddingTop', top + "px").css('paddingBottom', bottom + "px");
				//don't let padding mess with scroll
				this.scrollBy({
					y: top - curTop,
					x: 0
				});
			},
			//freak of mathematics, but for our cases it works
			divide: function(a, b) {
				return b != 0 ? a / b : 0;
			},
			isEnabled: function() {
				return this.eventsActive;
			},
			addInfinite: function() {
				this.infinite = true;
			},
			clearInfinite: function() {
				this.infiniteTriggered = false;
				this.scrollSkip = true;
			}
		}

		//extend to jsScroller and nativeScroller (constructs)
		jsScroller = function(el, opts) {
			this.init(el, opts);
			//test
			//this.refresh=true;
			this.container = this.el.parentNode;
			this.container.jqmScrollerId = el.jqmScrollerId;
			this.jqEl = $(this.container);

			if(this.container.style.overflow != 'hidden') this.container.style.overflow = 'hidden';

			this.addPullToRefresh(null, true);
			if(this.autoEnable) this.enable(true);

			//create vertical scroll
			if(this.verticalScroll && this.verticalScroll == true && this.scrollBars == true) {
				var scrollDiv = createScrollBar(5, 20);
				scrollDiv.style.top = "0px";
				if(this.vScrollCSS) scrollDiv.className = this.vScrollCSS;
				scrollDiv.style.opacity = "0";
				this.container.appendChild(scrollDiv);
				this.vscrollBar = scrollDiv;
				scrollDiv = null;
			}
			//create horizontal scroll
			if(this.horizontalScroll && this.horizontalScroll == true && this.scrollBars == true) {
				var scrollDiv = createScrollBar(20, 5);
				scrollDiv.style.bottom = "0px";


				if(this.hScrollCSS) scrollDiv.className = this.hScrollCSS;
				scrollDiv.style.opacity = "0";
				this.container.appendChild(scrollDiv);
				this.hscrollBar = scrollDiv;
				scrollDiv = null;
			}
			if(this.horizontalScroll) this.el.style['float'] = "left";

			this.el.hasScroller = true;

		};
		nativeScroller = function(el, opts) {

			this.init(el, opts);
			var $el = $(el);
			if(opts.noParent !== true) {
				var oldParent = $el.parent();
				$el.css('height', oldParent.height());
				$el.parent().parent().append($el);
				oldParent.remove();
			}
			this.container = this.el;
			$el.css("-webkit-overflow-scrolling", "touch");
		}
		nativeScroller.prototype = new scrollerCore();
		jsScroller.prototype = new scrollerCore();



		///Native scroller
		nativeScroller.prototype.defaultProperties = function() {

			this.refreshContainer = null;
			this.dY = this.cY = 0;
			this.cancelPropagation = false;
			this.loggedPcentY = 0;
			this.loggedPcentX = 0;
			var that = this;
			this.adjustScrollOverflowProxy_ = function() {
				that.jqEl.css('overflow', 'auto');
			}
		}
		nativeScroller.prototype.enable = function(firstExecution) {
			if(this.eventsActive) return;
			this.eventsActive = true;
			//unlock overflow
			this.el.style.overflow = 'auto';
			//set current scroll

			
			if(!firstExecution) this.adjustScroll();
			//set events
			if(this.refresh || this.infinite&&!jq.os.desktop) this.el.addEventListener('touchstart', this, false);
			this.el.addEventListener('scroll', this, false)
		}
		nativeScroller.prototype.disable = function(destroy) {
			if(!this.eventsActive) return;
			//log current scroll
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
			//lock overflow
			if(!destroy) this.el.style.overflow = 'hidden';
			//remove events
			this.el.removeEventListener('touchstart', this, false);
			this.el.removeEventListener('touchmove', this, false);
			this.el.removeEventListener('touchend', this, false);
			this.el.removeEventListener('scroll', this, false);
			this.eventsActive = false;
		}
		nativeScroller.prototype.addPullToRefresh = function(el, leaveRefresh) {
			this.el.removeEventListener('touchstart', this, false);
			this.el.addEventListener('touchstart', this, false);
			if(!leaveRefresh) this.refresh = true;
			if(this.refresh && this.refresh == true) {
				this.coreAddPullToRefresh(el);
                this.refreshContainer.style.position="absolute";
                this.refreshContainer.style.top="-60px";
                this.refreshContainer.style.height="60px";
                this.refreshContainer.style.display="block";
			}
		}
		nativeScroller.prototype.onTouchStart = function(e) {

			if(this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
			//get refresh ready
			if(this.refresh || this.infinite) {

				this.el.addEventListener('touchmove', this, false);
				this.dY = e.touches[0].pageY;
				if(this.refresh && this.dY <0) {
					this.showRefresh();

				}
			}
			$.trigger(this,"scrollstart",[this.el]);
			$.trigger($.touchLayer,"scrollstart",[this.el]);
		}
		nativeScroller.prototype.onTouchMove = function(e) {

			var newcY = e.touches[0].pageY - this.dY;

			if(!this.moved) {
				this.el.addEventListener('touchend', this, false);
				this.moved = true;
			}

			var difY = newcY - this.cY;


			//check for trigger
			if(this.refresh && (this.el.scrollTop) < 0) {
				this.showRefresh();
				//check for cancel
			} else if(this.refreshTriggered && this.refresh && (this.el.scrollTop > this.refreshHeight)) {
				this.refreshTriggered = false;
				if(this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
				this.hideRefresh(false);
				$.trigger(this, 'refresh-cancel');
			}

			this.cY = newcY;
		}
        nativeScroller.prototype.showRefresh=function(){
            if(!this.refreshTriggered){
                this.refreshTriggered = true;
                $.trigger(this, 'refresh-trigger');
            }
        }
		nativeScroller.prototype.onTouchEnd = function(e) {

			var triggered = this.el.scrollTop <= -(this.refreshHeight);

			this.fireRefreshRelease(triggered, true);
            if(triggered){
                //lock in place
                this.refreshContainer.style.position="relative";
                this.refreshContainer.style.top="0px";
            }

			this.dY = this.cY = 0;
			this.el.removeEventListener('touchmove', this, false);
			this.el.removeEventListener('touchend', this, false);
			this.infiniteEndCheck = true;
			if(this.infinite && !this.infiniteTriggered && (Math.abs(this.el.scrollTop) >= (this.el.scrollHeight - this.el.clientHeight))) {
				this.infiniteTriggered = true;
				$.trigger(this, "infinite-scroll");
				this.infiniteEndCheck = true;
			}
			this.touchEndFired = true;
			//pollyfil for scroll end since webkit doesn't give any events during the "flick"
            var max=200;
            var self=this;
            var currPos={
                top:this.el.scrollTop,
                left:this.el.scrollLeft
            };
            var counter=0;
            self.nativePolling=setInterval(function(){
                counter++;
                if(counter>=max){
                    clearInterval(self.nativePolling);
                    return;
                }
                if(self.el.scrollTop!=currPos.top||self.el.scrollLeft!=currPos.left){
                    clearInterval(self.nativePolling);
                    $.trigger($.touchLayer, 'scrollend', [self.el]); //notify touchLayer of this elements scrollend
                    $.trigger(self,"scrollend",[self.el]);
                    //self.doScroll(e);
                }

            },20);
		}
		nativeScroller.prototype.hideRefresh = function(animate) {

			if(this.preventHideRefresh) return;

			var that = this;
			var endAnimationCb = function(canceled){
					if(!canceled){	//not sure if this should be the correct logic....
						that.el.style[$.feat.cssPrefix+"Transform"]="none";
						that.el.style[$.feat.cssPrefix+"TransitionProperty"]="none";
						that.el.scrollTop=0;
						that.logPos(that.el.scrollLeft, 0);
					}
					that.refreshContainer.style.top = "-60px";
					that.refreshContainer.style.position="absolute";
					that.dY = that.cY = 0;
					$.trigger(that,"refresh-finish");
				};

			if(animate === false || !that.jqEl.css3Animate) {
				endAnimationCb();
			} else {
				that.jqEl.css3Animate({
					y: (that.el.scrollTop - that.refreshHeight) + "px",
					x: "0%",
					time: HIDE_REFRESH_TIME + "ms",
					complete: endAnimationCb
				});
			}
			this.refreshTriggered = false;
			//this.el.addEventListener('touchend', this, false);
		}
		nativeScroller.prototype.hideScrollbars = function() {}
		nativeScroller.prototype.scrollTo = function(pos) {
			this.el.scrollTop = -(pos.y);
			this.el.scrollLeft = -(pos.x);
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
		}
		nativeScroller.prototype.scrollBy = function(pos) {
			this.el.scrollTop += pos.y;
			this.el.scrollLeft += pos.x;
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
		}
		nativeScroller.prototype.scrollToBottom = function() {
			this.el.scrollTop = this.el.scrollHeight;
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
		}
		nativeScroller.prototype.onScroll = function(e) {
			if(this.infinite && this.touchEndFired) {
				this.touchEndFired = false;
				return;
			}
			if(this.scrollSkip) {
				this.scrollSkip = false;
				return;
			}

			if(this.infinite) {
				if(!this.infiniteTriggered && (Math.abs(this.el.scrollTop) >= (this.el.scrollHeight - this.el.clientHeight))) {
					this.infiniteTriggered = true;
					$.trigger(this, "infinite-scroll");
					this.infiniteEndCheck = true;
				}
			}



			var that = this;
			if(this.infinite && this.infiniteEndCheck && this.infiniteTriggered) {

				this.infiniteEndCheck = false;
				$.trigger(that, "infinite-scroll-end");
			}
			//console.log("Scrolling stopped");
		}
		nativeScroller.prototype.logPos = function(x, y) {


			this.loggedPcentX = this.divide(x, (this.el.scrollWidth));
			this.loggedPcentY = this.divide(y, (this.el.scrollHeight ));
			this.scrollLeft = x;
			this.scrollTop = y;

			if(isNaN(this.loggedPcentX))
				this.loggedPcentX=0;
			if(isNaN(this.loggedPcentY))
				this.loggedPcentY=0;

			//console.log('pcent '+this.loggedPcentY+':'+this.loggedPcentX);
		}
		nativeScroller.prototype.adjustScroll = function() {
			//this.jqEl.css('overflow', 'hidden');
			this.adjustScrollOverflowProxy_();
			
			this.el.scrollLeft = this.loggedPcentX * (this.el.scrollWidth);
			this.el.scrollTop = this.loggedPcentY * (this.el.scrollHeight );
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
			
//			$.asap();
		}



		//JS scroller
		jsScroller.prototype.defaultProperties = function() {

			this.boolScrollLock = false;
			this.currentScrollingObject = null;
			this.elementInfo = null;
			this.verticalScroll = true;
			this.horizontalScroll = false;
			this.scrollBars = true;
			this.vscrollBar = null;
			this.hscrollBar = null;
			this.hScrollCSS = "scrollBar";
			this.vScrollCSS = "scrollBar";
			this.firstEventInfo = null;
			this.moved = false;
			this.preventPullToRefresh = true;
			this.doScrollInterval = null;
			this.refreshRate = 25;
			this.isScrolling = false;
			this.androidFormsMode = false;
			this.refreshSafeKeep = false;

			this.lastScrollbar = "";
			this.finishScrollingObject = null;
			this.container = null;
			this.scrollingFinishCB = null;
			this.loggedPcentY = 0;
			this.loggedPcentX = 0;

		}

		function createScrollBar(width, height) {
			var scrollDiv = document.createElement("div");
			scrollDiv.style.position = 'absolute';
			scrollDiv.style.width = width + "px";
			scrollDiv.style.height = height + "px";
			scrollDiv.style[$.feat.cssPrefix+'BorderRadius'] = "2px";
			scrollDiv.style.borderRadius = "2px";
			scrollDiv.style.opacity = 0;
			scrollDiv.className = 'scrollBar';
			scrollDiv.style.background = "black";
			return scrollDiv;
		}
		jsScroller.prototype.enable = function(firstExecution) {
			if(this.eventsActive) return;
			this.eventsActive = true;
			if(!firstExecution) this.adjustScroll();
            else
                this.scrollerMoveCSS({x:0,y:0},0);
			//add listeners
			this.container.addEventListener('touchstart', this, false);
			this.container.addEventListener('touchmove', this, false);
			this.container.addEventListener('touchend', this, false);

		}
		jsScroller.prototype.adjustScroll = function() {
			//set top/left
			var size = this.getViewportSize();
			//console.log('adjust '+this.loggedPcentY+':'+(this.el.clientHeight-size.h));
			this.scrollerMoveCSS({
				x: Math.round(this.loggedPcentX * (this.el.clientWidth - size.w)),
				y: Math.round(this.loggedPcentY * (this.el.clientHeight - size.h))
			}, 0);
		}
		jsScroller.prototype.disable = function() {
			if(!this.eventsActive) return;
			//log top/left
			var cssMatrix = this.getCSSMatrix(this.el);
			//console.log('disable');
			this.logPos((numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft)), (numOnly(cssMatrix.f) - numOnly(this.container.scrollTop)));
			//remove event listeners
			this.container.removeEventListener('touchstart', this, false);
			this.container.removeEventListener('touchmove', this, false);
			this.container.removeEventListener('touchend', this, false);
			this.eventsActive = false;
		}
		jsScroller.prototype.addPullToRefresh = function(el, leaveRefresh) {
			if(!leaveRefresh) this.refresh = true;
			if(this.refresh && this.refresh == true) {
				this.coreAddPullToRefresh(el);
				this.el.style.overflow = 'visible';
			}
		}
		jsScroller.prototype.hideScrollbars = function() {
			if(this.hscrollBar) {
				this.hscrollBar.style.opacity = 0
				this.hscrollBar.style[$.feat.cssPrefix+'TransitionDuration'] = "0ms";
			}
			if(this.vscrollBar) {
				this.vscrollBar.style.opacity = 0
				this.vscrollBar.style[$.feat.cssPrefix+'TransitionDuration']  = "0ms";
			}
		}

		jsScroller.prototype.getViewportSize = function() {
			var style = window.getComputedStyle(this.container);
			if(isNaN(numOnly(style.paddingTop))) alert((typeof style.paddingTop) + '::' + style.paddingTop + ':');
			return {
				h: (this.container.clientHeight > window.innerHeight ? window.innerHeight : this.container.clientHeight - numOnly(style.paddingTop) - numOnly(style.paddingBottom)),
				w: (this.container.clientWidth > window.innerWidth ? window.innerWidth : this.container.clientWidth - numOnly(style.paddingLeft) - numOnly(style.paddingRight))
			};
		}

		jsScroller.prototype.onTouchStart = function(event) {

			this.moved = false;
			this.currentScrollingObject = null;

			if(!this.container) return;
			if(this.refreshCancelCB) {
				clearTimeout(this.refreshCancelCB);
				this.refreshCancelCB = null;
			}
			if(this.scrollingFinishCB) {
				clearTimeout(this.scrollingFinishCB);
				this.scrollingFinishCB = null;
			}
			

			//disable if locked
			if(event.touches.length != 1 || this.boolScrollLock) return;

			// Allow interaction to legit calls, like select boxes, etc.
			if(event.touches[0].target && event.touches[0].target.type != undefined) {
				var tagname = event.touches[0].target.tagName.toLowerCase();
				if(tagname == "select" || tagname == "input" || tagname == "button") // stuff we need to allow
				// access to legit calls
				return;

			}

			//default variables
			var scrollInfo = {
				//current position
				top: 0,
				left: 0,
				//current movement
				speedY: 0,
				speedX: 0,
				absSpeedY: 0,
				absSpeedX: 0,
				deltaY: 0,
				deltaX: 0,
				absDeltaY: 0,
				absDeltaX: 0,
				y: 0,
				x: 0,
				duration: 0
			};

			//element info
			this.elementInfo = {};
			var size = this.getViewportSize();
			this.elementInfo.bottomMargin = size.h;
			this.elementInfo.maxTop = (this.el.clientHeight - this.elementInfo.bottomMargin);
			if(this.elementInfo.maxTop < 0) this.elementInfo.maxTop = 0;
			this.elementInfo.divHeight = this.el.clientHeight;
			this.elementInfo.rightMargin = size.w;
			this.elementInfo.maxLeft = (this.el.clientWidth - this.elementInfo.rightMargin);
			if(this.elementInfo.maxLeft < 0) this.elementInfo.maxLeft = 0;
			this.elementInfo.divWidth = this.el.clientWidth;
			this.elementInfo.hasVertScroll = this.verticalScroll || this.elementInfo.maxTop > 0;
			this.elementInfo.hasHorScroll = this.elementInfo.maxLeft > 0;
			this.elementInfo.requiresVScrollBar = this.vscrollBar && this.elementInfo.hasVertScroll;
			this.elementInfo.requiresHScrollBar = this.hscrollBar && this.elementInfo.hasHorScroll;

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
			if(this.refresh && scrollInfo.top == 0) {
				this.refreshContainer.style.display = "block";
				this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
				this.refreshContainer.firstChild.style.top = (-this.refreshHeight) + 'px';
				this.refreshContainer.style.overflow = 'visible';
				this.preventPullToRefresh = false;
			} else if(scrollInfo.top < 0) {
				this.preventPullToRefresh = true;
				if(this.refresh) this.refreshContainer.style.overflow = 'hidden';
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
	            this.vscrollBar.style[$.feat.cssPrefix+"Transition"] = '';
				// this.vscrollBar.style.opacity = 1;
			}

			//horizontal scroll
			if(this.setHScrollBar(scrollInfo, 0, 0)){
                if (this.container.clientHeight > window.innerHeight)
                    this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height)) + "px";
                else
                    this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
                this.hscrollBar.style[$.feat.cssPrefix+"Transition"] = ''; 
				// this.hscrollBar.style.opacity = 1;
			}

			//save scrollInfo
			this.lastScrollInfo = scrollInfo;
			this.hasMoved=true;

			this.scrollerMoveCSS(this.lastScrollInfo, 0);
			$.trigger(this,"scrollstart");

		}
		jsScroller.prototype.getCSSMatrix = function(el) {
			if(this.androidFormsMode) {
				//absolute mode
				var top = parseInt(el.style.marginTop);
				var left = parseInt(el.style.marginLeft);
				if(isNaN(top)) top = 0;
				if(isNaN(left)) left = 0;
				return {
					f: top,
					e: left
				};
			} else {
				//regular transform

				var obj = $.getCssMatrix(el);
				return obj;
			}
		}
		jsScroller.prototype.saveEventInfo = function(event) {
			this.lastEventInfo = {
				pageX: event.touches[0].pageX,
				pageY: event.touches[0].pageY,
				time: event.timeStamp
			}
		}
		jsScroller.prototype.saveFirstEventInfo = function(event) {
			this.firstEventInfo = {
				pageX: event.touches[0].pageX,
				pageY: event.touches[0].pageY,
				time: event.timeStamp
			}
		}
		jsScroller.prototype.setVScrollBar = function(scrollInfo, time, timingFunction) {
			if(!this.elementInfo.requiresVScrollBar) return false;
			var newHeight = (parseFloat(this.elementInfo.bottomMargin / this.elementInfo.divHeight) * this.elementInfo.bottomMargin) + "px";
			if(newHeight != this.vscrollBar.style.height) this.vscrollBar.style.height = newHeight;
			var pos = (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.elementInfo.maxTop + scrollInfo.y) / this.elementInfo.maxTop) * (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)));
			if(pos > this.elementInfo.bottomMargin) pos = this.elementInfo.bottomMargin;
			if(pos < 0) pos = 0;
			this.scrollbarMoveCSS(this.vscrollBar, {
				x: 0,
				y: pos
			}, time, timingFunction);
			return true;
		}
		jsScroller.prototype.setHScrollBar = function(scrollInfo, time, timingFunction) {
			if(!this.elementInfo.requiresHScrollBar) return false;
			var newWidth = (parseFloat(this.elementInfo.rightMargin / this.elementInfo.divWidth) * this.elementInfo.rightMargin) + "px";
			if(newWidth != this.hscrollBar.style.width) this.hscrollBar.style.width = newWidth;
			var pos = (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.elementInfo.maxLeft + scrollInfo.x) / this.elementInfo.maxLeft) * (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)));

			if(pos > this.elementInfo.rightMargin) pos = this.elementInfo.rightMargin;
			if(pos < 0) pos = 0;

			this.scrollbarMoveCSS(this.hscrollBar, {
				x: pos,
				y: 0
			}, time, timingFunction);
			return true;
		}

		jsScroller.prototype.onTouchMove = function(event) {

			if(this.currentScrollingObject == null) return;
			//event.preventDefault();
			var scrollInfo = this.calculateMovement(event);
			this.calculateTarget(scrollInfo);

			this.lastScrollInfo = scrollInfo;
			if(!this.moved) {
				if(this.elementInfo.requiresVScrollBar) this.vscrollBar.style.opacity = 1;
				if(this.elementInfo.requiresHScrollBar) this.hscrollBar.style.opacity = 1;
			}
			this.moved = true;


			if(this.refresh && scrollInfo.top == 0) {
				this.refreshContainer.style.display = "block";
				this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
				this.refreshContainer.firstChild.style.top = (-this.refreshHeight) + 'px';
				this.refreshContainer.style.overflow = 'visible';
				this.preventPullToRefresh = false;
			} else if(scrollInfo.top < 0) {
				this.preventPullToRefresh = true;
				if(this.refresh) this.refreshContainer.style.overflow = 'hidden';
			}


			this.saveEventInfo(event);
			this.doScroll();

		}

		jsScroller.prototype.doScroll = function() {

			if(!this.isScrolling && this.lastScrollInfo.x != this.lastScrollInfo.left || this.lastScrollInfo.y != this.lastScrollInfo.top) {
				this.isScrolling = true;
				if(this.onScrollStart) this.onScrollStart();
			} else {
				//nothing to do here, cary on
				return;
			}
			//proceed normally
			var cssMatrix = this.getCSSMatrix(this.el);
			this.lastScrollInfo.top = numOnly(cssMatrix.f);
			this.lastScrollInfo.left = numOnly(cssMatrix.e);

			this.recalculateDeltaY(this.lastScrollInfo);
			this.recalculateDeltaX(this.lastScrollInfo);

			//boundaries control
			this.checkYboundary(this.lastScrollInfo);
			if(this.elementInfo.hasHorScroll) this.checkXboundary(this.lastScrollInfo);

			//pull to refresh elastic
			var positiveOverflow = this.lastScrollInfo.y > 0 && this.lastScrollInfo.deltaY > 0;
			var negativeOverflow = this.lastScrollInfo.y < -this.elementInfo.maxTop && this.lastScrollInfo.deltaY < 0;
			if(positiveOverflow || negativeOverflow) {
				var overflow = positiveOverflow ? this.lastScrollInfo.y : -this.lastScrollInfo.y - this.elementInfo.maxTop;
				var pcent = (this.container.clientHeight - overflow) / this.container.clientHeight;
				if(pcent < .5) pcent = .5;
				//cur top, maxTop or 0?
				var baseTop = 0;
				if((positiveOverflow && this.lastScrollInfo.top > 0) || (negativeOverflow && this.lastScrollInfo.top < -this.elementInfo.maxTop)) {
					baseTop = this.lastScrollInfo.top;
				} else if(negativeOverflow) {
					baseTop = -this.elementInfo.maxTop;
				}
				var changeY = this.lastScrollInfo.deltaY * pcent;
				var absChangeY = Math.abs(this.lastScrollInfo.deltaY * pcent);
				if(absChangeY < 1) changeY = positiveOverflow ? 1 : -1;
				this.lastScrollInfo.y = baseTop + changeY;
			}

			//move
			this.scrollerMoveCSS(this.lastScrollInfo, 0);
			this.setVScrollBar(this.lastScrollInfo, 0, 0);
			this.setHScrollBar(this.lastScrollInfo, 0, 0);

			//check refresh triggering
			if(this.refresh && !this.preventPullToRefresh) {
				if(!this.refreshTriggered && this.lastScrollInfo.top > this.refreshHeight) {
					this.refreshTriggered = true;
					$.trigger(this, 'refresh-trigger');
				} else if(this.refreshTriggered && this.lastScrollInfo.top < this.refreshHeight) {
					this.refreshTriggered = false;
					$.trigger(this, 'refresh-cancel');
				}
			}

			if(this.infinite && !this.infiniteTriggered) {
				if((Math.abs(this.lastScrollInfo.top) >= (this.el.clientHeight - this.container.clientHeight))) {
					this.infiniteTriggered = true;
					$.trigger(this, "infinite-scroll");
				}
			}

		}

		jsScroller.prototype.calculateMovement = function(event, last) {
			//default variables
			var scrollInfo = {
				//current position
				top: 0,
				left: 0,
				//current movement
				speedY: 0,
				speedX: 0,
				absSpeedY: 0,
				absSpeedX: 0,
				deltaY: 0,
				deltaX: 0,
				absDeltaY: 0,
				absDeltaX: 0,
				y: 0,
				x: 0,
				duration: 0
			};

			var prevEventInfo = last ? this.firstEventInfo : this.lastEventInfo;
			var pageX = last ? event.pageX : event.touches[0].pageX;
			var pageY = last ? event.pageY : event.touches[0].pageY;
			var time = last ? event.time : event.timeStamp;

			scrollInfo.deltaY = this.elementInfo.hasVertScroll ? pageY - prevEventInfo.pageY : 0;
			scrollInfo.deltaX = this.elementInfo.hasHorScroll ? pageX - prevEventInfo.pageX : 0;
			scrollInfo.time = time;

			scrollInfo.duration = time - prevEventInfo.time;

			return scrollInfo;
		}

		jsScroller.prototype.calculateTarget = function(scrollInfo) {
			scrollInfo.y = this.lastScrollInfo.y + scrollInfo.deltaY;
			scrollInfo.x = this.lastScrollInfo.x + scrollInfo.deltaX;
		}
		jsScroller.prototype.checkYboundary = function(scrollInfo) {
			var minTop = this.container.clientHeight / 2;
			var maxTop = this.elementInfo.maxTop + minTop;
			//y boundaries
			if(scrollInfo.y > minTop) scrollInfo.y = minTop;
			else if(-scrollInfo.y > maxTop) scrollInfo.y = -maxTop;
			else return;
			this.recalculateDeltaY(scrollInfo);
		}
		jsScroller.prototype.checkXboundary = function(scrollInfo) {
			//x boundaries
			if(scrollInfo.x > 0) scrollInfo.x = 0;
			else if(-scrollInfo.x > this.elementInfo.maxLeft) scrollInfo.x = -this.elementInfo.maxLeft;
			else return;

			this.recalculateDeltaY(scrollInfo);
		}
		jsScroller.prototype.recalculateDeltaY = function(scrollInfo) {
			//recalculate delta
			var oldAbsDeltaY = Math.abs(scrollInfo.deltaY);
			scrollInfo.deltaY = scrollInfo.y - scrollInfo.top;
			newAbsDeltaY = Math.abs(scrollInfo.deltaY);
			//recalculate duration at same speed
			scrollInfo.duration = scrollInfo.duration * newAbsDeltaY / oldAbsDeltaY;

		}
		jsScroller.prototype.recalculateDeltaX = function(scrollInfo) {
			//recalculate delta
			var oldAbsDeltaX = Math.abs(scrollInfo.deltaX);
			scrollInfo.deltaX = scrollInfo.x - scrollInfo.left;
			newAbsDeltaX = Math.abs(scrollInfo.deltaX);
			//recalculate duration at same speed
			scrollInfo.duration = scrollInfo.duration * newAbsDeltaX / oldAbsDeltaX;

		}

		jsScroller.prototype.hideRefresh = function(animate) {
			var that=this;
			if(this.preventHideRefresh) return;
			this.scrollerMoveCSS({
				x: 0,
				y: 0,
				complete:function(){
					$.trigger(that,"refresh-finish");
				}
			}, HIDE_REFRESH_TIME);
			this.refreshTriggered = false;
		}

		jsScroller.prototype.setMomentum = function(scrollInfo) {
			var deceleration = 0.0012;

			//calculate movement speed
			scrollInfo.speedY = this.divide(scrollInfo.deltaY, scrollInfo.duration);
			scrollInfo.speedX = this.divide(scrollInfo.deltaX, scrollInfo.duration);

			scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
			scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);

			scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
			scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);

			//set momentum
			if(scrollInfo.absDeltaY > 0) {
				scrollInfo.deltaY = (scrollInfo.deltaY < 0 ? -1 : 1) * (scrollInfo.absSpeedY * scrollInfo.absSpeedY) / (2 * deceleration);
				scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
				scrollInfo.duration = scrollInfo.absSpeedY / deceleration;
				scrollInfo.speedY = scrollInfo.deltaY / scrollInfo.duration;
				scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
				if(scrollInfo.absSpeedY < deceleration * 100 || scrollInfo.absDeltaY < 5) scrollInfo.deltaY = scrollInfo.absDeltaY = scrollInfo.duration = scrollInfo.speedY = scrollInfo.absSpeedY = 0;
			} else if(scrollInfo.absDeltaX) {
				scrollInfo.deltaX = (scrollInfo.deltaX < 0 ? -1 : 1) * (scrollInfo.absSpeedX * scrollInfo.absSpeedX) / (2 * deceleration);
				scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);
				scrollInfo.duration = scrollInfo.absSpeedX / deceleration;
				scrollInfo.speedX = scrollInfo.deltaX / scrollInfo.duration;
				scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
				if(scrollInfo.absSpeedX < deceleration * 100 || scrollInfo.absDeltaX < 5) scrollInfo.deltaX = scrollInfo.absDeltaX = scrollInfo.duration = scrollInfo.speedX = scrollInfo.absSpeedX = 0;
			} else scrollInfo.duration = 0;
		}


		jsScroller.prototype.onTouchEnd = function(event) {


			if(this.currentScrollingObject == null || !this.moved) return;
			//event.preventDefault();
			this.finishScrollingObject = this.currentScrollingObject;
			this.currentScrollingObject = null;

			var scrollInfo = this.calculateMovement(this.lastEventInfo, true);
			if(!this.androidFormsMode) {
				this.setMomentum(scrollInfo);
			}
			this.calculateTarget(scrollInfo);

			//get the current top
			var cssMatrix = this.getCSSMatrix(this.el);
			scrollInfo.top = numOnly(cssMatrix.f);
			scrollInfo.left = numOnly(cssMatrix.e);

			//boundaries control
			this.checkYboundary(scrollInfo);
			if(this.elementInfo.hasHorScroll) this.checkXboundary(scrollInfo);

			var triggered = !this.preventPullToRefresh && (scrollInfo.top > this.refreshHeight || scrollInfo.y > this.refreshHeight);
			this.fireRefreshRelease(triggered, scrollInfo.top > 0);

			//refresh hang in
			if(this.refresh && triggered) {
				scrollInfo.y = this.refreshHeight;
				scrollInfo.duration = HIDE_REFRESH_TIME;
				//top boundary
			} else if(scrollInfo.y >= 0) {
				scrollInfo.y = 0;
				if(scrollInfo.top >= 0) scrollInfo.duration = HIDE_REFRESH_TIME;
				//lower boundary
			} else if(-scrollInfo.y > this.elementInfo.maxTop || this.elementInfo.maxTop == 0) {
				scrollInfo.y = -this.elementInfo.maxTop;
				if(-scrollInfo.top > this.elementInfo.maxTop) scrollInfo.duration = HIDE_REFRESH_TIME;
				//all others
			}

			if(this.androidFormsMode) scrollInfo.duration = 0;
			this.scrollerMoveCSS(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			this.setVScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			this.setHScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");

			this.setFinishCalback(scrollInfo.duration);
			if(this.infinite && !this.infiniteTriggered) {
				if((Math.abs(scrollInfo.y) >= (this.el.clientHeight - this.container.clientHeight))) {
					this.infiniteTriggered = true;
					$.trigger(this, "infinite-scroll");
				}
			}
		}

		//finish callback
		jsScroller.prototype.setFinishCalback = function(duration) {
			var that = this;
			this.scrollingFinishCB = setTimeout(function() {
				that.hideScrollbars();
				$.trigger($.touchLayer, 'scrollend', [that.el]); //notify touchLayer of this elements scrollend
				$.trigger(that,"scrollend",[that.el]);
				that.isScrolling = false;
				that.elementInfo = null; //reset elementInfo when idle
				if(that.infinite) $.trigger(that, "infinite-scroll-end");
			}, duration);
		}

		//Android Forms Fix
		jsScroller.prototype.startFormsMode = function() {
			if(this.blockFormsFix) return;
			//get prev values
			var cssMatrix = this.getCSSMatrix(this.el);
			//toggle vars
			this.refreshSafeKeep = this.refresh;
			this.refresh = false;
			this.androidFormsMode = true;
			//set new css rules
			this.el.style[$.feat.cssPrefix+"Transform"] = "none";
			this.el.style[$.feat.cssPrefix+"Transition"] = "none";
			this.el.style[$.feat.cssPrefix+"Perspective"] = "none";

			//set position
			this.scrollerMoveCSS({
				x: numOnly(cssMatrix.e),
				y: numOnly(cssMatrix.f)
			}, 0);

			//container
			this.container.style[$.feat.cssPrefix+"Perspective"] = "none";
			this.container.style[$.feat.cssPrefix+"BackfaceVisibility"] = "visible";
			//scrollbars
			if(this.vscrollBar){
				this.vscrollBar.style[$.feat.cssPrefix+"Transform"] = "none";
				this.vscrollBar.style[$.feat.cssPrefix+"Transition"] = "none";
				this.vscrollBar.style[$.feat.cssPrefix+"Perspective"] = "none";
				this.vscrollBar.style[$.feat.cssPrefix+"BackfaceVisibility"] = "visible";
			}
			if(this.hscrollBar){
				this.hscrollBar.style[$.feat.cssPrefix+"Transform"] = "none";
				this.hscrollBar.style[$.feat.cssPrefix+"Transition"] = "none";
				this.hscrollBar.style[$.feat.cssPrefix+"Perspective"] = "none";
				this.hscrollBar.style[$.feat.cssPrefix+"BackfaceVisibility"] = "visible";
			}

		}
		jsScroller.prototype.stopFormsMode = function() {
			if(this.blockFormsFix) return;
			//get prev values
			var cssMatrix = this.getCSSMatrix(this.el);
			//toggle vars
			this.refresh = this.refreshSafeKeep;
			this.androidFormsMode = false;
			//set new css rules
			this.el.style[$.feat.cssPrefix+"Perspective"] = 1000;
			this.el.style.marginTop = 0;
			this.el.style.marginLeft = 0;
			this.el.style[$.feat.cssPrefix+"Transition"] = '0ms linear';	//reactivate transitions
			//set position
			this.scrollerMoveCSS({
				x: numOnly(cssMatrix.e),
				y: numOnly(cssMatrix.f)
			}, 0);
			//container
			this.container.style[$.feat.cssPrefix+"Perspective"] = 1000;
			this.container.style[$.feat.cssPrefix+"BackfaceVisibility"] = "hidden";
			//scrollbars
			if(this.vscrollBar){
				this.vscrollBar.style[$.feat.cssPrefix+"Perspective"] = 1000;
				this.vscrollBar.style[$.feat.cssPrefix+"BackfaceVisibility"] = "hidden";
			}
			if(this.hscrollBar){
				this.hscrollBar.style[$.feat.cssPrefix+"Perspective"] = 1000;
				this.hscrollBar.style[$.feat.cssPrefix+"BackfaceVisibility"] = "hidden";
			}

		}



		jsScroller.prototype.scrollerMoveCSS = function(distanceToMove, time, timingFunction) {
			if(!time) time = 0;
			if(!timingFunction) timingFunction = "linear";

			if(this.el && this.el.style) {

				//do not touch the DOM if disabled
				if(this.eventsActive) {
					if(this.androidFormsMode) {
						this.el.style.marginTop = Math.round(distanceToMove.y) + "px";
						this.el.style.marginLeft = Math.round(distanceToMove.x) + "px";
					} else {

			            this.el.style[$.feat.cssPrefix+"Transform"] = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
			            this.el.style[$.feat.cssPrefix+"TransitionDuration"]= time + "ms";
			            this.el.style[$.feat.cssPrefix+"TransitionTimingFunction"] = timingFunction;
					}
				}
				// Position should be updated even when the scroller is disabled so we log the change
				//console.log('scrollmove #'+this.container.id)
				this.logPos(distanceToMove.x, distanceToMove.y);
			}
		}
		jsScroller.prototype.logPos = function(x, y) {

			if(!this.elementInfo) {
				var size = this.getViewportSize();
			} else {
				var size = {
					h: this.elementInfo.bottomMargin,
					w: this.elementInfo.rightMargin
				}
			}

			this.loggedPcentX = this.divide(x, (this.el.clientWidth - size.w));
			this.loggedPcentY = this.divide(y, (this.el.clientHeight - size.h));
			this.scrollTop = y;
			this.scrollLeft = x;
			//console.log('logged '+this.loggedPcentY+' '+y+':'+(this.el.clientHeight - size.h));
		}
		jsScroller.prototype.scrollbarMoveCSS = function(el, distanceToMove, time, timingFunction) {
			if(!time) time = 0;
			if(!timingFunction) timingFunction = "linear";

			if(el && el.style) {
				if(this.androidFormsMode) {
					el.style.marginTop = Math.round(distanceToMove.y) + "px";
					el.style.marginLeft = Math.round(distanceToMove.x) + "px";
				} else {
		            el.style[$.feat.cssPrefix+"Transform"] = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
		            el.style[$.feat.cssPrefix+"TransitionDuration"]= time + "ms";
		            el.style[$.feat.cssPrefix+"TransitionTimingFunction"] = timingFunction;
				}
			}
		}
		jsScroller.prototype.scrollTo = function(pos, time) {
			if(!time) time = 0;
			this.scrollerMoveCSS(pos, time);
		}
		jsScroller.prototype.scrollBy = function(pos, time) {
			var cssMatrix = this.getCSSMatrix(this.el);
			var startTop = numOnly(cssMatrix.f);
			var startLeft = numOnly(cssMatrix.e);
			this.scrollTo({
				y: startTop - pos.y,
				x: startLeft - pos.x
			}, time);
		}
		jsScroller.prototype.scrollToBottom = function(time) {
			this.scrollTo({
				y: -1 * (this.el.clientHeight - this.container.clientHeight),
				x: 0
			}, time);
		}
		jsScroller.prototype.scrollToTop=function(time){
			this.scrollTo({x:0,y:0},time);
		}
		return scroller;
	})();
})(jq);