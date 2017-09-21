/**
 * af.shim.js
 * @copyright Intel 2014
 * @author Ian Maffett
 * @description jQuery helper functions for App Framework
 */
/* jshint eqeqeq:false */
(function($,window){
    "use strict";
    jQuery.event.props.push("touches");
    jQuery.event.props.push("originalTouches");
    jQuery.event.props.push("changedTouches");
    var nundefined, document = window.document,classCache = {},isWin8=(typeof(MSApp)==="object");

    function classRE(name) {
        return name in classCache ? classCache[name] : (classCache[name] = new RegExp("(^|\\s)" + name + "(\\s|$)"));
    }
    function _shimNodes(nodes, obj) {
        if (!nodes)
            return;
        if (nodes.nodeType) {
            obj[obj.length++] = nodes;
            return;
        }
        for (var i = 0, iz = nodes.length; i < iz; i++)
            obj[obj.length++] = nodes[i];
    }
    $.extend($.fn,{
        /**
         * Get/Set vendor specific CSS
         * Also set the vendor neutral version
         * @param {String} attribute to get
         * @param {String} value to set as
         * @return {Object} an appframework object
         * @title $().css(attribute,[value])
        */
        vendorCss: function (attribute, value, obj) {
            this.css(attribute.toLowerCase(),value,obj);
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
            this.vendorCss("Transform", "translate" + $.feat.cssTransformStart + val + $.feat.cssTransformEnd);
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
            return window.getComputedStyle(this[0],"")[val];
        },
        replaceClass: function(name, newName) {
            if (name == nundefined || newName == nundefined) return this;
            var replaceClassFn=function(cname) {
                classList = classList.replace(classRE(cname), " ");
            };
            for (var i = 0; i < this.length; i++) {
                var classList = this[i].className;

                name.split(/\s+/g).concat(newName.split(/\s+/g)).forEach(replaceClassFn);
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
        $.os.ios7 = ($.os.ipad||$.os.iphone);
        $.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
        $.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
        $.os.ios = $.os.ipad || $.os.iphone;
        $.os.playbook = userAgent.match(/PlayBook/) ? true : false;
        $.os.blackberry10 = userAgent.match(/BB10/) ? true : false;
        $.os.blackberry = $.os.playbook || $.os.blackberry10|| userAgent.match(/BlackBerry/) ? true : false;
        $.os.chrome = userAgent.match(/Chrome/) ? true : false;
        $.os.opera = userAgent.match(/Opera/) ? true : false;
        $.os.fennec = userAgent.match(/fennec/i) ? true : userAgent.match(/Firefox/) ? true : false;
        $.os.ie = userAgent.match(/MSIE 10.0/i)||userAgent.match(/Trident\/7/i) ? true : false;
        $.os.ieTouch = $.os.ie && userAgent.toLowerCase().match(/touch/i) ? true : false;
        $.os.tizen = userAgent.match(/Tizen/i)?true:false;
        $.os.supportsTouch = ((window.DocumentTouch && document instanceof window.DocumentTouch) || "ontouchstart" in window);
        $.os.kindle=userAgent.match(/Silk-Accelerated/)?true:false;
        //features
        $.feat = {};

        $.feat.cssTransformStart = !$.os.opera ? "3d(" : "(";
        $.feat.cssTransformEnd = !$.os.opera ? ",0)" : ")";
        if ($.os.android && !$.os.webkit)
            $.os.android = false;


        //IE tries to be webkit
        if(userAgent.match(/IEMobile/i)){
            $.each($.os,function(ind){
                $.os[ind]=false;
            });
            $.os.ie=true;
            $.os.ieTouch=true;
        }
        var items=["Webkit","Moz","ms","O"];
        for(var j=0;j<items.length;j++){
            if(document.documentElement.style[items[j]+"Transform"]==="")
                $.feat.cssPrefix=items[j];
        }

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
    $.getCssMatrix = function(ele) {
        if ($.is$(ele)) ele = ele.get(0);

        var MatrixFN = window.WebKitCSSMatrix || window.MSCSSMatrix;

        if (ele === nundefined) {
            if (MatrixFN) {
                return new MatrixFN();
            }
            else {
                return {
                    a: 0,
                    b: 0,
                    c: 0,
                    d: 0,
                    e: 0,
                    f: 0
                };
            }
        }

        var computedStyle = window.getComputedStyle(ele);

        var transform = computedStyle.webkitTransform ||
                        computedStyle.transform ||
                        computedStyle[$.feat.cssPrefix + "Transform"];

        if (MatrixFN)
            return new MatrixFN(transform);
        else if (transform) {
            //fake css matrix
            var mat = transform.replace(/[^0-9\-.,]/g, "").split(",");
            return {
                a: +mat[0],
                b: +mat[1],
                c: +mat[2],
                d: +mat[3],
                e: +mat[4],
                f: +mat[5]
            };
        }
        else {
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
    $.create = function(type, props) {
        var elem;
        var f = new $();
        if (props || type[0] !== "<") {
            if (props.html){
                props.innerHTML = props.html;
                delete props.html;
            }

            elem = document.createElement(type);
            for (var j in props) {
                elem[j] = props[j];
            }
            f[f.length++] = elem;
        } else {
            elem = document.createElement("div");
            if (isWin8) {
                MSApp.execUnsafeLocalFunction(function() {
                    elem.innerHTML = type.trim();
                });
            } else
                elem.innerHTML = type;
            _shimNodes(elem.childNodes, f);
        }
        return f;
    };
    /**
     * $.query  - a no longer faster alertnative to $("div") (App Framework was faster)
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

    $.isObject = function (obj) {
        return typeof obj === "object";
    };


    $.is$ = function (obj) {
        return obj instanceof $;
    };
    //Shim to put touch events on the jQuery special event

    window.$afm=$;

    $.feat.TouchList=function(){
        this.length=0;
    };

    $.feat.TouchList.prototype = {
        item:function(ind){
            return this[ind];
        },
        _add:function(touch){
            this[this.length]=touch;
            this.length++;
        }
    };
    var identifier=1000;
    $.feat.Touch = function() {
        this.identifier=identifier++;
    };

    $.feat.Touch.prototype = {
        "clientX":0,
        "clientY":0,
        "screenX":0,
        "screenY":0,
        "pageX":0,
        "pageY":0,
        "identifier":0
    };

})(jQuery,window);

window.af=window.jq=jQuery;
