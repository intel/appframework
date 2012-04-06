/**
 * jq.web.css3Animate - css3 animate class for html5 mobile apps
 * @copyright 2011 - AppMobi
 */ (function ($) {
    $.fn["css3Animate"] = function (opts) {
        var tmp;
		//first one
		tmp = new css3Animate(this[0], opts);
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
			this.callbacksStack = [];
			this.activeEventsStack = [];
			this.activeTimeoutsStack = [];
			this.countStack = 0;
			this.isActive = true;
			this.animate(elID, options);
	    };

	    css3Animate.prototype = {
			animate:function(elID, options){
			
		        if (typeof elID == "string" || elID instanceof String) {
		            var el = document.getElementById(elID);
		        } else if($.is$(elID)){
		        	el = elID[0];
		        } else {
		            var el = elID;
		        }
			
		        if (!el) return;
			
		        if (!options) {
		            alert("Please provide configuration options for animation of " + elID);
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
						jq(el).replaceClass(options["removeClass"], options["addClass"]);
					} else {
						jq(el).addClass(options["addClass"]);
					}
				
	            } else {
	            	//property by property
					var timeNum = numOnly(options["time"]);
					if(timeNum==0) options["time"]=0;
				
			        if (!options["y"]) options["y"] = 0;
			        if (!options["x"]) options["x"] = 0;
			        if (options["previous"]) {
						var cssMatrix = new WebKitCSSMatrix(window.getComputedStyle(el).webkitTransform);
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
			
			        el.style.webkitTransform = "translate" + translateOpen + (options.x) + "," + (options.y) + translateClose + " scale(" + parseFloat(options.scale) + ") rotate(" + options.rotateX + ") rotateY(" + options.rotateY + ") skew(" + options.skewX + "," + options.skewY + ")";
			        el.style.webkitBackfaceVisiblity = "hidden";
					var properties = "-webkit-transform";
			        if (options["opacity"]!==undefined) {
			            el.style.opacity = options["opacity"];
						properties+=", opacity";
			        }
			        if (options["width"]) {
			            el.style.width = options["width"];
						properties = "all";
			        }
			        if (options["height"]) {
			            el.style.height = options["height"];
						properties = "all";
			        }
					el.style.webkitTransitionProperty = properties;
				
					if((""+options["time"]).indexOf("s")==-1) var time = options["time"]+"ms";
					else var time = options["time"];
			
					el.style.webkitTransitionDuration = time;
					el.style.webkitTransitionTimingFunction = options["timingFunction"];
			        el.style.webkitTransformOrigin = options.origin;
				
	            }

				//add callback to the stack
				this.callbacksStack.push(callback);
				var curIndex = this.countStack;
				this.countStack++;
			
				var that = this;
				if(classMode){
					//setupo the event normally
					var finishCB = function(event){
						that.finishAnimation(event);
						el.removeEventListener("webkitTransitionEnd", finishCB, false);
						delete that.activeEventsStack[curIndex];
					};
					el.addEventListener("webkitTransitionEnd", finishCB, false);
					this.activeEventsStack[curIndex] = {el:el, cb:finishCB};
					//class mode requires us to check if timeout was actually 0 or not after class properties are set
					this.activeTimeoutsStack[curIndex] = window.setTimeout(function(){
						var duration = window.getComputedStyle(el).webkitTransitionDuration;
						if(numOnly(duration)==0){
							el.removeEventListener("webkitTransitionEnd", finishCB, false);
							delete that.activeEventsStack[curIndex];
							that.finishAnimation(false);
						}
						delete that.activeTimeoutsStack[curIndex];
					}, 0);
				} else {
					if(timeNum==0){
						//just wait for styles to be rendered
						this.activeTimeoutsStack[curIndex] = window.setTimeout(function(){
							that.finishAnimation(false);
							delete that.activeTimeoutsStack[curIndex];
						}, 0);
					} else {
						var finishCB = function(event){
							that.finishAnimation(event);
							el.removeEventListener("webkitTransitionEnd", finishCB, false);
							delete that.activeEventsStack[curIndex];
						};
						el.addEventListener("webkitTransitionEnd", finishCB, false);
						this.activeEventsStack[curIndex] = {el:el, cb:finishCB};
					}
				}
			
			},
	        finishAnimation: function (event) {
	            if(event) event.preventDefault();
				if(!this.isActive) return;
				
				this.countStack--;
				
	            if(this.countStack==0) this.fireCallbacks();
	        },
			fireCallbacks:function(){
				this.clearEventStacks();
				//fire all callbacks later
				for(var i=0; i<this.callbacksStack.length; i++) {
	                if (this.callbacksStack[i] && typeof (this.callbacksStack[i] == "function")) {
	                    this.callbacksStack[i]();
	                }
				}
				//cleanup
				this.cleanup();
			},
			cancel:function(){
				if(!this.isActive) return;
				console.log("cancelling an animation!");
				this.clearEventStacks();
				this.cleanup();
			},
			cleanup:function(){
				this.callbacksStack=[];
				this.isActive = false;
				this.countStack = 0;
			},
			clearEventStacks:function(){
				for(var i = 0; i<this.countStack; i++){
					if(this.activeEventsStack[i]) {
						this.activeEventsStack[i].el.removeEventListener("webkitTransitionEnd", this.activeEventsStack[i].cb, false);
						delete this.activeEventsStack[i];
					}
					if(this.activeTimeoutsStack[i]) {
						window.clearTimeout(this.activeTimeoutsStack[i]);
						delete this.activeTimeoutsStack[i];
					}
				}
				this.activeEventsStack = [];
				this.activeTimeoutsStack = [];
			},
	        also: function (elID, params) {
				this.animate(elID, params);
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
