/**
 * jq.appframework.js
 * @copyright Intel 2013
 * @author Ian Maffett
 * @description A plugin to allow jQuery developers to use App Framework UI
 */

(function($,window){
    "use strict";
    var nundefined, document = window.document,classCache = {},isWin8=(typeof(MSApp)==="object"),jsonPHandlers = [],_jsonPID = 1;

     function classRE(name) {
            return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }
    $.extend($.fn,{
            /* @param {String} attribute to get
            * @param {String} value to set as
            * @return {Object} an appframework object
            * @title $().css(attribute,[value])
            */
            vendorCss: function (attribute, value, obj) {
                return this.css($.feat.cssPrefix + attribute, value, obj);
            },
            /**
             * Performs a css vendor specific transform:translate operation on the collection.
             *
             ```
                $("#main").cssTranslate('200px,0,0');
             ```
             * @param {String} Transform values
             * @return {Object} an appframework object
             * @title $().vendorCss(value)
             */
            cssTranslate: function (val) {
                return this.vendorCss("Transform", "translate" + $.feat.cssTransformStart + val + $.feat.cssTransformEnd);
            },
            /**
             * Gets the computed style of CSS values
             *
            ```
               $("#main").computedStyle('display');
            ```
             * @param {String} css property
             * @return {Int|String|Float|} css vlaue
             * @title $().computedStyle()
             */
            computedStyle:function(val){
                if(this.length===0||val==nundefined) return;
                return window.getComputedStyle(this[0],'')[val];
            },
            replaceClass: function (name, newName) {
                if(name==nundefined||newName==nundefined) return this;
                for (var i = 0; i < this.length; i++) {
                    if (name ==nundefined) {
                        this[i].className = newName;
                        continue;
                    }
                    var classList = this[i].className;
                    name.split(/\s+/g).concat(newName.split(/\s+/g)).forEach(function (cname) {
                        classList = classList.replace(classRE(cname), " ");
                    });
                    classList = classList.trim();
                    if (classList.length > 0) {
                        this[i].className = (classList + " " + newName).trim();
                    } else
                        this[i].className = newName;
                }
                return this;
            }
    });
    function detectUA($, userAgent) {
            $.os = {};
            $.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
            $.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
            $.os.androidICS = $.os.android && userAgent.match(/(Android)\s4/) ? true : false;
            $.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
            $.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
            $.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
            $.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
            $.os.ios = $.os.ipad || $.os.iphone;
            $.os.playbook = userAgent.match(/PlayBook/) ? true : false;
            $.os.blackberry = $.os.playbook || userAgent.match(/BlackBerry/) ? true : false;
            $.os.blackberry10 = $.os.blackberry && userAgent.match(/Safari\/536/) ? true : false;
            $.os.chrome = userAgent.match(/Chrome/) ? true : false;
            $.os.opera = userAgent.match(/Opera/) ? true : false;
            $.os.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
            $.os.ie = userAgent.match(/MSIE 10.0/i) ? true : false;
            $.os.ieTouch = $.os.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
            $.os.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || 'ontouchstart' in window);
            //features
            $.feat = {};
            var head = document.documentElement.getElementsByTagName("head")[0];
            $.feat.nativeTouchScroll = typeof (head.style["-webkit-overflow-scrolling"]) !== "undefined" && $.os.ios;
            $.feat.cssPrefix = $.os.webkit ? "Webkit" : $.os.fennec ? "Moz" : $.os.ie ? "ms" : $.os.opera ? "O" : "";
            $.feat.cssTransformStart = !$.os.opera ? "3d(" : "(";
            $.feat.cssTransformEnd = !$.os.opera ? ",0)" : ")";
            if ($.os.android && !$.os.webkit)
                $.os.android = false;
        }

        detectUA($, navigator.userAgent);
        $.__detectUA = detectUA; //needed for unit tests

        /**
         * Utility function to create a psuedo GUID
           ```
           var id= $.uuid();
           ```
         * @title $.uuid
         */
        $.uuid = function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        };

        /**
         * Gets the css matrix, or creates a fake one
           ```
           $.getCssMatrix(domElement)
           ```
           @returns matrix with postion
           */
        $.getCssMatrix = function (ele) {
            if($.is$(ele)) ele=ele.get(0);
            if (ele ==nundefined) return window.WebKitCSSMatrix || window.MSCSSMatrix || {
                    a: 0,
                    b: 0,
                    c: 0,
                    d: 0,
                    e: 0,
                    f: 0
            };
            try {
                if (window.WebKitCSSMatrix)
                    return new WebKitCSSMatrix(window.getComputedStyle(ele).webkitTransform);
                else if (window.MSCSSMatrix)
                    return new MSCSSMatrix(window.getComputedStyle(ele).transform);
                else {
                    //fake css matrix
                    var mat = window.getComputedStyle(ele)[$.feat.cssPrefix + 'Transform'].replace(/[^0-9\-.,]/g, '').split(',');
                    return {
                        a: +mat[0],
                        b: +mat[1],
                        c: +mat[2],
                        d: +mat[3],
                        e: +mat[4],
                        f: +mat[5]
                    };
                }
            } catch (e) {
                return {
                    a: 0,
                    b: 0,
                    c: 0,
                    d: 0,
                    e: 0,
                    f: 0
                };
            }
        };

        /**
         * $.create - a faster alertnative to $("<div id='main'>this is some text</div>");
          ```
          $.create("div",{id:'main',innerHTML:'this is some text'});
          $.create("<div id='main'>this is some text</div>");
          ```
          * @param {String} DOM Element type or html
          * @param [{Object}] properties to apply to the element
          * @return {Object} Returns an appframework object
          * @title $.create(type,[params])
          */
        $.create = function (type, props) {
            var elem;
            var f = new $();
            if (props || type[0] !== "<") {
                if (props.html)
                    props.innerHTML = props.html, delete props.html;

                elem = document.createElement(type);
                for (var j in props) {
                    elem[j] = props[j];
                }
                f[f.length++] = elem;
            } else {
                elem = document.createElement("div");
                if(isWin8)
                {
                    MSApp.execUnsafeLocalFunction(function(){
                        elem.innerHTML=selector.trim();
                    });
                }
                else
                    elem.innerHTML = type;
                _shimNodes(elem.childNodes, f);
            }
            return f;
        };
        /**
         * $.query  - a faster alertnative to $("div");
          ```
          $.query(".panel");
          ```
          * @param {String} selector
          * @param {Object} [context]
          * @return {Object} Returns an appframework object
          * @title $.query(selector,[context])
          */
        $.query = function (sel, what) {
			try {
            	return $(sel,what);
			}
			catch(e) {
				return $();
			}
        };

        /* The following are for events on objects */
        /**
         * Bind an event to an object instead of a DOM Node
           ```
           $.bind(this,'event',function(){});
           ```
         * @param {Object} object
         * @param {String} event name
         * @param {Function} function to execute
         * @title $.bind(object,event,function);
         */
        $.bind = function (obj, ev, f) {
            if (!obj.__events) obj.__events = {};
            if (!$.isArray(ev)) ev = [ev];
            for (var i = 0; i < ev.length; i++) {
                if (!obj.__events[ev[i]]) obj.__events[ev[i]] = [];
                obj.__events[ev[i]].push(f);
            }
        };

        /**
         * Trigger an event to an object instead of a DOM Node
           ```
           $.trigger(this,'event',arguments);
           ```
         * @param {Object} object
         * @param {String} event name
         * @param {Array} arguments
         * @title $.trigger(object,event,argments);
         */
        $.trigger = function (obj, ev, args) {
            var ret = true;
            if (!obj.__events) return ret;
            if (!$.isArray(ev)) ev = [ev];
            if (!$.isArray(args)) args = [];
            for (var i = 0; i < ev.length; i++) {
                if (obj.__events[ev[i]]) {
                    var evts = obj.__events[ev[i]];
                    for (var j = 0; j < evts.length; j++)
                        if ($.isFunction(evts[j]) && evts[j].apply(obj, args) === false)
                            ret = false;
                }
            }
            return ret;
        };
        /**
         * Unbind an event to an object instead of a DOM Node
           ```
           $.unbind(this,'event',function(){});
           ```
         * @param {Object} object
         * @param {String} event name
         * @param {Function} function to execute
         * @title $.unbind(object,event,function);
         */
        $.unbind = function (obj, ev, f) {
            if (!obj.__events) return;
            if (!$.isArray(ev)) ev = [ev];
            for (var i = 0; i < ev.length; i++) {
                if (obj.__events[ev[i]]) {
                    var evts = obj.__events[ev[i]];
                    for (var j = 0; j < evts.length; j++) {
                        if (f ==nundefined)
                            delete evts[j];
                        if (evts[j] == f) {
                            evts.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        };
        $.cleanUpContent = function(){}

        $.isObject = function (obj) {
            return typeof obj === "object";
        };

        $.asap = function (fn, context, args) {
            if (!$.isFunction(fn)) throw "$.asap - argument is not a valid function";
            setTimeout(function(){
                fn.apply(context,args);
            });
        };

        /**
         * this function executes javascript in HTML.
           ```
           $.parseJS(content)
           ```
        * @param {String|DOM} content
        * @title $.parseJS(content);
        */
        var remoteJSPages = {};
        $.parseJS = function (div) {
            if (!div)
                return;
            if (typeof (div) == "string") {
                var elem = document.createElement("div");
                if(isWin8){
                    MSApp.execUnsafeLocalFunction(function(){
                        elem.innerHTML = div;
                    });
                }
                else
                    elem.innerHTML = div;

                div = elem;
            }
            var scripts = div.getElementsByTagName("script");
            div = null;
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.length > 0 && !remoteJSPages[scripts[i].src]&&!isWin8) {
                    var doc = document.createElement("script");
                    doc.type = scripts[i].type;
                    doc.src = scripts[i].src;
                    document.getElementsByTagName('head')[0].appendChild(doc);
                    remoteJSPages[scripts[i].src] = 1;
                    doc = null;
                } else {
                    window['eval'](scripts[i].innerHTML);
                }
            }
        };

        $.is$ = function (obj) {
            return obj instanceof $;
        };
         $.jsonP = function (options) {
            if(isWin8){
                options.type="get";
                options.dataType=null;
                return $.get(options);
            }
            var callbackName = 'jsonp_callback' + (++_jsonPID);
            var abortTimeout = "",
                context;
            var script = document.createElement("script");
            var abort = function () {
                $(script).remove();
                if (window[callbackName])
                    window[callbackName] = empty;
            };
            window[callbackName] = function (data) {
                clearTimeout(abortTimeout);
                $(script).remove();
                delete window[callbackName];
                options.success.call(context, data);
            };
            script.src = options.url.replace(/=\?/, '=' + callbackName);
            if (options.error) {
                script.onerror = function () {
                    clearTimeout(abortTimeout);
                    options.error.call(context, "", 'error');
                };
            }
            $('head').append(script);
            if (options.timeout > 0)
                abortTimeout = setTimeout(function () {
                    options.error.call(context, "", 'timeout');
                }, options.timeout);
            return {};
        };


        window.$afm=$;


        if (!window.numOnly) {
        window.numOnly = function numOnly(val) {
            if (val ===undefined || val === '') return 0;
            if (isNaN(parseFloat(val))) {
                if (val.replace) {
                    val = val.replace(/[^0-9.-]/g, "");
                } else return 0;
            }
            return parseFloat(val);
        };
    }

})(jQuery,window);

window.af=window.jq=jQuery;