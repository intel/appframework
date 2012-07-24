/**
 * jq.web.css3Animate - css3 animate class for html5 mobile apps
 * @copyright 2011 - AppMobi
 */ 
(function ($) {
	var cache = [];
	var objId=function(obj){
		if(!obj.jqmCSS3AnimateId) obj.jqmCSS3AnimateId=$.uuid();
		return obj.jqmCSS3AnimateId;
	}
	var getEl=function(elID){
        if (typeof elID == "string" || elID instanceof String) {
            return document.getElementById(elID);
        } else if($.is$(elID)){
        	return elID[0];
        } else {
            return elID;
        }
	}
	var getCSS3Animate=function(obj, options){
        var tmp, id, el = getEl(obj);
		//first one
		id = objId(el);
		if(cache[id]){
			cache[id].animate(options);
			tmp = cache[id];
		} else {
			tmp = css3Animate(el, options);
			cache[id] = tmp;
		}
		return tmp;
	}
    $.fn["css3Animate"] = function (opts) {
		//keep old callback system - backwards compatibility - should be deprecated in future versions
		if(!opts.complete && opts.callback) opts.complete = opts.callback;
        //first on
		var tmp = getCSS3Animate(this[0], opts);
		opts.complete=null;
		opts.sucess=null;
		opts.failure=null;
        for (var i = 1; i < this.length; i++) {
            tmp.link(this[i], opts);
        }
        return tmp;
    };
	

    $["css3AnimateQueue"] = function () {
        return new css3Animate.queue();
    }
    if (!window.WebKitCSSMatrix) return;
    var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
    var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";
	
	var css3Animate = (function () {
		
	    var css3Animate = function (elID, options) {
			if(!(this instanceof css3Animate)) return new css3Animate(elID, options);
			
			//start doing stuff
			this.callbacksStack = [];
			this.activeEvent = null;
			this.countStack = 0;
			this.isActive = false;
			this.el = elID;
			this.linkFinishedProxy_ = $.proxy(this.linkFinished, this);
			
	        if (!this.el) return;
			
			this.animate(options);
			
			var that = this;
			jq(this.el).bind('destroy', function(){
				var id = that.el.jqmCSS3AnimateId;
				that.callbacksStack = [];
				if(cache[id]) delete cache[id];
			});
	    };

	    css3Animate.prototype = {
			animate:function(options){
				
				//cancel current active animation on this object
				if(this.isActive) this.cancel();
				this.isActive = true;
				
		        if (!options) {
		            alert("Please provide configuration options for animation of " + this.el.id);
		            return;
		        }
			
				var classMode = !!options["addClass"];
			
	            if(classMode){
	            	//class defines properties being changed
					if(options["removeClass"]){
						jq(this.el).replaceClass(options["removeClass"], options["addClass"]);
					} else {
						jq(this.el).addClass(options["addClass"]);
					}
				
	            } else {
	            	//property by property
					var timeNum = numOnly(options["time"]);
					if(timeNum==0) options["time"]=0;
				
			        if (!options["y"]) options["y"] = 0;
			        if (!options["x"]) options["x"] = 0;
			        if (options["previous"]) {
						var cssMatrix = new WebKitCSSMatrix(window.getComputedStyle(this.el).webkitTransform);
			            options.y += numOnly(cssMatrix.f);
			            options.x += numOnly(cssMatrix.e);
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
				
					if((""+options["time"]).indexOf("s")===-1) {
						var scale = 'ms';
						var time = options["time"]+scale;
					} else if(options["time"].indexOf("ms")!==-1){
						var scale = 'ms';
						var time = options["time"];
					} else {
						var scale = 's';
						var time = options["time"]+scale;
					}
			
					this.el.style.webkitTransitionDuration = time;
					this.el.style.webkitTransitionTimingFunction = options["timingFunction"];
			        this.el.style.webkitTransformOrigin = options.origin;
	            }

				//add callback to the stack
				
				this.callbacksStack.push({
					complete : options["complete"],
					success : options["success"],
					failure : options["failure"]
				});
				this.countStack++;
			
				var that = this;
				var style = window.getComputedStyle(this.el);
				if(classMode){
					//get the duration
					var duration = style.webkitTransitionDuration;
					var timeNum = numOnly(duration);
					if(duration.indexOf("ms")!==-1){
						var scale = 'ms';
					} else {
						var scale = 's';
					}
				}
				
				//finish asap
				if(timeNum==0 || (scale=='ms' && timeNum<5) || style.display=='none'){
					//the duration is nearly 0 or the element is not displayed, finish immediatly
					$.asap($.proxy(this.finishAnimation, this, [false]));
					//set transitionend event
				} else {
					//setup the event normally
					this.activeEvent = function(event){
						that.finishAnimation(event);
						that.el.removeEventListener("webkitTransitionEnd", that.activeEvent, false);
					};
					this.el.addEventListener("webkitTransitionEnd", this.activeEvent, false);
				}
			
			},
			addCallbackHook:function(callback){
				if(callback) this.callbacksStack.push(callback);
				this.countStack++;
				return this.linkFinishedProxy_;
			},
			linkFinished:function(canceled){
				if(canceled) this.cancel();
				else this.finishAnimation();
			},
	        finishAnimation: function (event) {
	            if(event) event.preventDefault();
				if(!this.isActive) return;
				
				this.countStack--;
				
	            if(this.countStack==0) this.fireCallbacks(false);
	        },
			fireCallbacks:function(canceled){
				this.clearEvents();
				
				//keep callbacks after cleanup
				// (if any of the callbacks overrides this object, callbacks will keep on fire as expected)
				var callbacks = this.callbacksStack;
				
				//cleanup
				this.cleanup();
				
				//fire all callbacks
				for(var i=0; i<callbacks.length; i++) {
					var complete = callbacks[i]['complete'];
					var success = callbacks[i]['success'];
					var failure = callbacks[i]['failure'];
					//fire callbacks
	                if(complete && typeof (complete == "function")) complete(canceled);
					//success/failure
					if(canceled && failure && typeof (failure == "function")) failure();
					else if(success && typeof (success == "function")) success();
				}
			},
			cancel:function(){
				if(!this.isActive) return;
				this.fireCallbacks(true); //fire failure callbacks
			},
			cleanup:function(){
				this.callbacksStack=[];
				this.isActive = false;
				this.countStack = 0;
			},
			clearEvents:function(){
				if(this.activeEvent) {
					this.el.removeEventListener("webkitTransitionEnd", this.activeEvent, false);
				}
				this.activeEvent = null;
			},
	        link: function (elID, opts) {
				var callbacks = {complete:opts.complete,success:opts.success,failure:opts.failure};
				opts.complete = this.addCallbackHook(callbacks);
				opts.success = null;
				opts.failure = null;
				//run the animation with the replaced callbacks
				getCSS3Animate(elID, opts);
				//set the old callback back in the obj to avoid strange stuff
				opts.complete = callbacks.complete;
				opts.success = callbacks.success;
				opts.failure = callbacks.failure;
				return this;
	        }
	    }
		
		// var tmp = new $.css3AnimateQueue();
		// tmp.push({id:"animate",x:20,y:30,time:"300ms"});
		// tmp.push({id:"animate",x:20,y:30,time:"500ms",previous:true});
		// tmp.push({id:"animate",x:0,y:0,time:"0ms"});
		// tmp.push({id:"animate",x:20,y:30,time:"300ms"});
		// tmp.push({id:"animate",x:20,y:30,time:"500ms",previous:true});
		// tmp.push(function(){reset()});
		// tmp.run();
		
		//uncomment for performance debug
		//css3Animate = $.debug.type(css3Animate, 'css3Animate');
		
		
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
                if (this.elements.length > 0) params.complete = function (canceled) {
                    if(!canceled) that.run();
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
 * jq.scroller - rewritten by Carlos Ouro @ Badoo
 * Supports iOS native touch scrolling and a much improved javascript scroller
 */ 
 (function($) {
 	var HIDE_REFRESH_TIME = 75; // hide animation of pull2ref duration in ms

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
	var boundTouchLayer = false;
	function checkConsistency(id){
		if(!cache[id].el) {
			delete cache[id];
			return false;
		}
		return true;
	}
	
	function bindTouchLayer(){
		//use a single bind for all scrollers
		if(jq.os.android && !jq.os.chrome) {
			var androidFixOn = false;
			//connect to touchLayer to detect editMode
			$.bind($.touchLayer, 'pre-enter-edit', function(focusEl){
				if(!androidFixOn){
					console.log("deploying forms scroll android fix"); // @debug
					androidFixOn = true;
					//activate on scroller
				 	for(el in cache)
						if(checkConsistency(el) && cache[el].needsFormsFix(focusEl)) cache[el].startFormsMode();
				}
			});
			$.bind($.touchLayer, ['cancel-enter-edit', 'exit-edit'], function(focusEl){
				if(androidFixOn){
					console.log("removing forms scroll android fix"); // @debug
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
        if (!window.WebKitCSSMatrix)
            return;
		var allows3D = 'm11' in new WebKitCSSMatrix();
        var translateOpen = allows3D ? "3d(" : "(";
        var translateClose = allows3D ? ",0)" : ")";
		var jsScroller, nativeScroller;
		
		//initialize and js/native mode selector
        var scroller = function(elID, opts) {
            
			if(!boundTouchLayer && $.touchLayer && $.isObject($.touchLayer)) bindTouchLayer();
			
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
			refreshHangTimeout:2000,
			refreshHeight:60,
			refreshElement:null,
			refreshCancelCB:null,
            refreshRunning:false,
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
			blockFormsFix:false,
			loggedPcentY: 0,
			loggedPcentX: 0,
			
			//methods
			init:function(el, opts) {
				this.el = el;
				this.jqEl = $(this.el);
				this.defaultProperties();
	            for (j in opts) {
	                this[j] = opts[j];
	            }
				//assign self destruct
				var that = this;
				var orientationChangeProxy = function(){
					//no need to readjust if disabled...
					if(that.eventsActive) that.adjustScroll();
				}
				this.jqEl.bind('destroy', function(){
					that.disable(true);	//with destroy notice
					var id = that.el.jqmScrollerId;
					if(cache[id]) delete cache[id];
					$.unbind($.touchLayer, 'orientationchange-reshape', orientationChangeProxy);
				});
				$.bind($.touchLayer, 'orientationchange-reshape', orientationChangeProxy);
	        },
			needsFormsFix:function(focusEl){
				return this.useJsScroll && this.isEnabled() && this.el.style.display!="none" && $(focusEl).closest(this.jqEl).size()>0;
			},
			handleEvent : function(e){
				if(!this.scrollingLocked){
		    		switch(e.type) {
						case 'touchstart': 
							this.preventHideRefresh = !this.refreshRunning; // if it's not running why prevent it xD
							this.moved = false;
							this.onTouchStart(e); 
						break;
						case 'touchmove': this.onTouchMove(e); break;
						case 'touchend': this.onTouchEnd(e); break;
						case 'scroll': this.onScroll(e); break;
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
				var autoCancel = $.trigger(this, 'refresh-release', [triggered])!==false;
				this.preventHideRefresh = false;
                this.refreshRunning = true;
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
			},
			scrollToItem:function(el, where){	//TODO: add functionality for x position
				if(!$.is$(el)) el = $(el);
				
				if(where=='bottom'){
					var itemPos = el.offset();
					var newTop = itemPos.top-this.jqEl.offset().bottom+itemPos.height;
					newTop+=4;	//add a small space
				} else {
					var itemTop = el.offset().top;
					var newTop = itemTop-document.body.scrollTop;
					var panelTop = this.jqEl.offset().top;
					if (document.body.scrollTop<panelTop){
						newTop -= panelTop;
					}
					newTop-=4;	//add a small space
				}
				
				this.scrollBy({y:newTop, x:0}, 0);	
			},
			setPaddings:function(top, bottom){
				$(this.el).css('paddingTop', top+"px").css('paddingBottom', bottom+"px");
			},
			//freak of mathematics, but for our cases it works
			divide:function(a, b){return b!=0 ? a/b : 0;},
			isEnabled:function(){return this.eventsActive;}
		}
		
		//extend to jsScroller and nativeScroller (constructs)
		jsScroller = function(el, opts){
			this.init(el, opts);
			//test
			//this.refresh=true;
			
            this.container = this.el.parentNode;
			this.container.jqmScrollerId = el.jqmScrollerId;
			this.jqEl = $(this.container);
			
			if(this.container.style.overflow != 'hidden' && this.container.style.overflow != 'visible') this.container.style.overflow = 'hidden';

			this.addPullToRefresh(null, true);
            if(this.autoEnable) this.enable(true);
                
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
			this.loggedPcentY=0;
			this.loggedPcentX=0;
			var that = this;
			this.adjustScrollOverflowProxy_ = function(){that.jqEl.css('overflow', 'auto');}
		}
        nativeScroller.prototype.enable=function (firstExecution) {
			if(this.eventsActive) return;
			this.eventsActive = true;
			//unlock overflow
			this.el.style.overflow='auto';
			//set current scroll
			if(!firstExecution) this.adjustScroll();
			//set events
            if(this.refresh) this.el.addEventListener('touchstart', this, false);
			this.el.addEventListener('scroll', this, false);
        }
        nativeScroller.prototype.disable=function (destroy) {
			if(!this.eventsActive) return;
			//log current scroll
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
			//lock overflow
			if(!destroy) this.el.style.overflow='hidden';
			//remove events
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
				//lets set pull to refresh stuff in place
				this.scrollTo({y:this.refreshHeight,x:this.scrollLeft});
				this.refreshContainer.style.height=this.refreshHeight+'px';
				this.el.addEventListener('touchend', this, false);
				this.moved=true;
			}
			var difY = newcY-this.cY;
			//check for trigger
			if(!this.refreshTriggered && (this.scrollTop-difY)<=0){
				this.refreshTriggered = true;
				$.trigger(this, 'refresh-trigger');
			//check for cancel
			} else if(this.refreshTriggered && (this.scrollTop-difY)>0){
				this.refreshTriggered = false;
				$.trigger(this, 'refresh-cancel');
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
		nativeScroller.prototype.hideRefresh=function(animate){
			if(this.preventHideRefresh) return;
			
			var that = this;
			var endAnimationCb = function(canceled){
					if(!canceled){	//not sure if this should be the correct logic....
						that.el.style.webkitTransform="none";
						that.el.style.webkitTransitionProperty="none";
						that.el.scrollTop=0;
						that.logPos(that.el.scrollLeft, 0);
					}
					that.refreshContainer.style.height='0';
					that.dY = that.cY = 0;
			};

			if (animate === false) {
				endAnimationCb();
			} else {
				that.jqEl.css3Animate({
	                y: (that.el.scrollTop-that.refreshHeight)+"px",
	                x: "0%",
	                time: HIDE_REFRESH_TIME + "ms",
					complete: endAnimationCb
	            });
			}
			
			this.refreshTriggered=false;
			//this.el.addEventListener('touchend', this, false);
		}
        nativeScroller.prototype.hideScrollbars=function() {}
        nativeScroller.prototype.scrollTo=function(pos) {
			this.el.scrollTop=-(pos.y);
            this.el.scrollLeft=-(pos.x);
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
        }
        nativeScroller.prototype.scrollBy=function(pos) {
            this.el.scrollTop+=pos.y;
            this.el.scrollLeft+=pos.x;
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
        }
        nativeScroller.prototype.onScroll=function(e) {
			//console.log('scroll '+this.el.scrollTop);
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
        }
		nativeScroller.prototype.logPos=function(x,y){
			this.loggedPcentX = this.divide(x, (this.el.scrollWidth-this.el.clientWidth));
			this.loggedPcentY = this.divide(y, (this.el.scrollHeight-this.el.clientHeight));
			this.scrollLeft = x;
			this.scrollTop = y;
			//console.log('pcent '+this.loggedPcentY+':'+(y/(this.el.scrollHeight-this.el.clientHeight)));
		}
		nativeScroller.prototype.adjustScroll=function(){
			this.jqEl.css('overflow', 'hidden');
			this.el.scrollLeft=this.loggedPcentX*(this.el.scrollWidth-this.el.clientWidth);
			this.el.scrollTop=this.loggedPcentY*(this.el.scrollHeight-this.el.clientHeight);
			this.logPos(this.el.scrollLeft, this.el.scrollTop);
			$.asap(this.adjustScrollOverflowProxy_);
			//console.log(this.loggedPcentY+'--'+this.el.scrollTop);
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
			this.refreshRate = 25;
			this.isScrolling=false;
			this.androidFormsMode = false;
			this.refreshSafeKeep = false;

            this.lastScrollbar="";
            this.finishScrollingObject=null;
            this.container=null;
            this.scrollingFinishCB=null;
			this.loggedPcentY=0;
			this.loggedPcentX=0;
			
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
        jsScroller.prototype.enable=function (firstExecution) {
			if(this.eventsActive) return;
			this.eventsActive = true;
			if(!firstExecution) this.adjustScroll();
			//add listeners
    		this.container.addEventListener('touchstart', this, false);
            this.container.addEventListener('touchmove', this, false);
			this.container.addEventListener('touchend', this, false);
			
        }
		jsScroller.prototype.adjustScroll=function(){
			//set top/left
			var size = this.getViewportSize();
			//console.log('adjust '+this.loggedPcentY+':'+(this.el.clientHeight-size.h));
			this.scrollerMoveCSS({
				x:Math.round(this.loggedPcentX*(this.el.clientWidth-size.w)),
				y:Math.round(this.loggedPcentY*(this.el.clientHeight-size.h))
			}, 0);
		}
        jsScroller.prototype.disable=function () {
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
		jsScroller.prototype.getViewportSize=function(){
			var style = window.getComputedStyle(this.container);
			if(isNaN(numOnly(style.paddingTop))) alert((typeof style.paddingTop)+'::'+style.paddingTop+':');
			return {
				h:(this.container.clientHeight > window.innerHeight ? window.innerHeight : this.container.clientHeight-numOnly(style.paddingTop)-numOnly(style.paddingBottom)),
				w:(this.container.clientWidth > window.innerWidth ? window.innerWidth : this.container.clientWidth-numOnly(style.paddingLeft)-numOnly(style.paddingRight))
			};
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
			if(this.doScrollInterval) {
				clearInterval(this.doScrollInterval);
				this.doScrollInterval=null;
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
			this.elementInfo = {};
			var size = this.getViewportSize();
			this.elementInfo.bottomMargin 	= size.h;
			this.elementInfo.maxTop 		= (this.el.clientHeight - this.elementInfo.bottomMargin);
			if(this.elementInfo.maxTop<0) this.elementInfo.maxTop = 0;
			this.elementInfo.divHeight  	= this.el.clientHeight;
	        this.elementInfo.rightMargin 	= size.w;
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
			if(this.androidFormsMode){
				//absolute mode
				var top = parseInt(el.style.marginTop);
				var left = parseInt(el.style.marginLeft);
				if(isNaN(top)) top = 0;
				if(isNaN(left)) left = 0;
				return {f:top,e:left};
			} else {
				//regular transform
				var str = window.getComputedStyle(el).webkitTransform;	//fix for BB transform 'none'
				if(str=='none') return {f:0,e:0};
				var obj = new WebKitCSSMatrix(str);
				return obj;
			}
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
			
			if(!this.isScrolling && this.lastScrollInfo.x != this.lastScrollInfo.left || this.lastScrollInfo.y != this.lastScrollInfo.top){
				this.isScrolling=true;
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
					$.trigger(this, 'refresh-trigger');
				} else if(this.refreshTriggered && this.lastScrollInfo.top<this.refreshHeight){
					this.refreshTriggered=false;
					$.trigger(this, 'refresh-cancel');
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
		
		jsScroller.prototype.hideRefresh=function(animate){
			if(this.preventHideRefresh) return;
			this.scrollerMoveCSS({x:0,y:0}, HIDE_REFRESH_TIME);
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
				if(scrollInfo.absSpeedY<deceleration*100 || scrollInfo.absDeltaY<5)
					scrollInfo.deltaY = scrollInfo.absDeltaY = scrollInfo.duration = scrollInfo.speedY = scrollInfo.absSpeedY = 0;
			} else if(scrollInfo.absDeltaX) {
				scrollInfo.deltaX = (scrollInfo.deltaX < 0 ? -1 : 1) * (scrollInfo.absSpeedX * scrollInfo.absSpeedX) / (2 * deceleration);
				scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);
				scrollInfo.duration = scrollInfo.absSpeedX / deceleration;
				scrollInfo.speedX = scrollInfo.deltaX/scrollInfo.duration;
				scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
				if(scrollInfo.absSpeedX<deceleration*100 || scrollInfo.absDeltaX<5)
					scrollInfo.deltaX = scrollInfo.absDeltaX = scrollInfo.duration = scrollInfo.speedX = scrollInfo.absSpeedX = 0;
			} else scrollInfo.duration = 0;
		}
		
		
        jsScroller.prototype.onTouchEnd=function(event) {
			
			window.clearInterval(this.doScrollInterval);
			this.doScrollInterval = null;
			
            if (this.currentScrollingObject == null || !this.moved) return;
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
            this.fireRefreshRelease(triggered, scrollInfo.top>0);
			
			//refresh hang in
			if(this.refresh && triggered) {
				scrollInfo.y = this.refreshHeight;
				scrollInfo.duration = HIDE_REFRESH_TIME;
			//top boundary
			} else if(scrollInfo.y >= 0){
				scrollInfo.y = 0;
				if(scrollInfo.top >= 0) scrollInfo.duration = HIDE_REFRESH_TIME;
			//lower boundary
			} else if(-scrollInfo.y > this.elementInfo.maxTop || this.elementInfo.maxTop==0){
				scrollInfo.y = -this.elementInfo.maxTop;
				if(-scrollInfo.top > this.elementInfo.maxTop) scrollInfo.duration = HIDE_REFRESH_TIME;
			//all others
			}
			
			if(this.androidFormsMode) scrollInfo.duration = 0;
            this.scrollerMoveCSS(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			this.setVScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setHScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
			
			this.setFinishCalback(scrollInfo.duration);
        }
		
		//finish callback
		jsScroller.prototype.setFinishCalback = function(duration){
			var that = this;
			this.scrollingFinishCB=setTimeout(function(){
				that.hideScrollbars();
				$.trigger($.touchLayer, 'scrollend', [that.el]);	//notify touchLayer of this elements scrollend
				that.isScrolling=false;
				that.elementInfo = null;	//reset elementInfo when idle
			},duration);
		}
		
		//Android Forms Fix
		jsScroller.prototype.startFormsMode = function(){
			if(this.blockFormsFix) return;
			//get prev values
			var cssMatrix = this.getCSSMatrix(this.el);
			//toggle vars
			this.refreshSafeKeep = this.refresh;
			this.refresh=false;
			this.androidFormsMode=true;
			//set new css rules
			this.el.style.webkitTransform = "none";
			this.el.style.webkitTransition = "none";
			this.el.style.webkitPerspective = "none";
			
			//set position
            this.scrollerMoveCSS({x:numOnly(cssMatrix.e),y:numOnly(cssMatrix.f)}, 0);
			
			//container
			this.container.style.webkitPerspective = "none";
			this.container.style.webkitBackfaceVisibility = "visible";
			//scrollbars
			if(this.vscrollBar){
				this.vscrollBar.style.webkitTransform = "none";
				this.vscrollBar.style.webkitTransition = "none";
				this.vscrollBar.style.webkitPerspective = "none";
				this.vscrollBar.style.webkitBackfaceVisibility = "visible";
			}
			if(this.hscrollBar){
				this.hscrollBar.style.webkitTransform = "none";
				this.hscrollBar.style.webkitTransition = "none";
				this.hscrollBar.style.webkitPerspective = "none";
				this.hscrollBar.style.webkitBackfaceVisibility = "visible";
			}
			
		}
		jsScroller.prototype.stopFormsMode = function(){
			if(this.blockFormsFix) return;
			//get prev values
			var cssMatrix = this.getCSSMatrix(this.el);
			//toggle vars
			this.refresh = this.refreshSafeKeep;
			this.androidFormsMode=false;
			//set new css rules
			this.el.style.webkitPerspective = 1000;
            this.el.style.marginTop = 0;
            this.el.style.marginLeft = 0;
			this.el.style.webkitTransition = '0ms linear';	//reactivate transitions
			//set position
			this.scrollerMoveCSS({x:numOnly(cssMatrix.e),y:numOnly(cssMatrix.f)}, 0);
			//container
			this.container.style.webkitPerspective = 1000;
			this.container.style.webkitBackfaceVisibility = "hidden";
			//scrollbars
			if(this.vscrollBar){
				this.vscrollBar.style.webkitPerspective = 1000;
				this.vscrollBar.style.webkitBackfaceVisibility = "hidden";
			}
			if(this.hscrollBar){
				this.hscrollBar.style.webkitPerspective = 1000;
				this.hscrollBar.style.webkitBackfaceVisibility = "hidden";
			}
			
		}
		
		
		
        jsScroller.prototype.scrollerMoveCSS=function(distanceToMove, time, timingFunction) {
            if (!time)
                time = 0;
            if (!timingFunction)
                timingFunction = "linear";
			
			if(this.el && this.el.style){
				
				//do not touch the DOM if disabled
				if(this.eventsActive){
					if(this.androidFormsMode){
			            this.el.style.marginTop = Math.round(distanceToMove.y) + "px";
						this.el.style.marginLeft = Math.round(distanceToMove.x) + "px";
					} else {
			            this.el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
			            this.el.style.webkitTransitionDuration = time + "ms";
			            this.el.style.webkitTransitionTimingFunction = timingFunction;
					}
				}
				// Position should be updated even when the scroller is disabled so we log the change
				//console.log('scrollmove #'+this.container.id)
				this.logPos(distanceToMove.x, distanceToMove.y);
			}
        }
		jsScroller.prototype.logPos=function(x,y){
			
			if(!this.elementInfo){
				var size = this.getViewportSize();
			} else {
				var size = {h:this.elementInfo.bottomMargin,w:this.elementInfo.rightMargin}
			}
			
			this.loggedPcentX = this.divide(x, (this.el.clientWidth - size.w));
			this.loggedPcentY = this.divide(y, (this.el.clientHeight - size.h));
			this.scrollTop = y;
			this.scrollLeft = x;
			//console.log('logged '+this.loggedPcentY+' '+y+':'+(this.el.clientHeight - size.h));
		}
		jsScroller.prototype.scrollbarMoveCSS=function(el, distanceToMove, time, timingFunction) {
            if (!time)
                time = 0;
            if (!timingFunction)
                timingFunction = "linear";
			
			if(el && el.style){
				if(this.androidFormsMode){
		            el.style.marginTop = Math.round(distanceToMove.y) + "px";
					el.style.marginLeft = Math.round(distanceToMove.x) + "px";
				} else {
		            el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
		            el.style.webkitTransitionDuration = time + "ms";
		            el.style.webkitTransitionTimingFunction = timingFunction;
				}
			}
        }
        jsScroller.prototype.scrollTo=function(pos, time) {
            if (!time)
				time = 0;
            this.scrollerMoveCSS(pos, time);
        }
        jsScroller.prototype.scrollBy=function(pos,time) {
			var cssMatrix = this.getCSSMatrix(this.el);
            var startTop = numOnly(cssMatrix.f);
            var startLeft = numOnly(cssMatrix.e);
            this.scrollTo({y:startTop-pos.y,x:startLeft-pos.x},time);
        }
		
		//debug JS scrolling
		//jsScroller = $.debug.type(jsScroller, 'jsScroller');
		
		//return main function
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
                
                var $el=$("#"+this.id);
                $el.bind("close", function(){
                	self.hide();
                })
                
                if (this.cancelOnly) {
                    $el.find('A#action').hide();
                    $el.find('A#cancel').addClass('center');
                }
                $el.find('A').each(function() {
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
                $el.removeClass('hidden');
                $el.bind("orientationchange", function() {
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
                $el.unbind("close");
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
                var markStart = '<div id="jq_actionsheet"><div style="width:100%">';
                var markEnd = '</div>';
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
        scroller: null,
        getOldSelects: function(elID) {
            if (!$.os.android || $.os.androidICS)
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
                if (sels[i].hasSelectBoxFix)
                    continue;
                (function(theSel) {
                    var fakeInput = document.createElement("div");
					var theSelStyle = window.getComputedStyle(theSel);
					var width = theSelStyle.width=='intrinsic' ? '100%' : theSelStyle.width;
                    var selWidth = parseInt(width) > 0 ? width : '100px';
                    var selHeight = parseInt(theSel.style.height) > 0 ? theSel.style.height : (parseInt(theSelStyle.height) ? theSelStyle.height : '20px');
                    fakeInput.style.width = selWidth;
                    fakeInput.style.height = selHeight;
					fakeInput.style.margin = theSelStyle.margin;
					fakeInput.style.position = theSelStyle.position;
					fakeInput.style.left = theSelStyle.left;
					fakeInput.style.top = theSelStyle.top;
					fakeInput.style.lineHeight = theSelStyle.lineHeight;
                    //fakeInput.style.position = "absolute";
                    //fakeInput.style.left = "0px";
                    //fakeInput.style.top = "0px";
                    fakeInput.style.zIndex = "1";
                    if (theSel.value)
                        fakeInput.innerHTML = theSel.options[theSel.selectedIndex].text;
                    fakeInput.style.background = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAIAAABFWWJ4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM1NjQxRUQxNUFEODExRTA5OUE3QjE3NjI3MzczNDAzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM1NjQxRUQyNUFEODExRTA5OUE3QjE3NjI3MzczNDAzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzU2NDFFQ0Y1QUQ4MTFFMDk5QTdCMTc2MjczNzM0MDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzU2NDFFRDA1QUQ4MTFFMDk5QTdCMTc2MjczNzM0MDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6YWbdCAAAAlklEQVR42mIsKChgIBGwAHFPTw/xGkpKSlggrG/fvhGjgYuLC0gyMZAOoPb8//9/0Or59+8f8XrICQN66SEnDOgcp3AgKiqKqej169dY9Hz69AnCuHv3rrKyMrIKoAhcVlBQELt/gIqwstHD4B8quH37NlAQSKKJEwg3iLbBED8kpeshoGcwh5uuri5peoBFMEluAwgwAK+5aXfuRb4gAAAAAElFTkSuQmCC') right top no-repeat";
                    fakeInput.style.backgroundColor = "white";
                    fakeInput.style.lineHeight = selHeight;
                    fakeInput.style.backgroundSize = "contain"; 
                    fakeInput.className = "jqmobiSelect_fakeInput " + theSel.className;
                    fakeInput.id = theSel.id + "_jqmobiSelect";
                    
                    fakeInput.style.border = "1px solid gray";
                    fakeInput.style.color = "black";
                    fakeInput.linkId = theSel.id;
                    fakeInput.onclick = function(e) {
                        that.initDropDown(this.linkId);
                    };
                    theSel.parentNode.appendChild(fakeInput);
                    //theSel.parentNode.style.position = "relative";
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
                    sels[i].hasSelectBoxFix = true;
                
                
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
        }).bind('touchmove', function(e) {
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
        }).bind('touchend', function(e) {
            if (!touch.el)
                return;
            if (!touch.el.data("ignore-pressed"))
                touch.el.removeClass("selected");
            if (touch.isDoubleTap) {
                touch.el.trigger('doubleTap');
                touch = {};
            } else if (touch.x2 > 0 || touch.y2 > 0) {
                (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) && 
                touch.el.trigger('swipe') && 
                touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
                touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
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

//TouchLayer contributed by Carlos Ouro @ Badoo
//un-authoritive layer between touches and actions on the DOM 
//(un-authoritive: listeners do not require useCapture)
//handles overlooking JS and native scrolling, panning, 
//no delay on click, edit mode focus, preventing defaults, resizing content, 
//enter/exit edit mode (keyboard on screen), prevent clicks on momentum, etc
//It can be used independently in other apps but it is required by jqUi

//Object Events

//Enter Edit Mode:
//pre-enter-edit - when a possible enter-edit is actioned - happens before actual click or focus (android can still reposition elements and event is actioned)
//cancel-enter-edit - when a pre-enter-edit does not result in a enter-edit
//enter-edit - on a enter edit mode focus
//enter-edit-reshape - focus resized/scrolled event

//in-edit-reshape - resized/scrolled event when a different element is focused

//Exit Edit Mode
//exit-edit - on blur
//exit-edit-reshape - blur resized/scrolled event

//Other
//orientationchange-reshape - resize event due to an orientationchange action
//reshape - window.resize/window.scroll event (ignores onfocus "shaking") - general reshape notice

(function() {
	//singleton
    $.touchLayer = function(el) {
		$.touchLayer = new touchLayer(el);
		return $.touchLayer;
    };
	//configuration stuff
	var inputElements = ['input', 'select', 'textarea'];
	var autoBlurInputTypes = ['button', 'radio', 'checkbox', 'range'];
	var requiresJSFocus = $.os.ios;	//devices which require .focus() on dynamic click events
	var verySensitiveTouch = $.os.blackberry;	//devices which have a very sensitive touch and touchmove is easily fired even on simple taps
	var inputElementRequiresNativeTap = $.os.blackberry || ($.os.android && !$.os.chrome);	//devices which require the touchstart event to bleed through in order to actually fire the click on select elements
	var selectElementRequiresNativeTap = $.os.blackberry || ($.os.android && !$.os.chrome);	//devices which require the touchstart event to bleed through in order to actually fire the click on select elements
	var focusScrolls = $.os.ios;	//devices scrolling on focus instead of resizing
	var focusResizes = $.os.blackberry10;
	var requirePanning = $.os.ios;	//devices which require panning feature
    var addressBarError = 0.97;	//max 3% error in position
	var maxHideTries = 2;	//HideAdressBar does not retry more than 2 times (3 overall)
	
	var touchLayer = function(el) {
		this.clearTouchVars();
        el.addEventListener('touchstart', this, false);
		el.addEventListener('touchmove', this, false);
		el.addEventListener('touchend', this, false);
		el.addEventListener('click', this, false);
		document.addEventListener('scroll', this, false);
	    window.addEventListener("resize", this, false);
		window.addEventListener("orientationchange", this, false);
		this.layer=el;
		//proxies
		this.scrollEndedProxy_ = $.proxy(this.scrollEnded, this);
		this.exitEditProxy_ = $.proxy(this.exitExit, this, []);
		this.launchFixUIProxy_ = $.proxy(this.launchFixUI, this);
		var that = this;
		this.scrollTimeoutExpireProxy_ = function(){
			that.scrollTimeout_=null;
			that.scrollTimeoutEl_.addEventListener('scroll', that.scrollEndedProxy_, false);
		};
		this.retestAndFixUIProxy_ = function(){
			if(jq.os.android) that.layer.style.height = '100%';
			$.asap(that.testAndFixUI, that, arguments);
		};
		//js scrollers self binding
		$.bind(this,'scrollstart',function(el){that.fireEvent('UIEvents', 'scrollstart', el, false, false);});
		$.bind(this,'scrollend',function(el){that.fireEvent('UIEvents', 'scrollend', el, false, false);});
		//fix layer positioning
		this.launchFixUI(5);	//try a lot to set page into place
    }
	
    touchLayer.prototype = {
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
		//elements
		layer: null,
		scrollingEl_: null,
		scrollTimeoutEl_:null,
		//handles / proxies
		scrollTimeout_:null,
		reshapeTimeout_:null,
		scrollEndedProxy_:null,
		exitEditProxy_:null,
		launchFixUIProxy_:null,
		reHideAddressBarTimeout_:null,
		retestAndFixUIProxy_:null,
		//options
		panElementId: "header",
		//public locks
		blockClicks:false,
		//private locks
		allowDocumentScroll_:false,
		ignoreNextResize_:false,
		blockPossibleClick_:false,
		//status vars
		isScrolling: false,
		isScrollingVertical_: false,
		wasPanning_:false,
		isPanning_:false,
		isFocused_:false,
		justBlurred_:false,
		requiresNativeTap: false,
		holdingReshapeType_:null,
		
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
                case 'click':
                    this.onClick(e);
                    break;
	            case 'blur':
	               	this.onBlur(e);
	                break;
				case 'scroll':
					this.onScroll(e);
					break;
				case 'orientationchange':
					this.onOrientationChange(e);
					break;
				case 'resize':
					this.onResize(e);
					break;
            }
        },
		launchFixUI:function(maxTries){
			//this.log("launchFixUI");
			if(!maxTries) maxTries = maxHideTries;
			if(this.reHideAddressBarTimeout_==null) return this.testAndFixUI(0, maxTries);
		},
		resetFixUI:function(){
			//this.log("resetFixUI");
			if(this.reHideAddressBarTimeout_) clearTimeout(this.reHideAddressBarTimeout_);
			this.reHideAddressBarTimeout_ = null;
		},
		testAndFixUI:function(retry, maxTries){
			//this.log("testAndFixUI");
			//for ios or if the heights are incompatible (and not close)
			var refH = this.getReferenceHeight();
			var curH = this.getCurrentHeight();
			if((refH!=curH && !(curH*addressBarError<refH && refH*addressBarError<curH)) ){
				//panic! page is out of place!
				this.hideAddressBar(retry, maxTries);
				return true;
			}
			if (jq.os.android) this.resetFixUI();
			return false;
		},
		hideAddressBar:function(retry, maxTries) {
			if(retry>=maxTries) {
				this.resetFixUI();
				return;	//avoid a possible loop
			}
			
			//this.log("hiding address bar");
	        if (jq.os.desktop||jq.os.chrome) {
	            this.layer.style.height="100%";
	        } else if (jq.os.android) {
				//on some phones its immediate
				window.scrollTo(1, 1);
		        this.layer.style.height = this.isFocused_ ? (window.innerHeight) + "px" : (window.outerHeight / window.devicePixelRatio) + 'px';
				//sometimes android devices are stubborn
				that = this;
				//re-test in a bit (some androids (SII, Nexus S, etc) fail to resize on first try)
				var nextTry = retry+1;
				this.reHideAddressBarTimeout_ = setTimeout(this.retestAndFixUIProxy_, 250*nextTry, [nextTry, maxTries]);	//each fix is progressibily longer (slower phones fix)
	        } 
	        else if(!this.isFocused_){
	            document.documentElement.style.height = "5000px";
	            window.scrollTo(0, 0);
	            document.documentElement.style.height = window.innerHeight + "px";
	            this.layer.style.height = window.innerHeight + "px";
	        }
	    },
		getReferenceHeight:function(){
			//the height the page should be at
			if(jq.os.android){
				return Math.ceil(window.outerHeight / window.devicePixelRatio);
			} else return window.innerHeight;
		},
		getCurrentHeight:function(){
			//the height the page really is at
			if(jq.os.android){
				return window.innerHeight;
			} else return numOnly(document.documentElement.style.height);	//TODO: works well on iPhone, test BB
		},
		onOrientationChange:function(e){
			//this.log("orientationchange");
			//if a resize already happened, fire the orientationchange
			if(!this.holdingReshapeType_ && this.reshapeTimeout_){
				this.fireReshapeEvent('orientationchange');
			} else this.previewReshapeEvent('orientationchange');
		},
		onResize:function(e){
			//avoid infinite loop on iPhone
			if(this.ignoreNextResize_) {
				//this.log('ignored resize');
				this.ignoreNextResize_=false;
				return;
			}
			//this.logInfo('resize');
			if(this.launchFixUI()){
				this.reshapeAction();
			}
		},
		onClick:function(e){
			//handle forms
			var tag =  e.target && e.target.tagName != undefined ? e.target.tagName.toLowerCase() : '';
			
			//this.log("click on "+tag);
			
            if (inputElements.indexOf(tag)!==-1 && (!this.isFocused_ || !e.target.isSameNode(this.focusedElement))) {

				var type =  e.target && e.target.type != undefined ? e.target.type.toLowerCase() : '';
				var autoBlur = autoBlurInputTypes.indexOf(type)!==-1;
				
				//focus
				if(!autoBlur) {
					//remove previous blur event if this keeps focus
					if(this.isFocused_){
						this.focusedElement.removeEventListener('blur', this, false);
					}
					this.focusedElement = e.target;
					this.focusedElement.addEventListener('blur', this, false);
					//android bug workaround for UI
					if(!this.isFocused_ && !this.justBlurred_) {
						//this.log("enter edit mode");
						$.trigger(this, 'enter-edit', [e.target]);
						//fire / preview reshape event
						if($.os.ios) {
							var that = this;
							setTimeout(function(){that.fireReshapeEvent('enter-edit');}, 300);	//TODO: get accurate reading from window scrolling motion and get rid of timeout
						} else this.previewReshapeEvent('enter-edit');
					}
					this.isFocused_ = true;
				} else {
					this.isFocused_=false;
				}
				this.justBlurred_ = false;
				this.allowDocumentScroll_ = true;
				
				//fire focus action
				if(requiresJSFocus){
					e.target.focus();
				}
				
				//BB10 needs to be preventDefault on touchstart and thus need manual blur on click
            } else if($.os.blackberry10 && this.isFocused_) {
				//this.log("forcing blur on bb10 ");
				this.focusedElement.blur();
			}
		},
		previewReshapeEvent:function(ev){
			//a reshape event of this type should fire within the next 750 ms, otherwise fire it yourself
			that = this;
			this.reshapeTimeout_ = setTimeout(function(){
				that.fireReshapeEvent(ev);
				that.reshapeTimeout_=null;
				that.holdingReshapeType_=null;
			}, 750);
			this.holdingReshapeType_ = ev;
		},
		fireReshapeEvent:function(ev){
			//this.log(ev?ev+'-reshape':'unknown-reshape');
			$.trigger(this, 'reshape');	//trigger a general reshape notice
			$.trigger(this, ev?ev+'-reshape':'unknown-reshape');	//trigger the specific reshape
		},
		reshapeAction:function(){
			if(this.reshapeTimeout_){
				//we have a specific reshape event waiting for a reshapeAction, fire it now
				clearTimeout(this.reshapeTimeout_);
				this.fireReshapeEvent(this.holdingReshapeType_);
				this.holdingReshapeType_ = null;
				this.reshapeTimeout_=null;
			} else this.previewReshapeEvent();
		},
		onBlur:function(e){
			if(jq.os.android && e.target == window) return;	//ignore window blurs
			//this.log("blurring");
			this.isFocused_=false;
			//just in case...
			if(this.focusedElement) this.focusedElement.removeEventListener('blur', this, false);
			this.focusedElement = null;
			//make sure this blur is not followed by another focus
			this.justBlurred_=true;
			$.asap(this.exitEditProxy_, this, [e.target]);
		},
		exitExit:function(el){
			this.justBlurred_ = false;
			if(!this.isFocused_) {
				//this.log("exit edit mode");
				$.trigger(this, 'exit-edit', [el]);
				//do not allow scroll anymore
				this.allowDocumentScroll_=false;
				//fire / preview reshape event
				if($.os.ios) {
					var that = this; 
					setTimeout(function(){that.fireReshapeEvent('exit-edit');}, 300);	//TODO: get accurate reading from window scrolling motion and get rid of timeout
				} else this.previewReshapeEvent('exit-edit');
			}
		},
		onScroll:function(e){
			//this.log("document scroll detected "+document.body.scrollTop);
			if(!this.allowDocumentScroll_ && !this.isPanning_ && e.target.isSameNode(document)) {
				this.allowDocumentScroll_ = true;
				if(this.wasPanning_){
					this.wasPanning_ = false;
					//give it a couple of seconds
					setTimeout(this.launchFixUIProxy_, 2000, [maxHideTries]);
				} else {
					//this.log("scroll forced page into place");
					this.launchFixUI();
				}
			}
		},

        onTouchStart: function(e) {
			//setup initial touch position
            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
			this.lastTimestamp = e.timeStamp;
			
			
            
			//check dom if necessary
			if(requirePanning||$.feat.nativeTouchScroll) this.checkDOMTree(e.target, this.layer);
			//scrollend check
			if(this.isScrolling){
				//remove prev timeout
				if(this.scrollTimeout_!=null){
					clearTimeout(this.scrollTimeout_);
					//different element, trigger scrollend anyway
					if(this.scrollTimeoutEl_ != this.scrollingEl_) this.scrollEnded(false);
					else this.blockPossibleClick_=true;
					//check if event was already set
				} else if(this.scrollTimeoutEl_){
					//trigger 
					this.scrollEnded(true);
					this.blockPossibleClick_=true;
				}
				
			}
			
			
            // We allow forcing native tap in android devices (required in special cases)
            var forceNativeTap = (jq.os.android && e && e.target && e.target.getAttribute && e.target.getAttribute("data-touchlayer") == "ignore");
            
			//if on edit mode, allow all native touches 
			//(BB10 must still be prevented, always clicks even after move)
			if(forceNativeTap || (this.isFocused_ && !$.os.blackberry10)) {
				this.requiresNativeTap=true;
				this.allowDocumentScroll_=true;
			
			//some stupid phones require a native tap in order for the native input elements to work
			} else if(inputElementRequiresNativeTap && e.target && e.target.tagName != undefined){
				var tag = e.target.tagName.toLowerCase();
				if(inputElements.indexOf(tag)!==-1) {
					//notify scrollers (android forms bug), except for selects
					if(tag!='select') $.trigger(this, 'pre-enter-edit', [e.target]);
					this.requiresNativeTap = true;
				}
			}
			
			////this.log("Touchstart: "+
			//	(this.isFocused_?"focused ":"")+
			//	(this.isPanning_?"panning ":"")+
			//	(this.requiresNativeTap?"nativeTap ":"")+
			//	(this.isScrolling?"scrolling ":"")+
			//	(this.allowDocumentScroll_?"allowDocumentScroll_ ":"")
			//);
			
			//prevent default if possible
			if(!this.isScrolling && !this.isPanning_ && !this.requiresNativeTap) {
				e.preventDefault();
				//demand vertical scroll (don't let it pan the page)
			} else if(this.isScrollingVertical_){
				this.demandVerticalScroll();
			}
        },
		demandVerticalScroll:function(){
			//if at top or bottom adjust scroll
			var atTop = this.scrollingEl_.scrollTop<=0;
			if(atTop){
				//this.log("adjusting scrollTop to 1");
				this.scrollingEl_.scrollTop=1;
			} else {
				var scrollHeight = this.scrollingEl_.scrollTop+this.scrollingEl_.clientHeight;
				var atBottom = scrollHeight>=this.scrollingEl_.scrollHeight;
				if(atBottom) {
					//this.log("adjusting scrollTop to max-1");
					this.scrollingEl_.scrollTop=this.scrollingEl_.scrollHeight-this.scrollingEl_.clientHeight-1;
				}
			}
		},
		//set rules here to ignore scrolling check on these elements
		//consider forcing user to use scroller object to assess these... might be causing bugs
		ignoreScrolling:function(el){
			if(el['scrollWidth']===undefined || el['clientWidth']===undefined) return true;
			if(el['scrollHeight']===undefined || el['clientHeight']===undefined) return true;
			return false;
		},
		
		allowsVerticalScroll:function(el, styles){
			var overflowY = styles.overflowY;
			if(overflowY == 'scroll') return true;
			if(overflowY == 'auto' && el['scrollHeight'] > el['clientHeight'])
				return true;
			return false;
		},
		allowsHorizontalScroll:function(el, styles){
			var overflowX = styles.overflowX;
			if(overflowX == 'scroll') return true;
			if(overflowX == 'auto' && el['scrollWidth'] > el['clientWidth'])
				return true;
			return false;
		},
		
		
		//check if pan or native scroll is possible
		checkDOMTree : function(el, parentTarget){
			
			//check panning
			//temporarily disabled for android - click vs panning issues
			if(requirePanning && this.panElementId==el.id){
				this.isPanning_ = true;
				return;
			}
			//check native scroll
			if($.feat.nativeTouchScroll){
				
				//prevent errors
				if(this.ignoreScrolling(el)) {
					return;
				}
			
				//check if vertical or hor scroll are allowed
				var styles = window.getComputedStyle(el);
				if (this.allowsVerticalScroll(el, styles)){
					this.isScrollingVertical_=true;
					this.scrollingEl_ = el;
					this.isScrolling = true;
					return;
				} else if(this.allowsHorizontalScroll(el, styles)){
					this.isScrollingVertical_=false;
					this.scrollingEl_ = null;
					this.isScrolling = true;
				}
				
			}
			//check recursive up to top element
			var isTarget = el.isSameNode(parentTarget);
			if(!isTarget && el.parentNode) this.checkDOMTree(el.parentNode, parentTarget);
		},
		//scroll finish detectors
		scrollEnded : function(e){
			//this.log("scrollEnded");
			if(e) this.scrollTimeoutEl_.removeEventListener('scroll', this.scrollEndedProxy_, false);
			this.fireEvent('UIEvents', 'scrollend', this.scrollTimeoutEl_, false, false);
			this.scrollTimeoutEl_=null;
		},
		
        
        onTouchMove: function(e) {
			//set it as moved
			var wasMoving = this.moved;
			this.moved = true;
			//very sensitive devices check
			if(verySensitiveTouch){
				this.cY = e.touches[0].pageY - this.dY;
				this.cX = e.touches[0].pageX - this.dX;
			}
			//panning check
			if(this.isPanning_) {
				return;
			}
			//native scroll (for scrollend)
			if(this.isScrolling){
				if(!wasMoving) {
					//this.log("scrollstart");
					this.fireEvent('UIEvents', 'scrollstart', this.scrollingEl_, false, false);
				}
				if(this.isScrollingVertical_) {
					this.speedY = (this.lastY - e.touches[0].pageY)/(e.timeStamp-this.lastTimestamp);
					this.lastY = e.touches[0].pageY;
					this.lastTimestamp = e.timeStamp;
				}
			}
			//non-native scroll devices
			if(!this.isScrolling && (!$.os.blackberry10 || !this.requiresNativeTap)){
				//legacy stuff for old browsers
	            e.preventDefault();
				////this.log("TouchMove (preventDefault): "+
				//	(this.isFocused_?"focused ":"")+
				//	(this.isPanning_?"panning ":"")+
				//	(this.requiresNativeTap?"nativeTap ":"")+
				//	(this.isScrolling?"scrolling ":"")+
				//	(this.moved?"moved ":"")
				//);
				return;
			}
			
			////this.log("TouchMove: "+
			//	(this.isFocused_?"focused ":"")+
			//	(this.isPanning_?"panning ":"")+
			//	(this.requiresNativeTap?"nativeTap ":"")+
			//	(this.isScrolling?"scrolling ":"")+
			//	(this.moved?"moved ":"")
			//);
        },
        
        onTouchEnd: function(e) {
			//double check moved for sensitive devices
			var itMoved = this.moved;
			if(verySensitiveTouch){
				itMoved = itMoved && !(Math.abs(this.cX) < 10 && Math.abs(this.cY) < 10);
			}
			
			//don't allow document scroll unless a specific click demands it further ahead
			if(!jq.os.ios || !this.requiresNativeTap) this.allowDocumentScroll_=false;
			
			//panning action
			if(this.isPanning_ && itMoved){
				//wait 2 secs and cancel
				this.wasPanning_ = true;
				
			//a generated click
			} else if (!itMoved && !this.requiresNativeTap) {
				
				//NOTE: on android if touchstart is not preventDefault(), click will fire even if touchend is prevented
				//this is one of the reasons why scrolling and panning can not be nice and native like on iPhone
				e.preventDefault();
				
				//fire click
				if(!this.blockClicks && !this.blockPossibleClick_){
	                var theTarget = e.target;
	                if (theTarget.nodeType == 3)
	                    theTarget = theTarget.parentNode;
				
					this.fireEvent('MouseEvents', 'click', theTarget, true, e.mouseToTouch);
				}
				
            } else if(itMoved){
				//setup scrollend stuff
				if(this.isScrolling){
					this.scrollTimeoutEl_ = this.scrollingEl_;
					if(Math.abs(this.speedY)<0.01){
						//fire scrollend immediatly
						//this.log(" scrollend immediately "+this.speedY);
						this.scrollEnded(false);
					} else {
						//wait for scroll event
						//this.log($.debug.since()+" setting scroll timeout "+this.speedY);
						this.scrollTimeout_ = setTimeout(this.scrollTimeoutExpireProxy_,30)
					}
				}
				//trigger cancel-enter-edit on inputs
				if(this.requiresNativeTap){
            		if(!this.isFocused_) $.trigger(this, 'cancel-enter-edit', [e.target]);
				}
            }
			
			
			
			////this.log("TouchEnd: "+
			//	(this.isFocused_?"focused ":"")+
			//	(this.isPanning_?"panning ":"")+
			//	(this.requiresNativeTap?"nativeTap ":"")+
			//	(this.isScrolling?"scrolling ":"")+
			//	(itMoved?"moved ":"")
			//);
			
			
			//clear up vars
			this.clearTouchVars();
        },
		
		clearTouchVars:function(){
			//this.log("clearing touchVars");
			this.speedY = this.lastY = this.cY = this.cX = this.dX = this.dY = 0;
            this.moved = false;
			this.isPanning_ = false;
			this.isScrolling = false;
			this.isScrollingVertical_ = false;
			this.requiresNativeTap = false;
			this.blockPossibleClick_ = false;
		},
		
		fireEvent:function(eventType, eventName, target, bubbles, mouseToTouch){
			//this.log("Firing event "+eventName);
			//create the event and set the options
			var theEvent = document.createEvent(eventType);
			theEvent.initEvent(eventName, bubbles, true);
			theEvent.target = target;
			//jq.DesktopBrowsers flag
			if(mouseToTouch) theEvent.mouseToTouch = true;
			target.dispatchEvent(theEvent);
		}
		
		// ,
		// logInfo:function(prefix){
		// 	this.log(prefix+": {window:(ih"+window.innerHeight+"|oh"+window.outerHeight+"|s"+document.body.scrollTop+"|y"+window.pageYOffset+"}");
		// },
		// log : function(str){
		// 	$.debug.log(str);
		// }
    };
    
})();

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
    var ui = function() {
        // Init the page
        var that = this;
		
		//setup the menu and boot touchLayer
	    jq(document).ready(function() {
			//setup the menu
	        if (jq("nav").length > 0) {
	            jq("#jQUi #header").addClass("hasMenu off");
	            jq("#jQUi #content").addClass("hasMenu off");
	            jq("#jQUi #navbar").addClass("hasMenu off");
	        }
			//boot touchLayer
			//TODO: touchLayer should be initiated here, but requires jQUI element to exist
			//if $.ui.launch can optionally create the jQUI object, we should had that option here somehow...
	        jQUi = document.getElementById("jQUi");
			$.touchLayer(jQUi);
	    });
		
        if (window.AppMobi)
            document.addEventListener("appMobi.device.ready", function(){that.autoBoot();}, false);
        else if (document.readyState == "complete" || document.readyState == "loaded") {
            this.autoBoot();
        } else 
            document.addEventListener("DOMContentLoaded", function(){that.autoBoot();}, false);
			
        if (!window.AppMobi)
            AppMobi = {}, AppMobi.webRoot = "";
			
		//click back event
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
         this.availableTransitions = {};
         this.availableTransitions['default'] =this.availableTransitions['none'] = this.noTransition;
    };
    
    
    ui.prototype = {
        isAppMobi: false,
        titlebar: "",
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
        customMenu: false,
        defaultMenu: "",
        _readyFunc: null,
        doingTransition: false,
        passwordBox: jq.passwordBox ? new jq.passwordBox() : false,
        selectBox: jq.selectBox ? jq.selectBox : false,
        ajaxUrl: "",
        transitionType: "slide",
        scrollingDivs: [],
        firstDiv: "",
        remoteJSPages: {},
        hasLaunched: false,
        launchCompleted: false,
        activeDiv: "",
		menuAnimation: null,
		togglingSideMenu:false,
		
		autoBoot: function(){
            this.hasLaunched = true;
            if (this.autoLaunch) {
                this.launch();
            }
		},
        css3animate: function(el, opts) {
            return jq(el).css3Animate(opts);
        },
        /**
         * this is a boolean when set to true (default) it will load that panel when the app is started
           ```
           $.ui.loadDefaultHash=false; //Never load the page from the hash when the app is started
           $.ui.loadDefaultHash=true; //Default
           ```
         *@title $.ui.loadDefaultHash
         */
        loadDefaultHash:true,
        
        /**
         * This is a boolean that when set to true will add "&cache=_rand_" to any ajax loaded link
           ```
           $.ui.useAjaxCacheBuster=true;
           ```
          *@title $.ui.useAjaxCacheBuster
          */
        useAjaxCacheBuster:false,
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
            return jq("#jQUi").actionsheet(opts);
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
            return $("#jQUi").popup(opts);
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
            if(this.launchCompleted) 
                param();
            else
                document.addEventListener("jq.ui.ready",param,false);
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
                var that = this;
                $.asap(
                    function() {
                        var tmpEl = that.history.pop();
                        that.loadContent(tmpEl.target + "", 0, 1, tmpEl.transition);
                        that.transitionType = tmpEl.transition;
                        //for Android 4.0.x, we must touchLayer.hideAdressBar()
                    });
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
         * Updates the current window hash
         *
         * @param {String} newHash New Hash value
         * @title $.ui.updateHash(newHash)
         */
        updateHash: function(newHash) {
            previousTarget = '#' + newHash.replace('#', '');

            var previousHash = window.location.hash;
            var firstSlash = newHash.indexOf('/');
            var panelName = newHash.substring(1, firstSlash == -1?null:firstSlash - 1);

            try {
                window.history.replaceState(panelName, panelName, window.location.pathname + newHash);
                $(window).trigger("hashchange", {newUrl: window.location.pathname + newHash, oldUrl: window.location.pathname + previousHash});
            }
            catch (e) {
            }
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
				var val = numOnly(jq("#header").css("height"));
                jq("#content").css("top", val+'px');
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
        toggleSideMenu: function(force, callback) {
			if(!this.isSideMenuEnabled() || this.togglingSideMenu) return;
            this.togglingSideMenu = true;

            var that = this;
            var menu = jq("#menu");
			var els = jq("#content, #menu, #header, #navbar");
			
            if (!(menu.hasClass("on") || menu.hasClass("to-on")) && ((force !== undefined && force !== false) || force === undefined)) {

				menu.show();
				$.asap(function(){
					that.css3animate(els,{
						"removeClass":"to-off off on",
						"addClass":"to-on",
						complete:function(canceled){
							if(!canceled){
	                            that.css3animate(els,{
									"removeClass":"to-off off to-on",
									"addClass":"on",
									time:0,
									complete:function(){
                                        that.togglingSideMenu = false;
										if(callback) callback(false);
									}
								});
							} else{
                                that.togglingSideMenu = false;
                                if(callback) callback(true);
                            }
						}
					});
				});	
            
            } else if (force === undefined || (force !== undefined && force === false)) {


				that.css3animate(els,{
					"removeClass":"on off to-on",
					"addClass":"to-off",
					complete:function(canceled){
						if(!canceled){
	                        that.css3animate(els,{
								"removeClass":"to-off on to-on",
								"addClass":"off",
								time:0,
								complete:function(){
	                                menu.hide();
                                    that.togglingSideMenu = false;
									if(callback) callback(false);
								}
							});
						} else{
                            that.togglingSideMenu = false;
                            if(callback) callback(true);
                        }
					}
				});
            }
        },
		disableSideMenu:function(){
			var that = this;
			var els = jq("#content, #menu, #header, #navbar");
			if(this.isSideMenuOn()){
				this.toggleSideMenu(false, function(canceled){
					if(!canceled) els.removeClass("hasMenu");
				});
			} else els.removeClass("hasMenu");
		},
		enableSideMenu:function(){
			var that = this;
			var els = jq("#content, #menu, #header, #navbar");
			els.addClass("hasMenu");
		},
		isSideMenuEnabled:function(){
			return jq("#content").hasClass("hasMenu");
		},
		isSideMenuOn:function(){
			var menu = jq('#menu');
			return this.isSideMenuEnabled() && (menu.hasClass("on") || menu.hasClass("to-on"));
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
                if (elems[i].oldhash) {
                    node.href = elems[i].oldhref;
                    node.onclick = elems[i].oldonclick;
                }
                nb.append(node);
            }
             jq("#navbar a").data("ignore-pressed", "true").data("resetHistory", "true");
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
                that.toggleSideMenu(false);
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
            this.scrollingDivs['menu_scroller'].hideScrollbars();
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
            this.titleBar.innerHTML = val;
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
                this.backButton.innerHTML = this.backButtonText;
            else
                this.backButton.innerHTML = text;
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
            try {
                if ($am(id)) {
                    //jq("#modalContainer").html('<div style="width:1px;height:1px;-webkit-transform:translate3d(0,0,0);float:right"></div>'+$am(id).childNodes[0].innerHTML+'');
                    jq("#modalContainer").html($am(id).childNodes[0].innerHTML+'');
                    jq('#modalContainer').append("<a href='javascript:;' onclick='$.ui.hideModal();' class='closebutton modalbutton'></a>");
                    this.modalWindow.style.display = "block";
                    
                    button = null;
                    content = null;
                    this.scrollingDivs['modal_container'].enable();
                    this.scrollToTop('modal');
                }
            } catch (e) {
                console.log("Error with modal - " + e, this.modalWindow);
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
            
            this.scrollingDivs['modal_container'].disable();
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
            
            var newDiv = document.createElement("div");
            newDiv.innerHTML = content;
            if($(newDiv).children('.panel') && $(newDiv).children('.panel').length > 0) newDiv = $(newDiv).children('.panel').get();
                
             
            
            if (el.getAttribute("js-scrolling") && el.getAttribute("js-scrolling").toLowerCase() == "yes"){
                $.cleanUpContent(el.childNodes[0], false, true);
                el.childNodes[0].innerHTML = content;
            }
            else{
                $.cleanUpContent(el, false, true);
                el.innerHTML = content;
            }
                
            if($(newDiv).title) el.title = $(newDiv).title;
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
                newDiv.innerHTML = content;
                if($(newDiv).children('.panel') && $(newDiv).children('.panel').length > 0) newDiv = $(newDiv).children('.panel').get();
                
                if(!newDiv.title&&title) newDiv.title = title;
                var newId = (newDiv.id)? newDiv.id : el; //figure out the new id - either the id from the loaded div.panel or the crc32 hash
                newDiv.id = newId;
            } else {
                newDiv = myEl;
            }
            newDiv.className = "panel";
            var that = this;
            
            myEl = null;
            that.addDivAndScroll(newDiv, refresh, refreshFunc);
            newDiv = null;
            return newId;
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
			var jsScroll = false;
			var overflowStyle = tmp.style.overflow;
			var hasScroll = overflowStyle!='hidden'&&overflowStyle!='visible';
			
			//sets up scroll when required and not supported
			if(!$.feat.nativeTouchScroll&&hasScroll) tmp.setAttribute("js-scrolling", "yes");
			
            if (tmp.getAttribute("js-scrolling") && tmp.getAttribute("js-scrolling").toLowerCase() == "yes"){
				jsScroll = true;
				hasScroll = true;
            }
            
			
                
            if (!jsScroll) {
                this.content.appendChild(tmp);
				var scrollEl = tmp;
            } else {
	            //WE need to clone the div so we keep events
	            var scrollEl = tmp.cloneNode(false);
            
            
	            tmp.title = null;
	            tmp.id = null;
	            tmp.removeAttribute("footer");
	            tmp.removeAttribute("nav");
	            jq(tmp).replaceClass("panel", "jqmScrollPanel");
            
	            scrollEl.appendChild(tmp);
            
	            this.content.appendChild(scrollEl);
            	
	            if(this.selectBox!==false) this.selectBox.getOldSelects(scrollEl.id);
	            if(this.passwordBox!==false) this.passwordBox.getOldPasswords(scrollEl.id);
            	
            }

			if(hasScroll){
	            this.scrollingDivs[scrollEl.id] = (jq(tmp).scroller({
	                scrollBars: true,
	                verticalScroll: true,
	                horizontalScroll: false,
	                vScrollCSS: "jqmScrollbar",
	                refresh: refreshPull,
					useJsScroll:jsScroll,
					autoEnable:false	//dont enable the events unnecessarilly
	            }));
				//backwards compatibility
				if(refreshFunc) $.bind(this.scrollingDivs[scrollEl.id], 'refresh-release', function(trigger){if(trigger) refreshFunc()});
			}
            
			tmp = null;
			scrollEl = null;
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
            //check for custom footer
            var that = this;
            var hasFooter = what.getAttribute("data-footer");
            
			//Note: this used to be a setTimeout(,10) and I set it to $.asap
			//It should be ok, but if anyone finds a bug related to it feel free to change it back
            $.asap(function() {
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
                if (what.getAttribute("data-tab")) { //Allow the dev to force the footer menu
                    jq("#navbar a").removeClass("selected");
                    jq("#" + what.getAttribute("data-tab")).addClass("selected");
                }
            });
            var hasMenu = what.getAttribute("data-nav");
            if (hasMenu && this.customMenu != hasMenu) {
				this.customMenu = hasMenu;
                this.updateSideMenu(jq("#" + hasMenu).children());
            } else if (hasMenu != this.customMenu) {
                if (this.customMenu){
					this.updateSideMenu(this.defaultMenu);
                }  
                this.customMenu = false;
            }
            
            
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
            if (this.isSideMenuOn()){
				this.toggleSideMenu(false);
            }
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
                if (scripts[i].src.length > 0 && !that.remoteJSPages[scripts[i].src]) {
                    var doc = document.createElement("script");
                    doc.type = scripts[i].type;
                    doc.src = scripts[i].src;
                    document.getElementsByTagName('head')[0].appendChild(doc);
                    that.remoteJSPages[scripts[i].src] = 1;
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
                    if (anchor.getAttribute("data-refresh-ajax") === 'true' || (anchor.refresh && anchor.refresh === true)) {
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
                        } else if (anchor.getAttribute("data-persist-ajax")) {
                                
                            var refresh = (anchor.getAttribute("data-pull-scroller") === 'true') ? true : false;
                            refreshFunction = refresh ? 
                            function() {
                                anchor.refresh = true;
                                that.loadContent(target, newTab, back, transition, anchor);
                                anchor.refresh = false;
                            } : null;
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
                var newtarget = this.useAjaxCacheBuster?target + (target.split('?')[1] ? '&' : '?') + "cache=" + Math.random() * 10000000000000000:target;
                xmlhttp.open("GET", newtarget, true);
                xmlhttp.send();
                // show Ajax Mask
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
                if (what == this.activeDiv && !back){
                	//toggle the menu if applicable
		            if (this.isSideMenuOn()) this.toggleSideMenu(false);
					return;
                }
                    
                if (what.getAttribute("data-modal") == "true" || what.getAttribute("modal") == "true") {
                    return this.showModal(what.id);
                }
                what.style.display = "block";
                    
                    
                    
                this.transitionType = transition;
                var oldDiv = this.activeDiv;
                var currWhat = what;
                    
                if (oldDiv == currWhat) //prevent it from going to itself
                    return;
                    
                if (newTab) {
                    this.history = [];
                    this.history.push({
                        target: "#" + this.firstDiv.id,
                        transition: transition
                    });
                } else if (!back) {
                    this.history.push({
                        target: previousTarget,
                        transition: transition
                    });
                }
                try {
                    window.history.pushState(what.id, what.id, startPath + '#' + what.id + hashLink);
                    $(window).trigger("hashchange", {newUrl: startPath + '#' + what.id + hashLink,oldURL: startPath + previousTarget});
                } 
                catch (e) {
                }
                    
                previousTarget = '#' + what.id + hashLink;
                    
                if (this.resetScrollers && this.scrollingDivs[what.id]) {
                    this.scrollingDivs[what.id].scrollTo({
                        x: 0,
                        y: 0
                    });
                }
                this.doingTransition = true;
				this.runTransition(transition, oldDiv, currWhat, back);
                
                    
                if (back) {
                    if (this.history.length > 0) {
                        var val = this.history[this.history.length - 1];
						var slashIndex = val.target.indexOf('/');
						if (slashIndex != -1) {
						    var prevId = val.target.substr(0, slashIndex);
						} else var prevId = val.target;
                        var el = $am(prevId.replace("#", ""));
						//make sure panel is there
                        if(el) this.setBackButtonText(el.title);
						else this.setBackButtonText("Back");
                    }
                } else if (this.activeDiv.title)
                    this.setBackButtonText(this.activeDiv.title)
                else
                    this.setBackButtonText("Back");
                if (what.title) {
                    this.titleBar.innerHTML = what.title;
                }
                if (newTab) {
                    this.setBackButtonText(this.firstDiv.title)
                }
                    
                if (this.history.length == 0) {
                    this.backButton.style.visibility = "hidden";
                    this.history = [];
                } else if (this.showBackbutton)
                    this.backButton.style.visibility = "visible";
                this.activeDiv = what;
                if (this.scrollingDivs[this.activeDiv.id]) {
                    this.scrollingDivs[this.activeDiv.id].enable();
                }
                if (this.scrollingDivs[oldDiv.id]) {
                    this.scrollingDivs[oldDiv.id].disable();
                }
                //Let's check if it has a function to run to update the data
                this.parsePanelFunctions(what, oldDiv);
                window.scrollTo(1,1);
			}
        },
		
		runTransition: function(transition, oldDiv, currWhat, back){
            if (!this.availableTransitions[transition]) transition = 'default';
            this.availableTransitions[transition].call(this, oldDiv, currWhat, back);
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
			
			var that = this;

            this.isAppMobi = (window.AppMobi && typeof (AppMobi) == "object" && AppMobi.app !== undefined) ? true : false;
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
			//set anchor click handler for UI
			this.viewportContainer[0].addEventListener('click', function(e){
				var theTarget = e.target;
				checkAnchorClick(e, theTarget);
			}, false);
			
			var enterEditEl = null;
			//on enter-edit keep a reference of the actioned element
			$.bind($.touchLayer, 'enter-edit', function(el){ enterEditEl = el; });
			//enter-edit-reshape panel padding and scroll adjust
			$.bind($.touchLayer, 'enter-edit-reshape', function(){
				//onReshape UI fixes
				//check if focused element is within active panel
				var jQel = $(enterEditEl);
				var jQactive = jQel.closest(that.activeDiv);
				if(jQactive && jQactive.size()>0){
					if($.os.ios || $.os.chrome){
						var paddingTop, paddingBottom;
						if(document.body.scrollTop){
							paddingTop=document.body.scrollTop-jQactive.offset().top;
						} else {
							paddingTop=0;
						}
						//not exact, can be a little above the actual value
						//but we haven't found an accurate way to measure it and this is the best so far
						paddingBottom=jQactive.offset().bottom-jQel.offset().bottom;	
						that.scrollingDivs[that.activeDiv.id].setPaddings(paddingTop, paddingBottom);

					} else if($.os.android || $.os.blackberry){
						var elPos = jQel.offset();
						var containerPos = jQactive.offset();
						if(elPos.bottom>containerPos.bottom && elPos.height<containerPos.height){
							//apply fix
							that.scrollingDivs[that.activeDiv.id].scrollToItem(jQel, 'bottom');
						}
					}
				}
			});
			if($.os.ios){
				$.bind($.touchLayer, 'exit-edit-reshape', function(){
					that.scrollingDivs[that.activeDiv.id].setPaddings(0, 0);
				});
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
                this.menu.innerHTML = '<div id="menu_scroller"></div>';
                this.viewportContainer.append(this.menu);
                this.scrollingDivs["menu_scroller"] = jq("#menu_scroller").scroller({
                    scrollBars: false,
                    verticalScroll: true,
                    vScrollCSS: "jqmScrollbar"
                });
            }
            
            
            if (!this.content) {
                this.content = document.createElement("div");
                this.content.id = "content";
                this.viewportContainer.append(this.content);
            }
			
            this.header.innerHTML = '<a id="backButton"  href="javascript:;"></a> <h1 id="pageTitle"></h1>' + header.innerHTML;
            this.backButton = $am("backButton");
            this.backButton.className = "button";
            
            this.backButton.onclick = function() {
				that.goBack();
            };
            this.backButton.style.visibility = "hidden";
            this.titleBar = $am("pageTitle");
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
            
            var defer = {};
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
                if (el.getAttribute("data-defer"))
                    defer[id] = el.getAttribute("data-defer");
                el = null;
            }
            contentDivs = null;
            var loadingDefer=false;
            var toLoad=Object.keys(defer).length;
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
                if (this.scrollingDivs[this.activeDiv.id]) {
                    this.scrollingDivs[this.activeDiv.id].enable();
                }
                
                //window.setTimeout(function() {
                var loadFirstDiv=function(){
                    //activeDiv = firstDiv;
                    //activeDiv = firstDiv;
                    if (defaultHash.length > 0 && that.loadDefaultHash&&defaultHash!=("#"+that.firstDiv.id)&&$(defaultHash).length>0)
                    {
                        that.activeDiv=$(defaultHash).get();
                        jq("#header #backButton").css("visibility","visible");
                        that.setBackButtonText(that.activeDiv.title)
                        that.history=[{target:"#"+that.firstDiv.id}]; //Reset the history to the first div
                    }
                    else
                        previousTarget="#"+that.activeDiv.id;
                    
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
                    jq("#navbar").on("click", "a", function(e) {
                        jq("#navbar a").not(this).removeClass("selected");
                        setTimeout(function() {
                            $(e.target).addClass("selected");
                        }, 10);
                    });
                };
                if(loadingDefer){
                    $(document).one("defer:loaded",loadFirstDiv);
                }
                else
                    window.setTimeout(loadFirstDiv,100);	//could this be $.asap?
            }
           
        },
        noTransition: function(oldDiv, currDiv, back) {
            currDiv.style.display = "block";
			oldDiv.style.display = "block";
            var that = this;
            that.clearAnimations(currDiv);
			that.css3animate(oldDiv, {
                x: "-100%",
                y: 0
            });
            that.finishTransition(oldDiv);
            currDiv.style.zIndex = 2;
            oldDiv.style.zIndex = 1;
        },
		/**
         * This must be called at the end of every transition to hide the old div and reset the doingTransition variable
         *
         * @param {Object} Div that transitioned out
         * @title $.ui.finishTransition(oldDiv)
         */
        finishTransition: function(oldDiv, currDiv) {
            oldDiv.style.display = 'none';
            this.doingTransition = false;
			if(currDiv) this.clearAnimations(currDiv);
        },
		
        /**
         * This must be called at the end of every transition to remove all transforms and transitions attached to the inView object (performance + native scroll)
         *
         * @param {Object} Div that transitioned out
         * @title $.ui.finishTransition(oldDiv)
         */
        clearAnimations: function(inViewDiv) {
			inViewDiv.style.webkitTransform = "none";
			inViewDiv.style.webkitTransition = "none";
        }
		
    /**
         * END
         * @api private
         */
    };
    
    function $am(el) {
        el = typeof el == 'string' && el.indexOf("#") == -1 ? "#" + el : el;
        return jq(el).get(0);
    }
	
	//lookup for a clicked anchor recursively and fire UI own actions when applicable 
    var checkAnchorClick = function(e, theTarget) {
			
		if(theTarget.isSameNode(jQUi)) {
			return;
		}
			
		//this technique fails when considerable content exists inside anchor, should be recursive ?
        if (theTarget.tagName.toLowerCase() != "a" && theTarget.parentNode)
            return checkAnchorClick(e, theTarget.parentNode); //let's try the parent (recursive)
			
		//anchors
		if (theTarget.tagName.toLowerCase() == "a") {
            if (theTarget.href.toLowerCase().indexOf("javascript:") !== -1||theTarget.getAttribute("data-ignore")) {
                return;
            }
            
            //external links
            if (theTarget.hash.indexOf("#") === -1 && theTarget.target.length > 0) 
            {
                if (theTarget.href.toLowerCase().indexOf("javascript:") != 0) {
                    if (jq.ui.isAppMobi) {
                    	e.preventDefault();
						AppMobi.device.launchExternal(theTarget.href);
                    } else if (!jq.os.desktop){
                    	e.target.target = "_blank";
                    }
                }
                return;
            }
			
			//empty links
            if (theTarget.href=="#" || theTarget.href.length==0)
                return;
            
            
			//internal links
			e.preventDefault();
            var mytransition = theTarget.getAttribute("data-transition");
            var resetHistory = theTarget.getAttribute("data-resetHistory");
            resetHistory = resetHistory && resetHistory.toLowerCase() == "true" ? true : false;
            var href = theTarget.hash.length > 0 ? theTarget.hash : theTarget.href;
            jq.ui.loadContent(href, resetHistory, 0, mytransition, theTarget);
			return;
        }
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


//The following functions are utilitiy functions for jqUi within appMobi.
//TODO: consider taking all appMobi constraints from jQUI into this code
(function() {
    document.addEventListener("appMobi.device.ready", function() { //in AppMobi, we need to undo the height stuff since it causes issues.
        setTimeout(function() {
            document.getElementById('jQUi').style.height="100%"; 
			document.body.style.height = "100%";
            document.documentElement.style.minHeight = window.innerHeight;
        }, 300);
    });

})();



(function($ui){
    
        function fadeTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                currDiv.style.zIndex = 1;
                oldDiv.style.zIndex = 2;
                that.clearAnimations(currDiv);
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "150ms",
                    opacity: .1,
                    complete: function(canceled) {
                        if(canceled) {
                            that.finishTransition(oldDiv, currDiv);
                            return;
                        }
                        
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            opacity: 1,
                            complete: function() {
                                that.finishTransition(oldDiv);
                            }
                        
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                currDiv.style.opacity = 0;
                that.css3animate(currDiv, {
                    x: "0%",
                    opacity: .1,
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "150ms",
                            opacity: 1,
                            complete:function(canceled){
                                if(canceled) {
                                    that.finishTransition(oldDiv, currDiv);
                                    return;
                                }
                                
                                that.clearAnimations(currDiv);
                                that.css3animate(oldDiv, {
                                    x: "-100%",
                                    y: 0,
                                    complete: function() {
                                        that.finishTransition(oldDiv);
                                    }
                                });
                            }
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
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            scale: 1,
                            time: "150ms",
                            rotateY: "0deg",
                            complete: function(){
                                that.clearAnimations(currDiv);
                            }
                        });
                    }
                });
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "150ms",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            opacity: 1,
                            scale: 1,
                            rotateY: "0deg",
                            complete: function() {
                                that.finishTransition(oldDiv);
                            }
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
                    time: "150ms",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            y: 0,
                            time: "1ms",
                            scale: 1,
                            rotateY: "0deg",
                            complete: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "150ms",
                            scale: 1,
                            rotateY: "0deg",
                            complete:function(){
                                that.clearAnimations(currDiv);
                            }
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
            var that = this
            if (back) {
                currDiv.style.zIndex = 1;
                oldDiv.style.zIndex = 2;
                that.clearAnimations(currDiv);
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "150ms",
                    opacity: .1,
                    scale: .2,
                    origin: "-50%"+" 50%",
                    complete: function(canceled) {
                        if(canceled) {
                            that.finishTransition(oldDiv);
                            return;
                        }
                        
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            complete: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(currDiv, {
                    x: "0%",
                    y: "0%",
                    scale: .2,
                    origin: "-50%"+" 50%",
                    opacity: .1,
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "150ms",
                            scale: 1,
                            opacity: 1,
                            origin: "0%"+" 0%",
                            complete: function(canceled){
                                if(canceled) {
                                    that.finishTransition(oldDiv, currDiv);
                                    return;
                                }
                                
                                that.clearAnimations(currDiv);
                                that.css3animate(oldDiv, {
                                    x: "100%",
                                    y: 0,
                                    complete: function() {
                                        that.finishTransition(oldDiv);
                                    }
                                });
                            }
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
            var that = this;
            if (back) {
                that.css3animate(oldDiv, {
					x:"0%",
					y:"0%",
					complete:function(){
		                that.css3animate(oldDiv, {
		                    x: "100%",
		                    time: "150ms",
		                    complete: function() {
		                        that.finishTransition(oldDiv, currDiv);
		                    }
		                }).link(currDiv, {
	                        x: "0%",
	                        time: "150ms"
	                    });
					}
				}).link(currDiv, {
					x:"-100%",
					y:"0%"
				});
            } else {
                that.css3animate(oldDiv, {
					x:"0%",
					y:"0%",
					complete:function(){
		                that.css3animate(oldDiv, {
		                    x: "-100%",
		                    time: "150ms",
		                    complete: function() {
		                        that.finishTransition(oldDiv, currDiv);
		                    }
		                }).link(currDiv, {
	                        x: "0%",
	                        time: "150ms"
	                    });
					}
				}).link(currDiv, {
					x:"100%",
					y:"0%"
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
            var that = this
            if (back) {
                currDiv.style.zIndex = 1;
                oldDiv.style.zIndex = 2;
                that.clearAnimations(currDiv);
                that.css3animate(oldDiv, {
                    y: "-100%",
                    x: "0%",
                    time: "150ms",
                    complete: function(canceled) {
                        if(canceled) {
                            that.finishTransition(oldDiv, currDiv);
                            return;
                        }
                        
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            y: 0,
                            complete: function() {
                                that.finishTransition(oldDiv);
                            
                            }
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(currDiv, {
                    y: "-100%",
                    x: "0%",
                    complete: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "0%",
                            time: "150ms",
                            complete: function(canceled){
                                if(canceled) {
                                    that.finishTransition(oldDiv, currDiv);
                                    return;
                                }
                                
                                that.clearAnimations(currDiv);
                                that.css3animate(oldDiv, {
                                    x: "-100%",
                                    y: 0,
                                    complete: function() {
                                        that.finishTransition(oldDiv);
                                    }
                                });
                                
                            }
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
            var that = this;
            if (back) {
                currDiv.style.zIndex = 1;
                oldDiv.style.zIndex = 2;
                
                that.clearAnimations(currDiv);

                that.css3animate(oldDiv, {
                    y: "100%",
                    x: "0%",
                    time: "150ms",
                    complete: function() {
                        that.finishTransition(oldDiv);
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                currDiv.style.zIndex = 2;
                oldDiv.style.zIndex = 1;
                that.css3animate(currDiv, {
                    y: "100%",
                    x: "0%",
                    complete: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "0%",
                            time: "150ms",
                            complete: function(canceled) {
                                if(canceled) {
                                    that.finishTransition(oldDiv, currDiv);
                                    return;
                                }
                                
                                that.clearAnimations(currDiv);
                                that.css3animate(oldDiv, {
                                    x: "-100%",
                                    y: 0,
                                    complete: function() {
                                        that.finishTransition(oldDiv);
                                    }
                                });
                                
                            }
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.up = slideUpTransition;
})($.ui);

