/**
 * af.css3animate - a css3 animation library that supports chaning/callbacks
 * Copyright 2013 - Intel
 */
 /*  EXAMPLE

  $("#animate").css3Animate({
        width: "100px",
        height: "100px",
        x: "20%",
        y: "30%",
        time: "1000ms",
        opacity: .5,
        callback: function () {
            //execute when finished
        }
    });

    //Chain animations
    $("#animate").css3Animate({
        x: 20,
        y: 30,
        time: "300ms",
        callback: function () {
            $("#animate").css3Animate({
                x: 20,
                y: 30,
                time: "500ms",
                previous: true,
                callback: function () {
                    reset();
                }
            });
        }
    });
 */

 /* global af*/
 /* global numOnly*/
(function($) {
    "use strict";
    var cache = [];
    var objId = function(obj) {
        if (!obj.afCSS3AnimateId) obj.afCSS3AnimateId = $.uuid();
        return obj.afCSS3AnimateId;
    };
    var getEl = function(elID) {
        if (typeof elID === "string" || elID instanceof String) {
            return document.getElementById(elID);
        } else if ($.is$(elID)) {
            return elID[0];
        } else {
            return elID;
        }
    };
    var getCSS3Animate = function(obj, options) {
        var tmp, id, el = getEl(obj);
        //first one
        id = objId(el);
        if (cache[id]) {
            cache[id].animate(options);
            tmp = cache[id];
        } else {
            tmp = css3Animate(el, options);
            cache[id] = tmp;
        }
        return tmp;
    };
    $.fn.css3Animate = function(opts) {
        //keep old callback system - backwards compatibility - should be deprecated in future versions
        if (!opts.complete && opts.callback) opts.complete = opts.callback;
        //first on
        var tmp = getCSS3Animate(this[0], opts);
        opts.complete = null;
        opts.sucess = null;
        opts.failure = null;
        for (var i = 1; i < this.length; i++) {
            tmp.link(this[i], opts);
        }
        return tmp;
    };


    $.css3AnimateQueue = function() {
        return new css3Animate.queue();
    };
    var translateOpen = $.feat.cssTransformStart;
    var translateClose = $.feat.cssTransformEnd;
    var transitionEnd = $.feat.cssPrefix.replace(/-/g, "") + "TransitionEnd";
    transitionEnd = ($.os.fennec || $.feat.cssPrefix === "" || $.os.ie) ? "transitionend" : transitionEnd;

    transitionEnd = transitionEnd.replace(transitionEnd.charAt(0), transitionEnd.charAt(0).toLowerCase());

    var css3Animate = (function() {

        var css3Animate = function(elID, options) {
            if (!(this instanceof css3Animate)) return new css3Animate(elID, options);

            //start doing stuff
            this.callbacksStack = [];
            this.activeEvent = null;
            this.countStack = 0;
            this.isActive = false;
            this.el = elID;
            this.linkFinishedProxy = $.proxy(this.linkFinished, this);

            if (!this.el) return;

            this.animate(options);

            var that = this;
            af(this.el).bind("destroy", function() {
                var id = that.el.afCSS3AnimateId;
                that.callbacksStack = [];
                if (cache[id]) delete cache[id];
            });
        };
        css3Animate.prototype = {
            animate: function(options) {

                //cancel current active animation on this object
                if (this.isActive) this.cancel();
                this.isActive = true;

                if (!options) {
                    window.alert("Please provide configuration options for animation of " + this.el.id);
                    return;
                }

                var classMode = !! options.addClass;
                var scale, time;
                var timeNum = numOnly(options.time);
                if (classMode) {
                    //class defines properties being changed
                    if (options.removeClass) {
                        af(this.el).replaceClass(options.removeClass, options.addClass);
                    } else {
                        af(this.el).addClass(options.addClass);
                    }

                } else {
                    //property by property

                    if (timeNum === 0) options.time = 0;

                    if (!options.y) options.y = 0;
                    if (!options.x) options.x = 0;
                    if (options.previous) {
                        var cssMatrix = new $.getCssMatrix(this.el);
                        options.y += numOnly(cssMatrix.f);
                        options.x += numOnly(cssMatrix.e);
                    }
                    if (!options.origin) options.origin = "0% 0%";

                    if (!options.scale) options.scale = "1";

                    if (!options.rotateY) options.rotateY = "0";
                    if (!options.rotateX) options.rotateX = "0";
                    if (!options.skewY) options.skewY = "0";
                    if (!options.skewX) options.skewX = "0";


                    if (!options.timingFunction) options.timingFunction = "linear";

                    //check for percent or numbers
                    if (typeof(options.x) === "number" || (options.x.indexOf("%") === -1 && options.x.toLowerCase().indexOf("px") === -1 && options.x.toLowerCase().indexOf("deg") === -1)) options.x = parseInt(options.x, 10) + "px";
                    if (typeof(options.y) === "number" || (options.y.indexOf("%") === -1 && options.y.toLowerCase().indexOf("px") === -1 && options.y.toLowerCase().indexOf("deg") === -1)) options.y = parseInt(options.y, 10) + "px";

                    var trans = "translate" + translateOpen + (options.x) + "," + (options.y) + translateClose + " scale(" + parseFloat(options.scale) + ") rotate(" + options.rotateX + ")";
                    if (!$.os.opera)
                        trans += " rotateY(" + options.rotateY + ")";
                    trans += " skew(" + options.skewX + "," + options.skewY + ")";
                    this.el.style[$.feat.cssPrefix + "Transform"] = trans;
                    this.el.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
                    var properties = $.feat.cssPrefix + "Transform";
                    if (options.opacity !== undefined) {
                        this.el.style.opacity = options.opacity;
                        properties += ", opacity";
                    }
                    if (options.width) {
                        this.el.style.width = options.width;
                        properties = "all";
                    }
                    if (options.height) {
                        this.el.style.height = options.height;
                        properties = "all";
                    }
                    this.el.style[$.feat.cssPrefix + "TransitionProperty"] = "all";

                    if (("" + options.time).indexOf("s") === -1) {
                        scale = "ms";
                        time = options.time + scale;
                    } else if (options.time.indexOf("ms") !== -1) {
                        scale = "ms";
                        time = options.time;
                    } else {
                        scale = "s";
                        time = options.time + scale;
                    }
                    if (options.delay) {
                        this.el.style[$.feat.cssPrefix + "TransitionDelay"] = options.delay;
                    }

                    this.el.style[$.feat.cssPrefix + "TransitionDuration"] = time;
                    this.el.style[$.feat.cssPrefix + "TransitionTimingFunction"] = options.timingFunction;
                    this.el.style[$.feat.cssPrefix + "TransformOrigin"] = options.origin;

                }

                //add callback to the stack

                this.callbacksStack.push({
                    complete: options.complete,
                    success: options.success,
                    failure: options.failure
                });
                this.countStack++;

                var that = this,
                    duration;
                var style = window.getComputedStyle(this.el);
                if (classMode) {
                    //get the duration
                    duration = style[$.feat.cssPrefix + "TransitionDuration"];
                    timeNum = numOnly(duration);
                    options.time = timeNum;
                    if (duration.indexOf("ms") !== -1) {
                        scale = "ms";
                    } else {
                        scale = "s";
                        options.time *= 1000;
                    }
                }

                //finish asap
                if (timeNum === 0 || (scale === "ms" && timeNum < 5) || style.display === "none") {
                    //the duration is nearly 0 or the element is not displayed, finish immediatly
                    $.asap($.proxy(this.finishAnimation, this, [false]));
                    //this.finishAnimation();
                    //set transitionend event
                } else {
                    //setup the event normally

                    this.activeEvent = function(event) {
                        clearTimeout(that.timeout);
                        that.finishAnimation(event);
                        that.el.removeEventListener(transitionEnd, that.activeEvent, false);
                    };
                    that.timeout = setTimeout(this.activeEvent, numOnly(options.time) + 50);
                    this.el.addEventListener(transitionEnd, this.activeEvent, false);

                }

            },
            addCallbackHook: function(callback) {
                if (callback) this.callbacksStack.push(callback);
                this.countStack++;
                return this.linkFinishedProxy;
            },
            linkFinished: function(canceled) {
                if (canceled) this.cancel();
                else this.finishAnimation();
            },
            finishAnimation: function(event) {
                if (event && event.preventDefault) event.preventDefault();
                if (!this.isActive) return;

                this.countStack--;

                if (this.countStack === 0) this.fireCallbacks(false);
            },
            fireCallbacks: function(canceled) {
                this.clearEvents();

                //keep callbacks after cleanup
                // (if any of the callbacks overrides this object, callbacks will keep on fire as expected)
                var callbacks = this.callbacksStack;

                //cleanup
                this.cleanup();

                //fire all callbacks
                for (var i = 0; i < callbacks.length; i++) {
                    var complete = callbacks[i].complete;
                    var success = callbacks[i].success;
                    var failure = callbacks[i].failure;
                    //fire callbacks
                    if (typeof(complete) === "function") complete(canceled);
                    //success/failure
                    if (canceled && typeof(failure) === "function") failure();
                    else if (typeof(success) === "function") success();
                }
            },
            cancel: function() {
                if (!this.isActive) return;
                this.fireCallbacks(true); //fire failure callbacks
            },
            cleanup: function() {
                this.callbacksStack = [];
                this.isActive = false;
                this.countStack = 0;
            },
            clearEvents: function() {
                if (this.activeEvent) {
                    this.el.removeEventListener(transitionEnd, this.activeEvent, false);
                }
                this.activeEvent = null;
            },
            link: function(elID, opts) {
                var callbacks = {
                    complete: opts.complete,
                    success: opts.success,
                    failure: opts.failure
                };
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
        };

        return css3Animate;
    })();

    css3Animate.queue = function() {
        return {
            elements: [],
            push: function(el) {
                this.elements.push(el);
            },
            pop: function() {
                return this.elements.pop();
            },
            run: function() {
                var that = this;
                if (this.elements.length === 0) return;
                if (typeof(this.elements[0]) === "function") {
                    var func = this.shift();
                    func();
                }
                if (this.elements.length === 0) return;
                var params = this.shift();
                if (this.elements.length > 0) {
                    params.complete = function(canceled) {
                        if (!canceled) that.run();
                    };
                }
                css3Animate(document.getElementById(params.id), params);
            },
            shift: function() {
                return this.elements.shift();
            }
        };
    };
})(af);


/**
  * @license MIT - https://github.com/darius/requestAnimationFrame/commit/4f27a5a21902a883330da4663bea953b2f96cb15#diff-9879d6db96fd29134fc802214163b95a

    http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
    MIT license

    Adapted from https://gist.github.com/paulirish/1579671 which derived from 
    http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    requestAnimationFrame polyfill by Erik Möller.
    Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon
*/



if (!Date.now)
    Date.now = function() {
        "use strict";
        return new Date().getTime();
    };

(function() {
    "use strict";
    var vendors = ["webkit", "moz","ms"];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+"RequestAnimationFrame"];
        window.cancelAnimationFrame = (window[vp+"CancelAnimationFrame"] || window[vp+"CancelRequestAnimationFrame"]);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());


/**
 * af.animate  - an experimental animation library that uses matrices and requestAnimationFrame
 * Only supports x/y now and is used by the scroller library
 * Copyright 2013 - Intel
 */

(function($) {
    "use strict";
    var cache = [];
    var objId = function(obj) {
        if (!obj.afAnimateId) obj.afAnimateId = $.uuid();
        return obj.afAnimateId;
    };
    var getEl = function(elID) {
        if (typeof elID === "string" || elID instanceof String) {
            return document.getElementById(elID);
        } else if ($.is$(elID)) {
            return elID[0];
        } else {
            return elID;
        }
    };
    var getAnimate = function(obj, options) {
        var tmp, id, el = getEl(obj);
        //first one
        id = objId(el);
        if (cache[id]) {
            if(options)
                cache[id].animate(options);
            tmp = cache[id];
        } else {
            tmp = Animate(el, options);
            cache[id] = tmp;
        }
        return tmp;
    };
    $.fn.animateCss = function(opts) {
        var tmp = getAnimate(this[0], opts);
        return tmp;
    };



    var Animate = function(elID, options) {
        if (!(this instanceof Animate)) return new Animate(elID, options);

        this.el=elID;
        //start doing stuff
        if (!this.el) return;

        if(options)
            this.animate(options);

        var that = this;
        af(this.el).bind("destroy", function() {
            var id = that.el.afAnimateId;
            if (cache[id]) delete cache[id];
        });
    };
    Animate.prototype = {
        animationTimer:null,
        isAnimating:false,
        startX:0,
        startY:0,
        runTime:0,
        endX:0,
        endY:0,
        currX:0,
        currY:0,
        animationStartTime:0,
        pauseTime:0,
        completeCB:null,
        easingFn:"linear",
        animateOpts:{},
        updateCb:null,
        animate: function(options) {
            var that=this;
            if(that.isAnimating) return;
            that.isAnimating=true;
            window.cancelAnimationFrame(that.animationTimer);
            if (!options) {
                options={
                    x:0,
                    y:0,
                    duration:0
                };
            }
            this.easingFn=options.easing||"linear";

            this.completeCB=options.complete||null;
            this.updateCB=options.update||null;
            this.runTime=numOnly(options.duration);
            options.complete&&(delete options.complete);
            this.animateOpts=options;
            this.startTime=Date.now();
            this.startMatrix=$.getCssMatrix(this.el);

            if(this.runTime===0)
                this.doAnimate();
        },
        start:function(){
            this.doAnimate();
        },
        doAnimate:function(){
            var now = Date.now(), nextX, nextY,easeStep,that=this;

            if (this.runTime===0||(now >= this.startTime + this.runTime)) {
                that.setPosition(this.animateOpts.x,this.animateOpts.y);
                that.isAnimating = false;
                if(this.updateCB)
                    this.updateCB({x:this.animateOpts.x,y:this.animateOpts.y});
                if(this.completeCB)
                    this.completeCB();
                return;
            }

            now = (now - this.startTime) / this.runTime;
            now=now>1?1:now;
            easeStep = tweens[this.easingFn](now);
            nextX = (this.animateOpts.x - this.startMatrix.e) * easeStep + this.startMatrix.e;
            nextY = (this.animateOpts.y - this.startMatrix.f) * easeStep + this.startMatrix.f;
            this.setPosition(nextX,nextY);
            if(this.updateCB)
                this.updateCB({x:nextX,y:nextY});

            if (this.isAnimating)
                this.animationTimer = window.requestAnimationFrame(function(){that.doAnimate();});
        },
        setPosition:function(x,y){
            this.el.style[$.feat.cssPrefix+"Transform"]="matrix3d( 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, "+x+", "+y+", 0, 1 )";
            this.currX=x;
            this.currY=y;
        },
        stop:function(){
            this.isAnimating=false;
            window.cancelAnimationFrame(this.animationTimer);
            this.pauseTime=Date.now()-this.startTime;
        },
        resume:function(){
            this.isAnimating=true;
            this.startTime=Date.now()-this.pauseTime;
            this.doAnimate();
        }
    };


    var tweens = {
        linear:function (k) {
            return k;
        },
        easeOutSine:function (k) {
            return Math.sin(k * Math.PI / 2 );
        }
    };
})(af);
