/**
 * jq.fx.js
 * FX library for jqMobi
 *
 */ 
 (function ($) {
    var noop = function () {};
    /**
     * Fade out an element by setting the opacity to 0 and hiding it when it's finished
       ```
       $('.tool_tip').fadeOut('300ms');
       ```
     *
     * @param {String} animation time
     * @param {Function} [callback]
     * @title $().fadeOut(time,callback);
     */
    $.fn.fadeOut = function (time, cb, opc) {
        if (this.length == 0) return;
        if (!time) time = 0;
        var that = this;
        var callbackFn = noop;
        if (!cb) cb = noop;
        if (!opc) {
            opc = 0;
            callbackFn = function () {
                this.hide();
            }
        }
        var opts = {
            opacity: opc,
            time: time,
            callback: function () {
                cb.apply(that);
                callbackFn.apply(that);
            }
        }
        this.css3Animate(opts);
        return this;
    };
    /**
     * Fade in an element by setting the opacity to 1.  We will set the display property so it's shown
       ```
       $('.tool_tip').fadeIn('300ms');
       ```
     *
     * @param {String} animation time
     * @param {Function} [callback]
     * @title $().fadeIn(time,callback);
     */
    $.fn.fadeIn = function (time, callback) {

        if (!time) time = "300ms";
        this.show();
        this.css("opacity", '.1');
        var that = this;
        window.setTimeout(function () {
            that.fadeOut(time, callback, 10);
        }, 1);
        return this;
    };
    /**
     * Toggle slide in/out a element based off time.  We handle hiding/showing and keeping the previous height
       ```
       $('.tool_tip').slideToggle('300ms');
       ```
     *
     * @param {String} animation time
     * @param {Function} [callback]
     * @param {String} css3 easing method
     * @title $().slideToggle(time,callback,easing);
     */
    $.fn.slideToggle = function (duration, callback, easing) {
        var opts = {
            time: duration ? duration : "500ms",
            callback: callback ? callback : null,
            easing: easing ? easing : "linear"
        }
        for (var i = 0; i < this.length; i++) {
            var hideshow = this.css("display", null, this[i]);
            var expand = false;
            var elem = $(this[i]);
            if (hideshow == "none") {
                elem.show();
                expand = true;
            }
            var height = this.css("height", null, this[i]);
            if (expand) {
                elem.css("height", "0px");
                opts['height'] = height;
            } else {
                opts['height'] = "0px";
                var oldCB = callback;
                callback = function () {
                    elem.hide();
                    var cbOpts = {
                        height: height,
                        time: "0ms"
                    }
                    elem.css3Animate(cbOpts);
                }
            }
            if (callback) opts['callback'] = callback;
            window.setTimeout(function () {
                elem.css3Animate(opts);
            }, 1);
        }
        return this;
    }
})(jq);