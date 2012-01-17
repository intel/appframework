/**
 * jq.web.css3Animate - css3 animate class for html5 mobile apps
 * @copyright 2011 - AppMobi
 */ (function ($) {
    $.fn["css3Animate"] = function (opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new css3Animate(this[i], opts);
        }
        return this.length == 1 ? tmp : this;
    };

    $["css3AnimateQueue"] = function () {
        return new css3Animate.queue();
    }
    var css3Animate = (function () {

        if (!window.WebKitCSSMatrix) return;
        var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
        var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";

        var css3Animate = function (elID, options) {

                if (typeof elID == "string" || elID instanceof String) {
                    this.el = document.getElementById(elID);
                } else {
                    this.el = elID;
                }
                if (!(this instanceof css3Animate)) {
                    return new css3Animate(elID, options);
                }
                if (!this.el) return;
                var that = this;
                if (!options) {
                    alert("Please provide configuration options for animation of " + elID);
                    return;
                }
                this.el.addEventListener("webkitTransitionEnd", that.finishAnimation, false);

                if (options["callback"]) {
                    this.callback = options["callback"];
                    this.moving = true;
                    this.timeout = window.setTimeout(function () {
                        if (that.moving == true && that.callback && typeof (that.callback == "function")) {
                            that.moving = false;
                            that.callback();
                            delete this.callback;
                        }
                    }, numOnly(options["time"]) + 50);
                } else {
                    //this.callback=function(){}
                    this.moving = false;
                }

                if (options["opacity"]) {
                    this.el.style.opacity = options["opacity"];

                }
                if (!options["y"]) options["y"] = 0;
                if (!options["x"]) options["x"] = 0;
                if (options["previous"]) {
                    options.y += numOnly(new WebKitCSSMatrix(
                    window.getComputedStyle(this.el).webkitTransform).f);
                    options.x += numOnly(new WebKitCSSMatrix(
                    window.getComputedStyle(this.el).webkitTransform).e);
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
                this.el.style.webkitTransition = "all " + options["time"];
                this.el.style.webkitTransitionTimingFunction = options["timingFunction"];
                this.el.style.webkitTransformOrigin = options.origin;


                if (options["width"]) {
                    this.el.style.width = options["width"];
                }
                if (options["height"]) {
                    this.el.style.height = options["height"];
                }
            };


        css3Animate.prototype = {
            finishAnimation: function (event) {
                event.preventDefault();
                var that = this;
                if (!this.moving) return;

                this.moving = false;
                this.el.removeEventListener("webkitTransitionEnd", that.finishAnimation, true);
                if (this.callback && typeof (this.callback == "function")) {
                    if (this.timeout) window.clearTimeout(this.timeout);
                    this.callback();
                    delete this.callback;
                }
            }
        }
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
    if (!window.numOnly) {
        function numOnly(val) {
            if (isNaN(parseFloat(val))) val = val.replace(/[^0-9.-]/, "");

            return parseFloat(val);
        }
    }
})(jq);