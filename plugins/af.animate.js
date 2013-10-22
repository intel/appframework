// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license
 
// Adapted from https://gist.github.com/paulirish/1579671 which derived from 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    var vendors = ['webkit', 'moz','ms'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
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
    var cache = [];
    var objId = function(obj) {
        if (!obj.afAnimateId) obj.afAnimateId = $.uuid();
        return obj.afAnimateId;
    };
    var getEl = function(elID) {
        if (typeof elID == "string" || elID instanceof String) {
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
    $.fn["animate"] = function(opts) {
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
        af(this.el).bind('destroy', function() {
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
                x:0,y:0,duration:0
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
            
            if(this.runTime==0)
                this.doAnimate();
        },
        start:function(){
            this.doAnimate();
        },
        doAnimate:function(){
            var now = Date.now(), nextX, nextY,easeStep,that=this;
            if(this.updateCB)
                this.updateCB();

            //Complete animation callback

            if (this.runTime===0||(now >= this.startTime + this.runTime)) {
                that.setPosition(this.animateOpts.x,this.animateOpts.y);
                that.isAnimating = false;
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
            if (this.isAnimating) 
                this.animationTimer = window.requestAnimationFrame(function(){that.doAnimate()});
        },
        setPosition:function(x,y,z){                        
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
    }
})(af);