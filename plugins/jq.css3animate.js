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
		} else tmp = css3Animate(el, options);
		return tmp;
	}
    $.fn["css3Animate"] = function (opts) {
        var tmp;
		//first one
		tmp = getCSS3Animate(this[0], opts);
		opts.callback=null;
        for (var i = 1; i < this.length; i++) {
            tmp.also(this[i], opts);
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
			this.activeTimeout = null;
			this.countStack = 0;
			this.isActive = false;
			this.el = elID;
			
	        if (!this.el) return;
			
			this.animate(options);
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
			
				var callback = null;
		        if (options["callback"]) {
		            callback = options["callback"];
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
				
					if((""+options["time"]).indexOf("s")==-1) var time = options["time"]+"ms";
					else var time = options["time"];
					
					if((""+options["time"]).indexOf("ms")==-1) var timeout = timeNum*1000+100;
					else {
						var timeout = timeNum+100;
					}
			
					this.el.style.webkitTransitionDuration = time;
					this.el.style.webkitTransitionTimingFunction = options["timingFunction"];
			        this.el.style.webkitTransformOrigin = options.origin;
	            }

				//add callback to the stack
				this.callbacksStack.push(callback);
				this.countStack++;
			
				var that = this;
				if(classMode){
					//setupo the event normally
					var finishCB = function(event){
						that.finishAnimation(event);
						that.el.removeEventListener("webkitTransitionEnd", finishCB, false);
						delete that.activeEvent;
						if(that.activeTimeout){
							window.clearTimeout(that.activeTimeout);
							delete that.activeTimeout;
						}
					};
					this.el.addEventListener("webkitTransitionEnd", finishCB, false);
					this.activeEvent = finishCB;
					//class mode requires us to check if timeout was actually 0 or not after class properties are set
					this.activeTimeout = window.setTimeout(function(){
						var duration = window.getComputedStyle(that.el).webkitTransitionDuration;
						var timeNum = numOnly(duration);
						if(timeNum==0){
							that.el.removeEventListener("webkitTransitionEnd", finishCB, false);
							delete that.activeEvent;
							that.finishAnimation(false);
							delete that.activeTimeout;
						} else {
							if((""+options["time"]).indexOf("ms")==-1) var timeout = timeNum*1000+100;
							else var timeout = timeNum+100;
							that.activeTimeout = window.setTimeout(finishCB, timeout);
						}
					}, 0);
				} else {
					if(timeNum==0){
						//just wait for styles to be rendered
						this.activeTimeout = window.setTimeout(function(){
							that.finishAnimation(false);
							delete that.activeTimeout;
						}, 0);
					} else {
						var finishCB = function(event){
							that.finishAnimation(event);
							that.el.removeEventListener("webkitTransitionEnd", finishCB, false);
							delete that.activeEvent;
							if(that.activeTimeout){
								window.clearTimeout(that.activeTimeout);
								delete that.activeTimeout;
							}
						};
						this.el.addEventListener("webkitTransitionEnd", finishCB, false);
						this.activeTimeout = window.setTimeout(finishCB, timeout);
						this.activeEvent = finishCB;
					}
				}
			
			},
			addCallbackHook:function(callback){
				if(callback) this.callbacksStack.push(callback);
				this.countStack++;
				var that = this;
				return function(){that.finishAnimation();};
			},
	        finishAnimation: function (event) {
	            if(event) event.preventDefault();
				if(!this.isActive) return;
				
				this.countStack--;
				
	            if(this.countStack==0) this.fireCallbacks();
	        },
			fireCallbacks:function(){
				this.clearEvents();
				
				//keep callbacks after cleanup
				// (if any of the callbacks overrides this object, callbacks will keep on fire as expected)
				var callbacks = this.callbacksStack;
				
				//cleanup
				this.cleanup();
				
				//fire all callbacks
				for(var i=0; i<callbacks.length; i++) {
	                if (callbacks[i] && typeof (callbacks[i] == "function")) {
	                    callbacks[i]();
	                }
				}
			},
			cancel:function(){
				if(!this.isActive) return;
				this.clearEvents();
				this.cleanup();
			},
			cleanup:function(){
				this.callbacksStack=[];
				this.isActive = false;
				this.countStack = 0;
			},
			clearEvents:function(){
				if(this.activeEvent) {
					this.el.removeEventListener("webkitTransitionEnd", this.activeEvent, false);
					delete this.activeEvent;
				}
				if(this.activeTimeout) {
					window.clearTimeout(this.activeTimeout);
					delete this.activeTimeout;
				}
				this.activeEvent = null;
				this.activeTimeout = null;
			},
	        also: function (elID, opts) {
				var oldCallback = opts.callback;
				opts.callback = this.addCallbackHook(oldCallback);
				getCSS3Animate(elID, opts);
				//set the old callback back in the obj to avoid strange stuff
				opts.callback = oldCallback;
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
