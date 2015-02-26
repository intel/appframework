/**
 * af.animation
 * @copyright Intel 2014 
 * 
 */
/* jshint strict:false*/
(function ($) {

    $.fn.animation = function () {
        var item = this;
        this.each(function () {
            item = new Animator(this);
        });
        return item;
    };

    function Animator(element) {
        this.element = element;
        this.element.classList.remove("animation-reverse");
        this.keepClass = false;
    }

    var animEnd = function (evt) {
        this.element.removeEventListener("webkitAnimationEnd", this.endCBCache, false);
        this.element.removeEventListener("animationend", this.endCBCache, false);
        this.element.removeEventListener("MSAnimationEnd", this.endCBCache, false);
        if (this.endcb)
            this.endcb.call(this.element, evt);
        this.element.classList.remove("animation-reverse");
        this.element.classList.remove("animation-active");
        if (!this.keepClass)
            this.element.classList.remove(this.animClass);
    };
    Animator.prototype = {
        element: null,
        animClass: null,
        runEnd: false,
        keepClass: false,
        keep: function () {
            this.keepClass = true;
            return this;
        },
        remove: function (item) {
            this.element.classList.remove(item);
            this.element.offsetWidth = this.element.offsetWidth;
            return this;
        },
        endCBCache: null,
        run: function (item, duration) {
            this.runEnd = false;
            this.element.classList.add("animation-active");
            //Hack to trigger reflow
            this.element.offsetWidth = this.element.offsetWidth;
            this.element.classList.add(item);
            this.animClass = item;
            //check if it exists..if not trigger end 
            var computedStyle = window.getComputedStyle(this.element, null);
            var time = computedStyle.animation - duration;
            if (!time)
                time = computedStyle.animationDuration;
            if (!time)
                time = computedStyle.MozAnimationDuration;
            if (!time)
                time = computedStyle.webkitAnimationDuration;
            time = parseFloat(time);
            if (time <= 0.01 || isNaN(time))
                this.runEnd = true;

            //Due to calling .bind, we need to cache a reference to the function to remove it
            this.endCBCache = animEnd.bind(this);

            if (this.runEnd) {
                this.endCBCache();
                return this;
            }
            this.element.addEventListener("webkitAnimationEnd", this.endCBCache, false);
            this.element.addEventListener("animationend", this.endCBCache, false);
            this.element.addEventListener("MSAnimationEnd", this.endCBCache, false);
            return this;
        },
        reverse: function () {
            this.element.classList.add("animation-reverse");
            return this;
        },
        reRun: function (item) {
            this.remove(item);
            return this.run(item);
        },
        endcb: function () {},
        end: function (cb) {
            this.endcb = cb;
            return this;
        }
    };


    $.fn.transition = function () {
        var item = this;
        this.each(function () {
            item = new Transition(this);
        });
        return item;
    };

    function Transition(element) {
        this.element = element;
        this.element;
    }

    var transitionEnd = function (evt) {

        clearTimeout(this.timer);
        this.element.removeEventListener("webkitTransitionEnd", this.endCBCache, false);
        this.element.removeEventListener("transitionend", this.endCBCache, false);
        this.element.removeEventListener("MSTransitionEnd", this.endCBCache, false);
        if (this.endcb)
            this.endcb.call(this.element, evt);
        if (!this.keepEnd) {
            $(this.element).vendorCss("TransitionDuration", "");
            $(this.element).vendorCss("Transform", "");
        }

    };
    Transition.prototype = {
        element: null,
        runEnd: false,
        keepEnd: false,
        keep: function () {
            this.keepEnd = true;
            return this;
        },
        endCBCache: null,
        timer: null,
        run: function (trans, duration) {

            this.endCBCache = transitionEnd.bind(this);
            this.element.addEventListener("webkitTransitionEnd", this.endCBCache, false);
            this.element.addEventListener("transitionend", this.endCBCache, false);
            this.element.addEventListener("MSTransitionEnd", this.endCBCache, false);
            //$(this.element).vendorCss("TransitionProperty","all");
            $(this.element).vendorCss("TransitionDuration", duration);
            $(this.element).vendorCss("Transform", trans);
            this.timer = setTimeout(function () {
                this.endCBCache();
            }.bind(this), parseInt(duration,10) + 50);
            return this;
        },
        endcb: function () {},
        end: function (cb) {
            this.endcb = cb;
            return this;
        }
    };
})(jQuery);