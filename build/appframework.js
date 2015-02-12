/*! intel-appframework - v2.2.0 - 2015-02-12 */

/**
 * App Framework  query selector class for HTML5 mobile apps on a WebkitBrowser.
 * Since most mobile devices (Android, iOS, webOS) use a WebKit browser, you only need to target one browser.
 * We are able to increase the speed greatly by removing support for legacy desktop browsers and taking advantage of browser features, like native JSON parsing and querySelectorAll


 * MIT License
 * @author Intel
 * @copyright Intel
 * @api private
 */
 /* jshint eqeqeq:false */
  /* global af: false */

if (!window.af || typeof(af) !== "function") {

    /**
     *  This is our master af object that everything is built upon.
     * $ is a pointer to this object
     * @title appframework
     * @param {Window} window The global window object
     * @api private
     */
    var af = (function(window) {
        "use strict";
        var nundefined,
            document = window.document,
            emptyArray = [],
            slice = emptyArray.slice,
            classCache = {},
            _jsonPID = 1,
            fragmentRE = /<(\w+)[^>]*>/,
            _attrCache = {},
            _propCache = {},
            /**
             * CSS Properties that can be expressed as a number (w/o 'px')
             * @type {Object}
             */
            cssNumber = {
                "columncount": true,
                "fontweight": true,
                "lineheight": true,
                "column-count": true,
                "font-weight": true,
                "line-height": true,
                "opacity": true,
                "orphans": true,
                "widows": true,
                "zIndex": true,
                "z-index": true,
                "zoom": true
            },
            isWin8 = (typeof(MSApp) === "object");

        /**
         * internal function used for $().css - checks to see if it is a number and the css property
         * needs "px" added to it
         * @param {string} prop
         * @param {string|number} val
         * @return {boolean}
         * @api private
         */
        function _addPx(prop, val) {
            return (typeof(val) === "number") && !cssNumber[prop.toLowerCase()] ? val + "px" : val;
        }

        /**
         * internal function to use domfragments for insertion
         *
         * @param {$afm} afm An appframework object
         * @param {Element} container
         * @param {boolean=} insert Default: false (append)
         * @api private
         */
        function _insertFragments(afm, container, insert) {
            var frag = document.createDocumentFragment();
            if (insert) {
                for (var j = afm.length - 1; j >= 0; j--) {
                    frag.insertBefore(afm[j], frag.firstChild);
                }
                container.insertBefore(frag, container.firstChild);

            } else {

                for (var k = 0; k < afm.length; k++)
                    frag.appendChild(afm[k]);
                container.appendChild(frag);
            }
            frag = null;
        }

        /**
         * Internal function to test if a class name fits in a regular expression
         * @param {String} name to search against
         * @return {Boolean}
         * @api private
         */
        function classRE(name) {
            return name in classCache ? classCache[name] : (classCache[name] = new RegExp("(^|\\s)" + name + "(\\s|$)"));
        }

        /**
         * Internal function that returns a array of unique elements
         * @param {Array} arr array to compare against
         * @return {Array} array of unique elements
         * @api private
         */
        function unique(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr.indexOf(arr[i]) !== i) {
                    arr.splice(i, 1);
                    i--;
                }
            }
            return arr;
        }

        /**
         * Given a set of nodes, it returns them as an array.  Used to find
         * siblings of an element
         * @param {Nodelist} nodes Node list to search
         * @param {Object=} element [optional] objects to find siblings off of
         * @return {Array} array of siblings
         * @api private
         */
        function siblings(nodes, element) {
            var elems = [];
            if (nodes == nundefined)
                return elems;

            for (; nodes; nodes = nodes.nextSibling) {
                if (nodes.nodeType === 1 && nodes !== element) {
                    elems.push(nodes);
                }
            }
            return elems;
        }

        /**
         * This is the internal appframework object that gets extended and added on to it
         * This is also the start of our query selector engine
         * @param {String|Element|Object|Array} toSelect selector
         * @param {String|Element|Object|undefined} what Context
         * @typedef {Object} $afm
         * @api private
         */
        var $afm = function(toSelect, what) {
            this.length = 0;
            if (!toSelect) {
                return this;
            } else if (toSelect instanceof $afm && what == nundefined) {
                return toSelect;
            } else if (af.isFunction(toSelect)) {
                return af(document).ready(toSelect);
            } else if (af.isArray(toSelect) && toSelect.length != nundefined) { //Passing in an array or object
                for (var i = 0; i < toSelect.length; i++)
                    this[this.length++] = toSelect[i];
                return this;
            } else if (af.isObject(toSelect) && af.isObject(what)) { //var tmp=$("span");  $("p").find(tmp);
                if (toSelect.length == nundefined) {
                    if (toSelect.parentNode == what)
                        this[this.length++] = toSelect;
                } else {
                    for (var j = 0; j < toSelect.length; j++)
                        if (toSelect[j].parentNode == what)
                            this[this.length++] = toSelect[j];
                }
                return this;
            } else if (af.isObject(toSelect) && what == nundefined) { //Single object
                this[this.length++] = toSelect;
                return this;
            } else if (what !== nundefined) {
                if (what instanceof $afm) {
                    return what.find(toSelect);
                }

            } else {
                what = document;
            }

            return this.selector(toSelect, what);

        };

        /**
         * This calls the $afm function
         * @title $()
         * @param {(string|Element|Object)=} selector
         * @param {(string|Element|Object)=} what Context
         * @return {$afm} an appframework object
         */
        var $ = function(selector, what) {
            return new $afm(selector, what);
        };

        /**
         * this is the engine for "all" and is only exposed internally
         * @param {string|Element|Object|Array} selector
         * @param {string|Element|Object|undefined} what Context
         * @return {$afm} an appframework object
         * @api private
         */
        function _selectorAll(selector, what) {
            try {
                return what.querySelectorAll(selector);

            } catch (e) {
                return [];
            }
        }

        /**
         * this is the query selector engine for elements
         * @param {String} selector
         * @param {String|Element|Object|undefined} what [optional] Context
         * @api private
         */
        function _selector(selector, what) {
            /*jshint validthis:true*/

            selector = selector.trim();

            if (selector[0] === "#" && selector.indexOf(".") === -1 &&selector.indexOf(",") === -1 && selector.indexOf(" ") === -1 && selector.indexOf(">") === -1) {
                if (what === document)
                    _shimNodes(what.getElementById(selector.replace("#", "")), this);
                else
                    _shimNodes(_selectorAll(selector, what), this);
            } else if ((selector[0] === "<" && selector[selector.length - 1] === ">") || (selector.indexOf("<") !== -1 && selector.indexOf(">") !== -1)) //html

            {
                var tmp = document.createElement("div");
                if (isWin8) {
                    MSApp.execUnsafeLocalFunction(function() {
                        tmp.innerHTML = selector.trim();
                    });
                } else
                    tmp.innerHTML = selector.trim();
                _shimNodes(tmp.childNodes, this);
            } else {
                _shimNodes((_selectorAll(selector, what)), this);
            }
            return this;
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

        /**
        * Checks to see if the parameter is a $afm object
            ```
            var foo=$("#header");
            $.is$(foo);
            ```
        * @param {*} obj
        * @return {boolean}
        * @title $.is$(param)
        */
        $.is$ = function(obj) {
            return (obj instanceof $afm);
        };

        /**
        * Map takes in elements and executes a callback function on each and returns a collection
        ```
        $.map([1,2],function(ind){return ind+1});
        ```
        * @param {Array|Object} elements
        * @param {Function} callback
        * @return {array} array with elements
        * @title $.map(elements,callback)
        */
        $.map = function(elements, callback) {
            var value, values = [],
                i, key;
            if ($.isArray(elements)){

                for (i = 0; i < elements.length; i++) {
                    value = callback.apply(elements[i],[elements[i],i]);
                    if (value !== nundefined)
                        values.push(value);
                }
            } else if ($.isObject(elements)){
                for (key in elements) {
                    if (!elements.hasOwnProperty(key) || key === "length")
                        continue;
                    value = callback(elements[key],[elements[key],key]);
                    if (value !== nundefined)
                        values.push(value);
                }
            }
            return values;
        };

        /**
        * Iterates through elements and executes a callback.  Returns if false
        ```
        $.each([1,2],function(ind){console.log(ind);});
        ```
        * @param {Array|Object} elements
        * @param {Function} callback
        * @return {Array} elements
        * @title $.each(elements,callback)
        */
        $.each = function(elements, callback) {
            var i, key;
            if ($.isArray(elements)){
                for (i = 0; i < elements.length; i++) {
                    if (callback(i, elements[i]) === false)
                        return elements;
                }
            } else if ($.isObject(elements)){
                for (key in elements) {
                    if (!elements.hasOwnProperty(key) || key === "length")
                        continue;
                    if (callback(key, elements[key]) === false)
                        return elements;
                }
            }
            return elements;
        };

        /**
        * Extends an object with additional arguments
            ```
            $.extend({foo:"bar"});
            $.extend(element,{foo:"bar"});
            ```
        * @param {Object} [target] element
        * @param any number of additional arguments
        * @return {Object} [target]
        * @title $.extend(target,{params})
        */
        $.extend = function(target) {
            if (target == nundefined)
                target = this;
            if (arguments.length === 1) {
                for (var key in target)
                    this[key] = target[key];
                return this;
            } else {
                slice.call(arguments, 1).forEach(function(source) {
                    for (var key in source)
                        target[key] = source[key];
                });
            }
            return target;
        };

        /**
        * Checks to see if the parameter is an array
            ```
            var arr=[];
            $.isArray(arr);
            ```
        * @param {*} obj
        * @return {boolean}
        * @example $.isArray([1]);
        * @title $.isArray(param)
        */
        $.isArray = function(obj) {
            return obj instanceof Array && obj.push != nundefined; //ios 3.1.3 doesn"t have Array.isArray
        };

        /**
        * Checks to see if the parameter is a function
            ```
            var func=function(){};
            $.isFunction(func);
            ```

        * @param {*} obj
        * @return {boolean}
        * @title $.isFunction(param)
        */
        $.isFunction = function(obj) {
            return typeof obj === "function" && !(obj instanceof RegExp);
        };
        /**
        * Checks to see if the parameter is a object
            ```
            var foo={bar:"bar"};
            $.isObject(foo);
            ```
        * @param {*} obj
        * @return {boolean}
        * @title $.isObject(param)
        */
        $.isObject = function(obj) {
            return typeof obj === "object" && obj !== null;
        };

        /**
         * Prototype for afm object.  Also extends $.fn
         */
        $.fn = $afm.prototype = {
            namespace: "appframework",
            constructor: $afm,
            forEach: emptyArray.forEach,
            reduce: emptyArray.reduce,
            push: emptyArray.push,
            indexOf: emptyArray.indexOf,
            concat: emptyArray.concat,
            selector: _selector,
            oldElement: undefined,
            sort: emptyArray.sort,
            slice: emptyArray.slice,
            length: 0,
            /**
             * This is a utility function for .end()
             * @param {Object} params
             * @return {Object} an appframework with params.oldElement set to this
             * @api private
             */
            setupOld: function(params) {
                if (params == nundefined)
                    return $();
                params.oldElement = this;
                return params;

            },
            /**
            * This is a wrapper to $.map on the selected elements
                ```
                $().map(function(){this.value+=ind});
                ```
            * @param {Function} fn callback
            * @return {$afm} an appframework object
            * @title $().map(function)
            */
            map: function(fn) {
                var value, values = [],
                    i;
                for (i = 0; i < this.length; i++) {
                    value = fn.apply(this[i],[i,this[i]]);
                    if (value !== nundefined)
                        values.push(value);
                }
                return $(values);
            },
            /**
            * Iterates through all elements and applys a callback function
                ```
                $().each(function(){console.log(this.value)});
                ```
            * @param {Function} callback
            * @return {Object} an appframework object
            * @title $().each(function)
            */
            each: function(callback) {
                this.forEach(function(el, idx) {
                    callback.call(el, idx, el);
                });
                return this;
            },
            /**
            * This is executed when DOMContentLoaded happens, or after if you"ve registered for it.
                ```
                $(document).ready(function(){console.log("I'm ready");});
                ```
            * @param {Function} callback
            * @return {Object} an appframework object
            * @title $().ready(function)
            */

            ready: function(callback) {
                if (document.readyState === "complete" || document.readyState === "loaded" || (!$.os.ie && document.readyState === "interactive")) //IE10 fires interactive too early
                    callback();
                else
                    document.addEventListener("DOMContentLoaded", callback, false);
                return this;
            },

            /**
            * Searches through the collection and reduces them to elements that match the selector
                ```
                $("#foo").find(".bar");
                $("#foo").find($(".bar"));
                $("#foo").find($(".bar").get(0));
                ```
            * @param {String|Object|Array} sel Selector
            * @return {Object} an appframework object filtered
            *
            * @title $().find(selector)
            */
            find: function(sel) {
                if (this.length === 0)
                    return this;
                var elems = [];
                var tmpElems;
                for (var i = 0; i < this.length; i++) {
                    tmpElems = ($(sel, this[i]));

                    for (var j = 0; j < tmpElems.length; j++) {
                        elems.push(tmpElems[j]);
                    }
                }
                return $(unique(elems));
            },

            /**
            * Gets or sets the innerHTML for the collection.
            * If used as a get, the first elements innerHTML is returned
                ```
                $("#foo").html(); //gets the first elements html
                $("#foo").html("new html");//sets the html
                $("#foo").html("new html",false); //Do not do memory management cleanup
                ```
            * @param {String} html to set
            * @param {Bool} [cleanup] - set to false for performance tests and if you do not want to execute memory management cleanup
            * @return {$afm} an appframework object
            * @title $().html([html])
            */
            html: function(html, cleanup) {
                var msFix=function(){
                    item.innerHTML=html;
                };
                if (this.length === 0)
                    return this;
                if (html === nundefined)
                    return this[0].innerHTML;

                for (var i = 0; i < this.length; i++) {
                    if (cleanup !== false)
                        $.cleanUpContent(this[i], false, true);
                    if (isWin8) {
                        var item=this[i];
                        MSApp.execUnsafeLocalFunction(msFix);
                    } else
                        this[i].innerHTML = html;
                }
                return this;
            },

            /**
            * Gets or sets the innerText for the collection.
            * If used as a get, the first elements innerText is returned
                ```
                $("#foo").text(); //gets the first elements text;
                $("#foo").text("new text"); //sets the text
                ```
            * @param {String} text to set
            * @return {$afm} an appframework object
            * @title $().text([text])
            */
            text: function(text) {
                if (this.length === 0)
                    return this;
                if (text === nundefined)
                    return this[0].textContent;
                for (var i = 0; i < this.length; i++) {
                    this[i].textContent = text;
                }
                return this;
            },
            /**
            * Gets or sets a css property for the collection
            * If used as a get, the first elements css property is returned
            * This will add px to properties that need it.
                ```
                $().css("background"); // Gets the first elements background
                $().css("background","red")  //Sets the elements background to red
                ```
            * @param {String} attribute The attribute to get
            * @param {String} value Value to set as
            * @param {Element=} obj
            * @return {Object} obj An appframework object
            * @title $().css(attribute,[value])
            */
            css: function(attribute, value, obj) {
                var toAct = obj != nundefined ? obj : this[0];
                if (this.length === 0)
                    return this;
                if (value == nundefined && typeof(attribute) === "string") {
                    return toAct.style[attribute] ? toAct.style[attribute] : window.getComputedStyle(toAct)[attribute];
                }
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(attribute)) {
                        for (var j in attribute) {
                            this[i].style[j] = _addPx(j, attribute[j]);
                        }
                    } else {
                        this[i].style[attribute] = _addPx(attribute, value);
                    }
                }
                return this;
            },

            /**
            * Gets or sets css vendor specific css properties
            * If used as a get, the first elements css property is returned
                ```
                $().vendorCss("transform"); // Gets the first elements background
                $().vendorCss("transform","Translate3d(0,40,0)")  //Sets the elements background to red
                ```
            * @param {string} attribute The attribute to get
            * @param {string} value Value to set as
            * @param {Element} obj Value to set as
            * @return {$afm} An appframework object
            * @title $().vendorCss(attribute,[value])
            */
            vendorCss: function(attribute, value, obj) {
                return this.css($.feat.cssPrefix + attribute, value, obj);
            },

            /**
             * Performs a css vendor specific transform:translate operation on the collection.
                ```
                $("#main").cssTranslate("200px,0,0");
                ```
             * @param {string} val Transform values
             * @return {Object} an appframework object
             * @title $().cssTranslate(value)
             */
            cssTranslate: function(val) {
                return this.vendorCss("Transform", "translate" + $.feat.cssTransformStart + val + $.feat.cssTransformEnd);
            },

            /**
             * Gets the computed style of CSS values
                ```
               $("#main").computedStyle("display");
                ```
             * @param {String} val CSS property
             * @return {number|string} CSS value
             * @title $().computedStyle()
             */
            computedStyle: function(val) {
                if (this.length === 0 || val == nundefined) return;
                return window.getComputedStyle(this[0], "")[val];
            },

            /**
            * Sets the innerHTML of all elements to an empty string
                ```
                $().empty();
                ```
            * @return {Object} an appframework object
            * @title $().empty()
            */
            empty: function() {
                for (var i = 0; i < this.length; i++) {
                    $.cleanUpContent(this[i], false, true);
                    this[i].textContent = "";
                }
                return this;
            },

            /**
            * Sets the elements display property to "none".
            * This will also store the old property into an attribute for hide
                ```
                $().hide();
                ```
            * @return {Object} an appframework object
            * @title $().hide()
            */
            hide: function() {
                if (this.length === 0)
                    return this;
                for (var i = 0; i < this.length; i++) {
                    if (this.css("display", null, this[i]) !== "none") {
                        this[i].setAttribute("afmOldStyle", this.css("display", null, this[i]));
                        this[i].style.display = "none";
                    }
                }
                return this;
            },

            /**
            * Shows all the elements by setting the css display property
            * We look to see if we were retaining an old style (like table-cell) and restore that, otherwise we set it to block
                ```
                $().show();
                ```
            * @return {Object} an appframework object
            * @title $().show()
            */
            show: function() {
                if (this.length === 0)
                    return this;
                for (var i = 0; i < this.length; i++) {
                    if (this.css("display", null, this[i]) === "none") {
                        this[i].style.display = this[i].getAttribute("afmOldStyle") ? this[i].getAttribute("afmOldStyle") : "block";
                        this[i].removeAttribute("afmOldStyle");
                    }
                }
                return this;
            },

            /**
            * Toggle the visibility of a div
                ```
                $().toggle();
                $().toggle(true); //force showing
                ```
            * @param {Boolean} [show] -force the hiding or showing of the element
            * @return {Object} an appframework object
            * @title $().toggle([show])
            */
            toggle: function(show) {
                if(this.length === 0)
                    return this;
                var show2 = show===true;
                for (var i = 0; i < this.length; i++) {
                    if (this.css("display", null, this[i]) !== "none" && (show == nundefined || show2 === false)) {
                        this[i].setAttribute("afmOldStyle", this.css("display", null, this[i]));
                        this[i].style.display = "none";
                    } else if (this.css("display", null, this[i]) === "none" && (show == nundefined || show2 === true)) {
                        this[i].style.display = this[i].getAttribute("afmOldStyle") ? this[i].getAttribute("afmOldStyle") : "block";
                        this[i].removeAttribute("afmOldStyle");
                    }
                }
                return this;
            },

            /**
            * Gets or sets an elements value
            * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
                ```
                $().value; //Gets the first elements value;
                $().value="bar"; //Sets all elements value to bar
                ```
            * @param {string=} value [optional] Value to set
            * @return {String|$afm} A string as a getter, appframework object as a setter
            * @title $().val([value])
            */
            val: function(value) {
                if (this.length === 0)
                    return (value === nundefined) ? undefined : this;
                if (value == nundefined)
                    return this[0].value;
                for (var i = 0; i < this.length; i++) {
                    this[i].value = value;
                }
                return this;
            },

            /**
            * Gets or sets an attribute on an element
            * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
                ```
                $().attr("foo"); //Gets the first elements "foo" attribute
                $().attr("foo","bar");//Sets the elements "foo" attribute to "bar"
                $().attr("foo",{bar:"bar"}) //Adds the object to an internal cache
                ```
            * @param {string|Object} attr Attribute to act upon.  If it is an object (hashmap), it will set the attributes based off the kvp.
            * @param {string|Array|Object|function|undefined} value [optional] Value to set
            * @return {string|Object|Array|Function} If used as a getter, return the attribute value.  If a setter, return an appframework object
            * @title $().attr(attribute,[value])
            */
            attr: function(attr, value) {
                if (this.length === 0)
                    return (value === nundefined) ? undefined : this;
                if (value === nundefined && !$.isObject(attr)) {
                    var val = (this[0].afmCacheId && _attrCache[this[0].afmCacheId] && _attrCache[this[0].afmCacheId][attr]) ? _attrCache[this[0].afmCacheId][attr] : this[0].getAttribute(attr);
                    return val;
                }
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(attr)) {
                        for (var key in attr) {
                            $(this[i]).attr(key, attr[key]);
                        }
                    } else if ($.isArray(value) || $.isObject(value) || $.isFunction(value)) {

                        if (!this[i].afmCacheId)
                            this[i].afmCacheId = $.uuid();

                        if (!_attrCache[this[i].afmCacheId])
                            _attrCache[this[i].afmCacheId] = {};
                        _attrCache[this[i].afmCacheId][attr] = value;
                    } else if (value === null) {
                        this[i].removeAttribute(attr);
                        if (this[i].afmCacheId && _attrCache[this[i].afmCacheId][attr])
                            delete _attrCache[this[i].afmCacheId][attr];
                    } else {
                        this[i].setAttribute(attr, value);
                        if (this[i].afmCacheId && _attrCache[this[i].afmCacheId][attr])
                            delete _attrCache[this[i].afmCacheId][attr];
                    }
                }
                return this;
            },

            /**
            * Removes one or several attribute on the elements
                ```
                $().removeAttr("foo");
                ```
            * @param {string} attr Attributes that can be space delimited
            * @return {Object} appframework object
            * @title $().removeAttr(attribute)
            */
            removeAttr: function(attr) {
                var removeFixer=function(param) {
                    that[i].removeAttribute(param);
                    if (that[i].afmCacheId && _attrCache[that[i].afmCacheId])
                        delete _attrCache[that[i].afmCacheId][attr];
                };
                var that = this;
                for (var i = 0; i < this.length; i++) {
                    attr.split(/\s+/g).forEach(removeFixer);
                }
                return this;
            },

            /**
            * Gets or sets a property on an element
            * If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
                ```
                $().prop("foo"); //Gets the first elements "foo" property
                $().prop("foo","bar");//Sets the elements "foo" property to "bar"
                $().prop("foo",{bar:"bar"}) //Adds the object to an internal cache
                ```
            * @param {string|Object} prop The property to act upon.  If it is an object (hashmap), it will set the attributes based off the kvp.
            * @param {string|Array|Object|function} [value] to set
            * @return {string|Object|Array|Function} If used as a getter, return the property value.  If a setter, return an appframework object
            * @title $().prop(property,[value])
            */
            prop: function(prop, value) {
                if (this.length === 0)
                    return (value === nundefined) ? undefined : this;
                if (value === nundefined && !$.isObject(prop)) {
                    var res;
                    var val = (this[0].afmCacheId && _propCache[this[0].afmCacheId] && _propCache[this[0].afmCacheId][prop]) ? _propCache[this[0].afmCacheId][prop] : !(res = this[0][prop]) && prop in this[0] ? this[0][prop] : res;
                    return val;
                }
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(prop)) {
                        for (var key in prop) {
                            $(this[i]).prop(key, prop[key]);
                        }
                    } else if ($.isArray(value) || $.isObject(value) || $.isFunction(value)) {
                        if (!this[i].afmCacheId)
                            this[i].afmCacheId = $.uuid();

                        if (!_propCache[this[i].afmCacheId])
                            _propCache[this[i].afmCacheId] = {};
                        _propCache[this[i].afmCacheId][prop] = value;
                    } else if (value === null && value !== undefined) {
                        $(this[i]).removeProp(prop);
                    } else {
                        $(this[i]).removeProp(prop);
                        this[i][prop] = value;
                    }
                }
                return this;
            },

            /**
            * Removes one or several properties on the elements
                ```
                $().removeProp("foo");
                ```
            * @param {string} prop Properties that can be space delimited
            * @return {$afm} appframework object
            * @title $().removeProp(attribute)
            */
            removeProp: function(prop) {
                var removePropFn=function(param) {
                    try {
                        if (that[i][param]) {
                            that[i][param] = undefined;
                        }
                    } catch(e) {}

                    if (that[i].afmCacheId && _propCache[that[i].afmCacheId]) {
                        delete _propCache[that[i].afmCacheId][prop];
                    }
                };
                var that = this;
                for (var i = 0; i < this.length; i++) {
                    prop.split(/\s+/g).forEach(removePropFn);
                }
                return this;
            },

            /**
            * Removes elements based off a selector
                ```
                    $().remove();  //Remove all
                    $().remove(".foo");//Remove off a string selector
                    var element=$("#foo").get(0);
                    $().remove(element); //Remove by an element
                    $().remove($(".foo"));  //Remove by a collection
                ```
            * @param {String|Object|Array} selector to filter against
            * @return {Object} appframework object
            * @title $().remove(selector)
            */
            remove: function(selector) {
                var elems = $(this).filter(selector);
                if (elems == nundefined)
                    return this;
                for (var i = 0; i < elems.length; i++) {
                    $.cleanUpContent(elems[i], true, true);
                    if (elems[i] && elems[i].parentNode) {
                        elems[i].parentNode.removeChild(elems[i]);
                    }
                }
                return this;
            },

            /**
            * Adds a css class to elements.
                ```
                $().addClass("selected");
                ```
            * @param {string} name classes that are space delimited
            * @return {$afm} appframework object
            * @title $().addClass(name)
            */
            addClass: function(name) {
                var addClassLoop=function(cname) {
                    if (!that.hasClass(cname, that[i]))
                        classList.push(cname);
                };
                if (name == nundefined) return this;
                for (var i = 0; i < this.length; i++) {
                    var cls = this[i].className;
                    var classList = [];
                    var that = this;
                    name.split(/\s+/g).forEach(addClassLoop);

                    this[i].className += (cls ? " " : "") + classList.join(" ");
                    this[i].className = this[i].className.trim();
                }
                return this;
            },

            /**
            * Removes a css class from elements.
                ```
                $().removeClass("foo"); //single class
                $().removeClass("foo selected");//remove multiple classess
                ```
            * @param {string} name classes that are space delimited
            * @return {Object} appframework object
            * @title $().removeClass(name)
            */
            removeClass: function(name) {
                if (name == nundefined) return this;
                var removeClassLoop=function(cname) {
                    classList = classList.replace(classRE(cname), " ");
                };
                for (var i = 0; i < this.length; i++) {
                    if (name == nundefined) {
                        this[i].className = "";
                        return this;
                    }
                    var classList = this[i].className;
                    //SGV LINK EVENT
                    if (typeof this[i].className === "object") {
                        classList = " ";
                    }
                    name.split(/\s+/g).forEach(removeClassLoop);
                    if (classList.length > 0)
                        this[i].className = classList.trim();
                    else
                        this[i].className = "";
                }
                return this;
            },

            /**
            * Adds or removes one or several css classes to/from elements.
                ```
                $().toggleClass("selected");
                ```
            * @param {string} name Classes that are space delimited
            * @param {boolean=} state [optional] Force toggle to add or remove classes
            * @return {Object} appframework object
            * @title $().toggleClass(name)
            */
            toggleClass: function(name, state) {
                if (name == nundefined) return this;
                for (var i = 0; i < this.length; i++) {
                    if (typeof state !== "boolean") {
                        state = this.hasClass(name, this[i]);
                    }
                    $(this[i])[state ? "removeClass" : "addClass"](name);
                }
                return this;
            },

            /**
            * Replaces a css class on elements.
                ```
                $().replaceClass("on", "off");
                ```
            * @param {string} name classes that are space delimited
            * @param {string} newName classes that are space delimited
            * @return {Object} appframework object
            * @title $().replaceClass(old, new)
            */
            replaceClass: function(name, newName) {
                if (name == nundefined || newName == nundefined) return this;
                var replaceClassFn=function(cname) {
                    classList = classList.replace(classRE(cname), " ");
                };
                for (var i = 0; i < this.length; i++) {
                    if (name == nundefined) {
                        this[i].className = newName;
                        continue;
                    }
                    var classList = this[i].className;
                    name.split(/\s+/g).concat(newName.split(/\s+/g)).forEach(replaceClassFn);
                    classList = classList.trim();
                    if (classList.length > 0) {
                        this[i].className = (classList + " " + newName).trim();
                    } else
                        this[i].className = newName;
                }
                return this;
            },

            /**
            * Checks to see if an element has a class.
                ```
                $().hasClass("foo");
                $().hasClass("foo",element);
                ```
            * @param {string} name Class name to check against
            * @param {Object=} element [optional] Element to check against
            * @return {boolean}
            * @title $().hasClass(name,[element])
            */
            hasClass: function(name, element) {
                if (this.length === 0)
                    return false;
                if (!element)
                    element = this[0];
                return classRE(name).test(element.className);
            },

            /**
            * Appends to the elements
            * We boil everything down to an appframework object and then loop through that.
            * If it is HTML, we create a dom element so we do not break event bindings.
            * if it is a script tag, we evaluate it.
                ```
                $().append("<div></div>"); //Creates the object from the string and appends it
                $().append($("#foo")); //Append an object;
                ```
            *
            * @title $().append(element, [insert], [content])
            *
            * @param {string|Object} element Element/string to add
            * @param {string|Object} content Element/string to add
            * @param {boolean=} insert [optional] insert or append
            * @return {Object} appframework object
            */
            append: function(element, content, insert) {
                if (element && element.length != nundefined && element.length === 0)
                    return this;
                if ($.isArray(element) || $.isObject(element))
                    element = $(element);
                var i, node;
                if(content)
                    $(this).add(content);
                for (i = 0; i < this.length; i++) {
                    if (element.length && typeof element !== "string") {
                        element = $(element);
                        _insertFragments(element, this[i], insert);
                    } else {
                        var obj = fragmentRE.test(element) ? $(element) : undefined;
                        if (obj == nundefined || obj.length === 0) {
                            obj = document.createTextNode(element);
                        }
                        if (obj instanceof $afm) {
                            for (var k=0,lenk=obj.length; k<lenk; k++) {
                                node = obj[k];
                                if (node.nodeName != nundefined && node.nodeName.toLowerCase() === "script" && (!node.type || node.type.toLowerCase() === "text/javascript")) {
                                    window["eval"](node.innerHTML);
                                } else {
                                    _insertFragments($(node), this[i], insert);
                                }
                            }
                        } else {
                            insert != nundefined ? this[i].insertBefore(obj, this[i].firstChild) : this[i].appendChild(obj);
                        }
                    }
                }
                return this;
            },

            /**
            * Appends the current collection to the selector
                ```
                $().appendTo("#foo"); //Append an object;
                ```
            * @param {string|Object} selector to append to
            * @title $().appendTo(element)
            */
            appendTo: function(selector) {
                var tmp = $(selector);
                tmp.append(this);
                return this;
            },

            /**
            * Prepends the current collection to the selector
                ```
                $().prependTo("#foo"); //Prepend an object;
                ```
            * @param {string|Object} selector Selector to prepend to
            * @return {$afm}
            * @title $().prependTo(element)
            */
            prependTo: function(selector) {
                var tmp = $(selector);
                tmp.append(this, null,true);
                return this;
            },

            /**
            * Prepends to the elements
            * This simply calls append and sets insert to true
                ```
                $().prepend("<div></div>");//Creates the object from the string and appends it
                $().prepend($("#foo")); //Prepends an object
                ```
            * @param {Object|string} element Element/string to add
            * @return {$afm} appframework object
            * @title $().prepend(element)
            */
            prepend: function(element) {
                return this.append(element,null, 1);
            },

            /**
             * Inserts collection before the target (adjacent)
                ```
                $().insertBefore(af("#target"));
                ```
             * @param {string|Object} target Target
             * @param {boolean=} after [default=false] When true, do an insert after the target
             * @return {$afm}
             * @title $().insertBefore(target);
             */
            insertBefore: function(target, after) {
                if (this.length === 0)
                    return this;
                target = $(target).get(0);
                if (!target)
                    return this;
                for (var i = 0; i < this.length; i++) {
                    after ? target.parentNode.insertBefore(this[i], target.nextSibling) : target.parentNode.insertBefore(this[i], target);
                }
                return this;
            },

            /**
             * Inserts collection after the target (adjacent)
                ```
                $().insertAfter(af("#target"));
                ```
             * @param {String|Object} target
             * @title $().insertAfter(target);
             */
            insertAfter: function(target) {
                this.insertBefore(target, true);
            },

            /**
            * Returns the raw DOM element.
                ```
                $().get(0); //returns the first element
                $().get(2);// returns the third element
                ```
            * @param {Int} [index]
            * @return {Object} raw DOM element
            * @title $().get([index])
            */
            get: function(index) {
                index = index == nundefined ? null : index;
                if (index < 0)
                    index += this.length;
                if(index===null){
                    var elems=[];
                    for(var i=0;i<this.length;i++){
                        elems.push(this[i]);
                    }
                    return elems;
                }
                return (this[index]) ? this[index] : undefined;
            },

            /**
            * Returns the offset of the element, including traversing up the tree
                ```
                $().offset();
                ```
            * @return {Object} with left, top, width and height properties
            * @title $().offset()
            */
            offset: function() {
                var obj;
                if (this.length === 0)
                    return this;
                if (this[0] === window)
                    return {
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: window.innerWidth,
                        height: window.innerHeight
                    };
                else
                    obj = this[0].getBoundingClientRect();
                return {
                    left: obj.left + window.pageXOffset,
                    top: obj.top + window.pageYOffset,
                    right: obj.right + window.pageXOffset,
                    bottom: obj.bottom + window.pageYOffset,
                    width: obj.right - obj.left,
                    height: obj.bottom - obj.top
                };
            },

            /**
             * Returns the height of the element, including padding on IE
               ```
               $().height();
               ```
             * @param {string=} val New Height
             * @return {number|$afm}
             * @title $().height()
             */
            height: function(val) {
                if (this.length === 0)
                    return this;
                if (val != nundefined)
                    return this.css("height", val);
                if (this[0] === this[0].window)
                    return window.innerHeight;
                if (this[0].nodeType === this[0].DOCUMENT_NODE)
                    return this[0].documentElement.offsetHeight;
                else {
                    var tmpVal = this.computedStyle("height").replace("px", "");
                    if (tmpVal)
                        return +tmpVal;
                    else
                        return this.offset().height;
                }
            },

            /**
             * Returns the width of the element, including padding on IE
               ```
               $().width();
               ```
             * @param {string=} val New Width
             * @return {number|$afm}
             * @title $().width()
             */
            width: function(val) {
                if (this.length === 0)
                    return this;
                if (val != nundefined)
                    return this.css("width", val);
                if (this[0] === this[0].window)
                    return window.innerWidth;
                if (this[0].nodeType === this[0].DOCUMENT_NODE)
                    return this[0].documentElement.offsetWidth;
                else {
                    var tmpVal = this.computedStyle("width").replace("px", "");
                    if (tmpVal)
                        return +tmpVal;
                    else
                        return this.offset().width;
                }
            },

            /**
            * Returns the parent nodes of the elements based off the selector
                ```
                $("#foo").parent(".bar");
                $("#foo").parent($(".bar"));
                $("#foo").parent($(".bar").get(0));
                ``
            * @param {String|Array|Object|undefined} selector [optional]
            * @param {boolean=} recursive
            * @return {Object} appframework object with unique parents
            * @title $().parent(selector)
            */
            parent: function(selector, recursive) {
                if (this.length === 0)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var tmp = this[i];
                    while (tmp.parentNode && tmp.parentNode !== document) {
                        elems.push(tmp.parentNode);
                        if (tmp.parentNode)
                            tmp = tmp.parentNode;
                        if (!recursive)
                            break;
                    }
                }
                return this.setupOld($(unique(elems)).filter(selector));
            },

            /**
            * Returns the parents of the elements based off the selector (traversing up until html document)
                ```
                $("#foo").parents(".bar");
                $("#foo").parents($(".bar"));
                $("#foo").parents($(".bar").get(0));
                ```
            * @param {string|Array|Object|undefined} [selector]
            * @return {Object} appframework object with unique parents
            * @title $().parents(selector)
            */
            parents: function(selector) {
                return this.parent(selector, true);
            },

            /**
            * Returns the child nodes of the elements based off the selector
                ```
                $("#foo").children(".bar"); //Selector
                $("#foo").children($(".bar")); //Objects
                $("#foo").children($(".bar").get(0)); //Single element
                ```
            * @param {string|Array|Object|undefined} selector [optional]
            * @return {Object} appframework object with unique children
            * @title $().children(selector)
            */
            children: function(selector) {

                if (this.length === 0)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    elems = elems.concat(siblings(this[i].firstChild));
                }
                return this.setupOld($((elems)).filter(selector));

            },

            /**
            * Returns the siblings of the element based off the selector
                ```
                $("#foo").siblings(".bar"); //Selector
                $("#foo").siblings($(".bar")); //Objects
                $("#foo").siblings($(".bar").get(0)); //Single element
                ```
            * @param {string|Array|Object|undefined} selector [optional]
            * @return {Object} appframework object with unique siblings
            * @title $().siblings(selector)
            */
            siblings: function(selector) {
                if (this.length === 0)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode)
                        elems = elems.concat(siblings(this[i].parentNode.firstChild, this[i]));
                }
                return this.setupOld($(elems).filter(selector));
            },

            /**
            * Returns the child nodes of the elements based off the selector and includes text nodes
                ```
                $("#foo").contents(".bar"); //Selector
                $("#foo").contents($(".bar")); //Objects
                $("#foo").contents($(".bar").get(0)); //Single element
                ```
            * @param {string|Array|Object|undefined} selector [optional]
            * @return {Object} appframework object with unique children
            * @title $().contents(selector)
            */
            contents:function(selector){
                if (this.length === 0)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    if (this[i].parentNode)
                        //elems = elems.concat(this[i].childNodes);
                        _shimNodes(this[i].childNodes,elems);
                }
                return this.setupOld($(elems).filter(selector));
            },

            /**
            * Returns the closest element based off the selector and optional context
                ```
                $("#foo").closest(".bar"); //Selector
                $("#foo").closest($(".bar")); //Objects
                $("#foo").closest($(".bar").get(0)); //Single element
                ```
            * @param {String|Array|Object} selector
            * @param {Object} [context]
            * @return {Object} Returns an appframework object with the closest element based off the selector
            * @title $().closest(selector,[context]);
            */
            closest: function(selector, context) {
                if (this.length === 0)
                    return this;
                var cur = this[0];

                var start = $(selector, context);
                if (start.length === 0)
                    return $();
                while (cur && start.indexOf(cur) === -1) {
                    cur = cur !== context && cur !== document && cur.parentNode;
                }
                return $(cur);

            },

            /**
            * Filters elements based off the selector
                ```
                $("#foo").filter(".bar"); //Selector
                $("#foo").filter($(".bar")); //Objects
                $("#foo").filter($(".bar").get(0)); //Single element
                ```
            * @param {String|Array|Object} selector
            * @return {Object} Returns an appframework object after the filter was run
            * @title $().filter(selector);
            */
            filter: function(selector) {
                if (this.length === 0)
                    return this;

                if (selector == nundefined)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var val = this[i];
                    if (val.parentNode && $(selector, val.parentNode).indexOf(val) >= 0)
                        elems.push(val);
                }
                return this.setupOld($(unique(elems)));
            },

            /**
            * Basically the reverse of filter.  Return all elements that do NOT match the selector
                ```
                $("#foo").not(".bar"); //Selector
                $("#foo").not($(".bar")); //Objects
                $("#foo").not($(".bar").get(0)); //Single element
                ```
            * @param {String|Array|Object} selector
            * @return {Object} Returns an appframework object after the filter was run
            * @title $().not(selector);
            */
            not: function(selector) {
                if (this.length === 0)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var val = this[i];
                    if (val.parentNode && $(selector, val.parentNode).indexOf(val) === -1)
                        elems.push(val);
                }
                return this.setupOld($(unique(elems)));
            },

            /**
            * Gets or set data-* attribute parameters on elements (when a string)
            * When used as a getter, it's only the first element
                ```
                $().data("foo"); //Gets the data-foo attribute for the first element
                $().data("foo","bar"); //Sets the data-foo attribute for all elements
                $().data("foo",{bar:"bar"});//object as the data
                ```
            * @param {string} key
            * @param {string|Array|Object|undefined} value [optional]
            * @return {string|Object} returns the value or appframework object
            * @title $().data(key,[value]);
            */
            data: function(key, value) {
                return this.attr("data-" + key, value);
            },

            /**
            * Rolls back the appframework elements when filters were applied
            * This can be used after .not(), .filter(), .children(), .parent()
                ```
                $().filter(".panel").end(); //This will return the collection BEFORE filter is applied
                ```
            * @return {Object} returns the previous appframework object before filter was applied
            * @title $().end();
            */
            end: function() {
                return this.oldElement != nundefined ? this.oldElement : $();
            },

            /**
            * Clones the nodes in the collection.
                ```
                $().clone();// Deep clone of all elements
                $().clone(false); //Shallow clone
                ```
            * @param {Boolean} [deep] - do a deep copy or not
            * @return {Object} appframework object of cloned nodes
            * @title $().clone();
            */
            clone: function(deep) {
                deep = deep === false ? false : true;
                if (this.length === 0)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    elems.push(this[i].cloneNode(deep));
                }

                return $(elems);
            },

            /**
            * Returns the number of elements in the collection
                ```
                $().size();
                ```
            * @return {Int}
            * @title $().size();
            */
            size: function() {
                return this.length;
            },

            /**
             * Serializes a form into a query string
               ```
               $().serialize();
               ```
             * @return {string}
             * @title $().serialize()
             */
            serialize: function() {
                if (this.length === 0)
                    return "";
                var serializeFn=function(elem) {
                    var type = elem.getAttribute("type");
                    if (elem.nodeName.toLowerCase() !== "fieldset" && !elem.disabled && type !== "submit" && type !== "reset" && type !== "button" && ((type !== "radio" && type !== "checkbox") || elem.checked)) {

                        if (elem.getAttribute("name")) {
                            if (elem.type === "select-multiple") {
                                for (var j = 0; j < elem.options.length; j++) {
                                    if (elem.options[j].selected)
                                        params.push(elem.getAttribute("name") + "=" + encodeURIComponent(elem.options[j].value));
                                }
                            } else
                                params.push(elem.getAttribute("name") + "=" + encodeURIComponent(elem.value));
                        }
                    }
                };
                var params = [];
                for (var i = 0; i < this.length; i++) {
                    this.slice.call(this[i].elements).forEach(serializeFn);
                }
                return params.join("&");
            },

            /* added in 1.2 */
            /**
             * Reduce the set of elements based off index
                ```
               $().eq(index)
               ```
             * @param {number} ind Index to filter by. If negative, it will go back from the end
             * @return {$afm} appframework object
             * @title $().eq(index)
             */
            eq: function(ind) {
                return $(this.get(ind));
            },

            /**
             * Returns the index of the selected element in the collection
               ```
               $().index(elem)
               ```
             * @param {string|Object} elem The element to look for. Can be a selector or object
             * @return {number} Index of selected element
             * @title $().index(elem)
             */
            index: function(elem) {
                return elem ? this.indexOf($(elem)[0]) : this.parent().children().indexOf(this[0]);
            },

            /**
              * Returns boolean if the object is a type of the selector
              ```
              $().is(selector)
              ```
             * @param {string|Object} selector to act upon
             * @return {boolean}
             * @title $().is(selector)
             */
            is: function(selector) {
                return !!selector && this.filter(selector).length > 0;
            },

            /**
             * adds a result to an existing AF collection
             ```
             $().add(selector)
             ```
             * @param {string|Object} selector to act upon
             * @return {$afm} appframework object
             * @title $().add(selector)
             */
            add:function(selector){
                var els=$(selector);
                var i,len=els.length;
                for(i=0;i<len;i++){
                    this[this.length++]=els[i];
                }
                return this;
            }
        };


        /* AJAX functions */

        function empty() {}

        $.ajaxSettings = {
            type: "GET",
            beforeSend: empty,
            success: empty,
            error: empty,
            complete: empty,
            context: undefined,
            timeout: 0,
            crossDomain: null,
            processData: true
        };

        /**
        * Execute a jsonP call, allowing cross domain scripting
        *
        * options.url - URL to call
        * options.success - Success function to call
        * options.error - Error function to call
            ```
            $.jsonP({url:"mysite.php?callback=?&foo=bar",success:function(){},error:function(){}});
            ```
        * @param {Object} options
        * @title $.jsonP(options)
        */
        $.jsonP = function(options) {
            if (isWin8) {
                options.type = "get";
                options.dataType = null;
                return $.get(options);
            }
            var callbackName = "jsonp_callback" + (++_jsonPID);
            var abortTimeout = "",
                context, callback;
            var script = document.createElement("script");
            window[callbackName] = function(data) {
                clearTimeout(abortTimeout);
                $(script).remove();
                delete window[callbackName];
                options.success.call(context, data);
                options.complete.call(context, data);
            };
            if (options.url.indexOf("callback=?") !== -1) {
                script.src = options.url.replace(/=\?/, "=" + callbackName);
            } else {

                callback = options.jsonp ? options.jsonp : "callback";
                if (options.url.indexOf("?") === -1) {
                    options.url += ("?" + callback + "=" + callbackName);
                }
                else {
                    if(options.url.indexOf("callback=")!==-1){

                        var searcher="callback=";
                        var offset=options.url.indexOf(searcher)+searcher.length;
                        var amp=options.url.indexOf(offset);
                        if(amp===-1)
                            amp=options.url.length;
                        var oldCB=options.url.substr(offset,amp);
                        options.url=options.url.replace(searcher+oldCB,searcher+callbackName);
                        oldCB=oldCB.replace("window.","");
                        options.success=window[oldCB];
                    }
                    else {
                        options.url += ("&" + callback + "=" + callbackName);
                    }
                }
                script.src = options.url;
            }
            if (options.error) {
                script.onerror = function() {
                    clearTimeout(abortTimeout);
                    options.error.call(context, "", "error");
                };
            }
            $("head").append(script);
            if (options.timeout > 0)
                abortTimeout = setTimeout(function() {
                    options.error.call(context, "", "timeout");
                }, options.timeout);
            return {};
        };

        /**
        * Execute an Ajax call with the given options
        * options.type - Type of request
        * options.beforeSend - function to execute before sending the request
        * options.success - success callback
        * options.error - error callback
        * options.complete - complete callback - called with a success or error
        * options.timeout - timeout to wait for the request
        * options.url - URL to make request against
        * options.contentType - HTTP Request Content Type
        * options.headers - Object of headers to set
        * options.dataType - Data type of request
        * options.data - data to pass into request.  $.param is called on objects
            ```
            var opts={
                type:"GET",
                success:function(data){},
                url:"mypage.php",
                data:{bar:"bar"},
            }
            $.ajax(opts);
            ```
        * @param {object} opts Options
        * @title $.ajax(options)
        */
        $.ajax = function(opts) {
            var xhr;
            var deferred=$.Deferred();
            if(typeof(opts)==="string")
            {
                var oldUrl=opts;
                opts={
                    url:oldUrl
                };
            }
            var settings = opts || {};
            for (var key in $.ajaxSettings) {
                if (typeof(settings[key]) === "undefined")
                    settings[key] = $.ajaxSettings[key];
            }
            try{
                if (!settings.url)
                    settings.url = window.location;

                if (!settings.headers)
                    settings.headers = {};

                if (!("async" in settings) || settings.async !== false)
                    settings.async = true;

                if (settings.processData && $.isObject(settings.data))
                    settings.data = $.param(settings.data);
                if (settings.type.toLowerCase() === "get" && settings.data) {
                    if (settings.url.indexOf("?") === -1)
                        settings.url += "?" + settings.data;
                    else
                        settings.url += "&" + settings.data;
                }
                if(settings.data) {
                    if (!settings.contentType && settings.contentType!==false)
                        settings.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
                }
                if (!settings.dataType)
                    settings.dataType = "text/html";
                else {
                    switch (settings.dataType) {
                    case "script":
                        settings.dataType = "text/javascript, application/javascript";
                        break;
                    case "json":
                        settings.dataType = "application/json";
                        break;
                    case "xml":
                        settings.dataType = "application/xml, text/xml";
                        break;
                    case "html":
                        settings.dataType = "text/html";
                        break;
                    case "text":
                        settings.dataType = "text/plain";
                        break;
                    case "jsonp":
                        return $.jsonP(opts);
                    default:
                        settings.dataType = "text/html";
                        break;
                    }
                }


                if (/=\?/.test(settings.url)) {
                    return $.jsonP(settings);
                }
                if (settings.crossDomain === null) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
                        RegExp.$2 !== window.location.host;

                if (!settings.crossDomain)
                    settings.headers = $.extend({
                        "X-Requested-With": "XMLHttpRequest"
                    }, settings.headers);
                var abortTimeout;
                var context = settings.context;
                var protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol;

                //ok, we are really using xhr
                xhr = new window.XMLHttpRequest();
                $.extend(xhr,deferred.promise);

                xhr.onreadystatechange = function() {
                    var mime = settings.dataType;
                    if (xhr.readyState === 4) {
                        clearTimeout(abortTimeout);
                        var result, error = false;
                        var contentType=xhr.getResponseHeader("content-type");
                        if(!contentType)
                            contentType="";
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0 && protocol === "file:") {
                            if ((contentType==="application/json")||(mime === "application/json" && !(/^\s*$/.test(xhr.responseText)))) {
                                try {
                                    result = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    error = e;
                                }
                            }
                            else if(contentType.indexOf("javascript")!==-1){
                                try{
                                    result=xhr.responseText;
                                    window["eval"](result);
                                }
                                catch(e){
                                    console.log(e);
                                }
                            }
                            else if (mime === "application/xml, text/xml") {
                                result = xhr.responseXML;
                            } else if (mime === "text/html") {
                                result = xhr.responseText;
                                $.parseJS(result);
                            }
                            else
                                result = xhr.responseText;
                            //If we're looking at a local file, we assume that no response sent back means there was an error
                            if (xhr.status === 0 && result.length === 0)
                                error = true;
                            if (error){
                                settings.error.call(context, xhr, "parsererror", error);
                                deferred.reject.call(context, xhr, "parsererror", error);
                            }
                            else {
                                deferred.resolve.call(context, result, "success", xhr);
                                settings.success.call(context, result, "success", xhr);
                            }
                        } else {
                            error = true;
                            deferred.reject.call(context,xhr, "error");
                            settings.error.call(context, xhr, "error");
                        }
                        var respText=error?"error":"success";
                        settings.complete.call(context, xhr,respText);
                    }
                };
                xhr.open(settings.type, settings.url, settings.async);
                if (settings.withCredentials) xhr.withCredentials = true;

                if (settings.contentType)
                    settings.headers["Content-Type"] = settings.contentType;
                for (var name in settings.headers)
                    if (typeof settings.headers[name] === "string")
                        xhr.setRequestHeader(name, settings.headers[name]);
                if (settings.beforeSend.call(context, xhr, settings) === false) {
                    xhr.abort();
                    return false;
                }

                if (settings.timeout > 0)
                    abortTimeout = setTimeout(function() {
                        xhr.onreadystatechange = empty;
                        xhr.abort();
                        settings.error.call(context, xhr, "timeout");
                        settings.complete.call(context, xhr, "timeout");
                    }, settings.timeout);
                xhr.send(settings.data);
            } catch (e) {
                // General errors (e.g. access denied) should also be sent to the error callback
                deferred.resolve(context, xhr, "error",e);
                settings.error.call(context, xhr, "error", e);
            }
            return xhr;
        };

        /**
        * Shorthand call to an Ajax GET request
            ```
            $.get("mypage.php?foo=bar",function(data){});
            ```
        * @param {string} url URL to hit
        * @param {Function} success
        * @title $.get(url,success)
        */
        $.get = function(url, success) {
            return this.ajax({
                url: url,
                success: success
            });
        };

        /**
        * Shorthand call to an Ajax POST request
            ```
            $.post("mypage.php",{bar:"bar"},function(data){});
            ```
        * @param {string} url URL to hit
        * @param {Object|Function|undefined} data Data to pass in or the success callback
        * @param {Function=} success [optional] Success Callback when data is given
        * @param {string=} dataType [default="html"] Expected type of data to be returned
        * @title $.post(url,[data],success,[dataType])
        */
        $.post = function(url, data, success, dataType) {
            if ($.isFunction(data)) {
                success = data;
                data = {};
            }

            if(typeof(success)==="string"){
                dataType=success;
                success=function(){};
            }
            if (dataType === nundefined)
                dataType = "html";

            return this.ajax({
                url: url,
                type: "POST",
                data: data,
                dataType: dataType,
                success: success
            });
        };

        /**
        * Shorthand call to an Ajax request that expects a JSON response
            ```
            $.getJSON("mypage.php",{bar:"bar"},function(data){});
            ```
        * @param {String} url to hit
        * @param {Object} [data]
        * @param {Function} [success]
        * @title $.getJSON(url,data,success)
        */
        $.getJSON = function(url, data, success,error) {
            if (typeof(data) === "function") {
                error=success;
                success=data;
                data = {};
            }
            return this.ajax({
                url: url,
                data: data,
                success: success,
                error:error,
                dataType: "json"
            });
        };

        /**
        * Shorthand call to an Ajax request that expects a javascript file.
            ```
            $.getScript("myscript.js", function(data) {} );
            ```
        * @param {String} url javascript file to load
        * @param {function(Object)=} [success]
        * @title $.getScript(url, success)
        */
        $.getScript = function(url, success){
            var isCrossDomain=/^([\w-]+:)?\/\/([^\/]+)/.test(url);
            if(isCrossDomain){
                //create the script
                var deferred = $.Deferred();
                var scr=$.create("script",{async:true,src:url}).get(0);
                scr.onload=function(){
                    success&&success();
                    deferred.resolve.call(this,"success");
                    $(this).remove();
                };
                scr.onerror=function(){
                    $(this).remove();
                    deferred.reject.call(this,"success");
                };
                document.head.appendChild(scr);
                return deferred.promise;
            }
            else {
                return this.ajax({
                    url:url,
                    success:success,
                    dataType:"script"
                });
            }
        };

        /**
        * Converts an object into a key/value par with an optional prefix.  Used for converting objects to a query string
            ```
            var obj={
            foo:"foo",
            bar:"bar"
            }
            var kvp=$.param(obj,"data");
            ```
        * @param {Object} obj object
        * @param {string=} prefix
        * @return {string} Key/value pair representation
        * @title $.param(object,[prefix];
        */
        $.param = function(obj, prefix) {
            var str = [];
            if (obj instanceof $afm) {
                obj.each(function() {
                    var k = prefix ? prefix + "[" + this.id + "]" : this.id,
                        v = this.value;
                    str.push((k) + "=" + encodeURIComponent(v));
                });
            } else {
                for (var p in obj) {

                    if ($.isFunction(obj[p]))
                        continue;
                    var k = prefix ? prefix + "[" + p + "]" : p,
                        v = obj[p];
                    str.push($.isObject(v) ? $.param(v, k) : (k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        };

        /**
        * Used for backwards compatibility.  Uses native JSON.parse function
            ```
            var obj=$.parseJSON("{\"bar\":\"bar\"}");
            ```
        * @param {string} string
        * @return {Object}
        * @title $.parseJSON(string)
        */
        $.parseJSON = function(string) {
            return JSON.parse(string);
        };

        /**
        * Helper function to convert XML into  the DOM node representation
            ```
            var xmlDoc=$.parseXML("<xml><foo>bar</foo></xml>");
            ```
        * @param {String} string
        * @return {Object} DOM nodes
        * @title $.parseXML(string)
        */
        $.parseXML = function(string) {
            if (isWin8) {
                MSApp.execUnsafeLocalFunction(function() {
                    return (new DOMParser()).parseFromString(string, "text/xml");
                });
            } else
                return (new DOMParser()).parseFromString(string, "text/xml");
        };

        /**
         * Helper function to parse the user agent.  Sets the following
         * .os.webkit
         * .os.android
         * .os.ipad
         * .os.iphone
         * .os.webos
         * .os.touchpad
         * .os.blackberry
         * .os.opera
         * .os.fennec
         * .os.ie
         * .os.ieTouch
         * .os.supportsTouch
         * .os.playbook
         * .os.tizen
         * .feat.nativeTouchScroll
         *
         * @param {Object} $
         * @param {string} userAgent
         * @api private
         */
        function detectUA($, userAgent) {
            $.os = {};
            $.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
            $.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
            $.os.androidICS = $.os.android && userAgent.match(/(Android)\s4/) ? true : false;
            $.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
            $.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
            $.os.ios7 = ($.os.ipad||$.os.iphone)&&userAgent.match(/7_/)||($.os.ipad||$.os.iphone)&&userAgent.match(/8_/) ? true : false;

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
            var head = document.documentElement.getElementsByTagName("head")[0];
            $.feat.nativeTouchScroll = typeof(head.style["-webkit-overflow-scrolling"]) !== "undefined" && ($.os.ios||$.os.blackberry10);
            $.feat.cssPrefix = $.os.webkit ? "Webkit" : $.os.fennec ? "Moz" : $.os.ie ? "ms" : $.os.opera ? "O" : "";
            $.feat.cssTransformStart = !$.os.opera ? "3d(" : "(";
            $.feat.cssTransformEnd = !$.os.opera ? ",0)" : ")";
            if($.os.ios) {
                if(Promise&&Promise.toString().indexOf("native")!==-1)
                    $.os.ios7=true;
            }
            if ($.os.android && !$.os.webkit)
                $.os.android = false;
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
        $.uuid = function() {
            var S4 = function() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        };

        /**
         * Gets the css matrix, or creates a fake one
           ```
           $.getCssMatrix(domElement)
           ```

         * @param {$afm|string|undefined} ele
         * @return {Object} matrix with postion
         */
        $.getCssMatrix = function(ele) {
            if ($.is$(ele)) ele = ele.get(0);

            var matrixFn = window.WebKitCSSMatrix || window.MSCSSMatrix;

            if (ele === nundefined) {
                if (matrixFn) {
                    return new matrixFn();
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

            if (matrixFn)
                return new matrixFn(transform);
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
         * $.create - a faster alternative to $("<div id="main">this is some text</div>");
          ```
          $.create("div",{id:"main",innerHTML:"this is some text"});
          $.create("<div id="main">this is some text</div>");
          ```
          * @param {string} type DOM Element type or html
          * @param {Object=} props Properties to apply to the element
          * @return {$afm} Returns an appframework object
          * @title $.create(type,[params])
          */
        $.create = function(type, props) {
            var elem;
            var f = new $afm();
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
         * $.query  - a faster alternative to $("div");
          ```
          $.query(".panel");
          ```
          * @param {string} sel selector
          * @param {Object=} what Context
          * @return {$afm} Returns an appframework object
          * @title $.query(selector,[context])
          */
        $.query = function(sel, what) {
            if (!sel)
                return new $afm();
            what = what || document;
            var f = new $afm();
            return f.selector(sel, what);
        };

        /**
         * The following is modified from Zepto.js / events.js
         * We've removed deprecated  events like .live and allow anonymous functions to be removed
         */

        /**
         * @api private
         * @type Array.<Function>
         */
        var handlers = [],
            /**
             * @type {number}
             */
            _afmid = 1;

        /**
         * Gets or sets the expando property on a javascript element
         * Also increments the internal counter for elements;
         * @param {Object} element
         * @return {Int} afmid
         * @api private
         */
        function afmid(element) {
            return element._afmid || (element._afmid = _afmid++);
        }

        /**
         * Searches through a local array that keeps track of event handlers for proxying.
         * Since we listen for multiple events, we match up the event, function and selector.
         * This is used to find, execute, remove proxied event functions
         *
         * @param {Object} element
         * @param {string=} event
         * @param {function()} fn function [optional]
         * @param {String|Object|Array|undefined} selector [optional]
         * @return {Function|null} handler function or false if not found
         * @api private
         */
        function findHandlers(element, event, fn, selector) {
            event = parse(event);
            if (event.ns)
                var matcher = matcherFor(event.ns);
            return (handlers[afmid(element)] || []).filter(function(handler) {
                return handler && (!event.e || handler.e === event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || handler.fn === fn || (typeof handler.fn === "function" && typeof fn === "function" && handler.fn === fn)) && (!selector || handler.sel === selector);
            });
        }

        /**
         * Splits an event name by "." to look for namespaces (e.g touch.click)
         * @param {String} event
         * @return {Object} an object with the event name and namespace
         * @api private
         */
        function parse(event) {
            var parts = ("" + event).split(".");
            return {
                e: parts[0],
                ns: parts.slice(1).sort().join(" ")
            };
        }

        /**
         * Regular expression checker for event namespace checking
         * @param {string} ns namespace
         * @return {Regex} regular expression
         * @api private
         */
        function matcherFor(ns) {
            return new RegExp("(?:^| )" + ns.replace(" ", " .* ?") + "(?: |$)");
        }

        /**
         * Utility function that will loop through events that can be a hash or space delimited and executes the function
         * @param {String|Object} events
         * @param {Function} fn
         * @param {Iterator} [iterator]
         * @api private
         */

        function eachEvent(events, fn, iterator) {
            if ($.isObject(events))
                $.each(events, iterator);
            else
                events.split(/\s/).forEach(function(type) {
                    iterator(type, fn);
                });
        }

        /**
         * Helper function for adding an event and creating the proxy handler function.
         * All event handlers call this to wire event listeners up.  We create proxy handlers so they can be removed then.
         * This is needed for delegate/on
         * @param {Object} element
         * @param {String|Object} events
         * @param {Function} fn Function that will be executed when event triggers
         * @param {String|Array|Object|undefined} selector [optional]
         * @param {function()=} getDelegate {optional}
         * @api private
         */
        function add(element, events, fn, selector, getDelegate) {

            var id = afmid(element),
                set = (handlers[id] || (handlers[id] = []));
            eachEvent(events, fn, function(event, fn) {
                var delegate = getDelegate && getDelegate(fn, event),
                    callback = delegate || fn;
                var proxyfn = function(event) {
                    if (event.ns){
                        var matcher = matcherFor(event.ns);
                        if(!matcher.test(handler.ns))
                            return;
                    }

                    var result = callback.apply(element, [event].concat(event.data));
                    if (result === false)
                        event.preventDefault();
                    return result;
                };
                var handler = $.extend(parse(event), {
                    fn: fn,
                    proxy: proxyfn,
                    sel: selector,
                    del: delegate,
                    i: set.length
                });
                set.push(handler);
                element.addEventListener(handler.e, proxyfn, false);
            });
        }

        /**
         * Helper function to remove event listeners.  We look through each event and then the proxy handler array to see if it exists
         * If found, we remove the listener and the entry from the proxy array.  If no function is specified, we remove all listeners that match
         *
         * @param {Object} element
         * @param {String|Object} events
         * @param {Function= } fn [optional]
         * @param {String|Array|Object|undefined} selector [optional]
         * @api private
         */
        function remove(element, events, fn, selector) {

            var id = afmid(element);
            eachEvent(events || "", fn, function(event, fn) {
                findHandlers(element, event, fn, selector).forEach(function(handler) {
                    delete handlers[id][handler.i];
                    element.removeEventListener(handler.e, handler.proxy, false);
                });
            });
        }


        $.event = {
            add: add,
            remove: remove
        };

        /**
        * Binds an event to each element in the collection and executes the callback
            ```
            $().bind("click",function(){console.log("I clicked "+this.id);});
            ```
        * @param {String|Object} event
        * @param {Function} callback
        * @return {Object} appframework object
        * @title $().bind(event,callback)
        */
        $.fn.bind = function(event, callback) {
            for (var i = 0, len = this.length; i < len; i++) {
                add(this[i], event, callback);
            }
            return this;
        };

        /**
        * Unbinds an event to each element in the collection.  If a callback is passed in, we remove just that one, otherwise we remove all callbacks for those events
            ```
            $().unbind("click"); //Unbinds all click events
            $().unbind("click",myFunc); //Unbinds myFunc
            ```
        * @param {string|Object} event
        * @param {Function} [callback]
        * @return {$afm} appframework object
        * @title $().unbind(event,[callback]);
        */
        $.fn.unbind = function(event, callback) {
            for (var i = 0, len = this.length; i < len; i++) {
                remove(this[i], event, callback);
            }
            return this;
        };

        /**
        * Binds an event to each element in the collection that will only execute once.  When it executes, we remove the event listener then right away so it no longer happens
            ```
            $().one("click",function(){console.log("I was clicked once");});
            ```
        * @param {string|Object} event
        * @param {Function} [callback]
        * @return appframework object
        * @title $().one(event,callback);
        */
        $.fn.one = function(event, callback) {
            return this.each(function(i, element) {
                add(this, event, callback, null, function(fn, type) {
                    return function() {
                        remove(element, type, fn);
                        var result = fn.apply(element, arguments);
                        return result;
                    };
                });
            });
        };

        /**
         * internal variables
         * @return {boolean} always returns true
         * @api private
         */
        var returnTrue = function() {
            return true;
        };

        /**
         * @return {boolean} always returns false
         */
        var returnFalse = function() {
            return false;
        };

        var eventMethods = {
            preventDefault: "isDefaultPrevented",
            stopImmediatePropagation: "isImmediatePropagationStopped",
            stopPropagation: "isPropagationStopped"
        };

        /**
         * Creates a proxy function for event handlers.
         * As "some" browsers dont support event.stopPropagation this call is bypassed if it cant be found on the event object.
         * @param {String} event
         * @return {Function} proxy
         * @api private
         */
        function createProxy(event) {
            var proxy = $.extend({
                originalEvent: event
            }, event);
            $.each(eventMethods, function(name, predicate) {
                proxy[name] = function() {
                    this[predicate] = returnTrue;
                    if (name === "stopImmediatePropagation" || name === "stopPropagation") {
                        event.cancelBubble = true;
                        if (!event[name])
                            return;
                    }
                    return event[name].apply(event, arguments);
                };
                proxy[predicate] = returnFalse;
            });
            return proxy;
        }

        /**
        * Delegate an event based off the selector.  The event will be registered at the parent level, but executes on the selector.
            ```
            $("#div").delegate("p","click",callback);
            ```

        * @param {string|Object} element
        * @param {String|Object} event
        * @param {Function} callback
        * @param {String|Array|Object|undefined} selector [optional]
        * @param {Object=} data [optional]
        * @return {$afm} appframework object
        * @title $().delegate(selector,event,[data],callback)
        */
        function addDelegate(element,event,callback,selector,data){
            add(element, event, callback, selector, function(fn) {
                    return function(e) {
                        var evt, match = $(e.target).closest(selector, element).get(0);
                        if (match) {
                            evt = $.extend(createProxy(e), {
                                currentTarget: match,
                                liveFired: element,
                                delegateTarget:element,
                                data:data
                            });
                            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)));
                        }
                    };
                });
        }
        $.fn.delegate = function(selector, event, data, callback) {
            if ($.isFunction(data)) {
                callback = data;
                data = null;
            }
            for (var i = 0, len = this.length; i < len; i++) {
                addDelegate(this[i],event,callback,selector,data);
            }
            return this;
        };

        /**
        * Unbinds events that were registered through delegate.  It acts upon the selector and event.  If a callback is specified, it will remove that one, otherwise it removes all of them.
            ```
            $("#div").undelegate("p","click",callback);//Undelegates callback for the click event
            $("#div").undelegate("p","click");//Undelegates all click events
            ```

        * @param {String|Array|Object} selector
        * @param {String|Object} event
        * @param {Function} callback
        * @return {Object} appframework object
        * @title $().undelegate(selector,event,[callback]);
        */
        $.fn.undelegate = function(selector, event, callback) {
            for (var i = 0, len = this.length; i < len; i++) {
                remove(this[i], event, callback, selector);
            }
            return this;
        };

        /**
        * Similar to delegate, but the function parameter order is easier to understand.
        * If selector is undefined or a function, we just call .bind, otherwise we use .delegate
            ```
            $("#div").on("click","p",callback);
            ```

        * @param {String|Array|Object} selector
        * @param {String|Object} event
        * @param {Object} data
        * @param {Function} callback
        * @return {Object} appframework object
        * @title $().on(event,selector,[data],callback);
        */
        $.fn.on = function(event, selector, data, callback) {
            if ($.isFunction(data)) {
                callback = data;
                data = null;
            }

            return selector === nundefined || $.isFunction(selector) ? this.bind(event, selector) : this.delegate(selector, event, data,callback);
        };

        /**
        * Removes event listeners for .on()
        * If selector is undefined or a function, we call unbind, otherwise it's undelegate
            ```
            $().off("click","p",callback); //Remove callback function for click events
            $().off("click","p") //Remove all click events
            ```

        * @param {String|Object} event
        * @param {String|Array|Object} selector
        * @param {Function()=} [optional] callback
        * @return {Object} appframework object
        * @title $().off(event, selector, [callback])
        */
        $.fn.off = function(event, selector, callback) {
            return selector === nundefined || $.isFunction(selector) ? this.unbind(event, selector) : this.undelegate(selector, event, callback);
        };

        /**
        This triggers an event to be dispatched.  Usefull for emulating events, etc.
        ```
        $().trigger("click",{foo:"bar"});//Trigger the click event and pass in data
        ```

        * @param {string|Object} event
        * @param {Object=} data
        * @param {Object=} props
        * @return {$afm} appframework object
        * @title $().trigger(event,data);
        */
        $.fn.trigger = function(event, data, props) {
            if (typeof event === "string"){
                props=props || {};
                event = parse(event);
                props.ns=event.ns;
                event = $.Event(event.e, props);
            }
            event.data = data;
            for (var i = 0, len = this.length; i < len; i++) {
                this[i].dispatchEvent(event);
            }
            return this;
        };

        /**
         Creates a custom event to be used internally.
         ```
         $.Event('MouseEvent');
         ```
         * @api private
         * @title $.Event(type,props);
         *
         * @param {string} type
         * @param {Object=} props [properties]
         * @return {event} a custom event that can then be dispatched
         */
        $.Event = function(type, props) {
            var event = document.createEvent("Events"),
                bubbles = true;
            if (props)
                for (var name in props)
                    (name === "bubbles") ? (bubbles = !! props[name]) : (event[name] = props[name]);
            event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null);
            return event;
        };

        /**
         * The following are for objects and not DOM nodes
         * @api private
         */

        /**
         * Bind an event to an object instead of a DOM Node
           ```
           $.bind(this,"event",function(){});
           ```
         * @param {Object} obj Object
         * @param {string} ev Event name
         * @param {Function} f Function to execute
         * @title $.bind(object,event,function);
         */
        $.bind = function(obj, ev, f) {
            if (!obj) return;
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
           $.trigger(this,"event",arguments);
           ```
         * @param {Object} obj object
         * @param {string} ev event name
         * @param {Array} args arguments
         * @title $.trigger(object,event,argments);
         */
        $.trigger = function(obj, ev, args) {
            if (!obj) return;
            var ret = true;
            if (!obj.__events) return ret;
            if (!$.isArray(ev)) ev = [ev];
            if (!$.isArray(args)) args = [];
            for (var i = 0; i < ev.length; i++) {
                if (obj.__events[ev[i]]) {
                    var evts = obj.__events[ev[i]].slice(0);
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
           $.unbind(this,"event",function(){});
           ```
         * @param {Object} obj Object
         * @param {String} ev Event name
         * @param {Function} f Function to execute
         * @title $.unbind(object,event,function);
         */
        $.unbind = function(obj, ev, f) {
            if (!obj.__events) return;
            if(ev==nundefined) {
                delete obj.__events;
                return;
            }
            if (!$.isArray(ev)) ev = [ev];
            for (var i = 0; i < ev.length; i++) {
                if (obj.__events[ev[i]]) {
                    var evts = obj.__events[ev[i]];
                    for (var j = 0; j < evts.length; j++) {
                        if (f == nundefined)
                            delete evts[j];
                        if (evts[j] === f) {
                            evts.splice(j, 1);
                            break;
                        }
                    }
                }
            }
        };

        /**
         * Creates a proxy function so you can change "this" context in the function
            ```
                var newObj={foo:bar}
                $("#main").bind("click",$.proxy(function(evt){console.log(this)},newObj);
                ( $.proxy(function(foo, bar){console.log(this+foo+bar)}, newObj) )("foo", "bar");
                ( $.proxy(function(foo, bar){console.log(this+foo+bar)}, newObj, ["foo", "bar"]) )();
            ```
         * @param {Function} f Callback
         * @param {Object} c Context
         * @param {Object=} args [optional] Arguments
         * @title $.proxy(callback, context, [arguments]);
         */
        $.proxy = function(f, c, args) {
            return function() {
                if (args) return f.apply(c, args); //use provided arguments
                return f.apply(c, arguments); //use scope function call arguments
            };
        };

        /**
         * Removes listeners on a div and its children recursively
            ```
             cleanUpNode(node,kill)
            ```
         * @param {HTMLDivElement} node the element to clean up recursively
         * @param {boolean} kill
         * @api private
         */
        function cleanUpNode(node, kill) {
            //kill it before it lays eggs!
            if (kill && node.dispatchEvent) {
                var e = $.Event("destroy", {
                    bubbles: false
                });
                node.dispatchEvent(e);
            }
            //cleanup itself
            var id = afmid(node);
            if (id && handlers[id]) {
                for (var key in handlers[id])
                    node.removeEventListener(handlers[id][key].e, handlers[id][key].proxy, false);
                delete handlers[id];
            }
        }

        function cleanUpContent(node, kill) {
            if (!node) return;
            //cleanup children
            var children = node.childNodes;
            if (children && children.length > 0) {
                for (var i=0; i < children.length; i++) {
                    cleanUpContent(children[i], kill);
                }
            }

            cleanUpNode(node, kill);
        }
        var cleanUpAsap = function(els, kill) {
            for (var i = 0; i < els.length; i++) {
                cleanUpContent(els[i], kill);
            }
        };

        /**
         * Function to clean up node content to prevent memory leaks
           ```
           $.cleanUpContent(node, itself, kill)
           ```
         * @param {HTMLNode} node
         * @param {boolean} itself
         * @param {boolean=} kill When set to true, this will emit a non-bubbling "destroy" Event on the node
         * @title $.cleanUpContent(node,itself,kill)
         */
        $.cleanUpContent = function(node, itself, kill) {
            if (!node) return;
            //cleanup children
            var cn = node.childNodes;
            if (cn && cn.length > 0) {
                //destroy everything in a few ms to avoid memory leaks
                //remove them all and copy objs into new array
                $.asap(cleanUpAsap, {}, [slice.apply(cn, [0]), kill]);
            }
            //cleanUp this node
            if (itself) cleanUpNode(node, kill);
        };

        // Like setTimeout(fn, 0); but much faster
        var timeouts = [];
        var contexts = [];
        var params = [];
        /**
         * This adds a command to execute in the JS stack, but is faster then setTimeout
           ```
           $.asap(function,context,args)
           ```
         * @param {Function} fn function
         * @param {Object} context
         * @param {Array} args arguments
         */
        $.asap = function(fn, context, args) {
            if (!$.isFunction(fn)) throw "$.asap - argument is not a valid function";
            timeouts.push(fn);
            contexts.push(context ? context : {});
            params.push(args ? args : []);
            //post a message to ourselves so we know we have to execute a function from the stack
            window.postMessage("afm-asap", "*");
        };
        window.addEventListener("message", function(event) {
            if (event.source === window && event.data === "afm-asap") {
                event.stopPropagation();
                if (timeouts.length > 0) { //just in case...
                    (timeouts.shift()).apply(contexts.shift(), params.shift());
                }
            }
        }, true);

        /**
         * this function executes javascript in HTML.
           ```
           $.parseJS(content)
           ```
        * @param {String|DOM} content
        * @title $.parseJS(content);
        */
        var remoteJSPages = {};
        $.parseJS = function(div) {
            if (!div)
                return;
            if (typeof(div) === "string") {
                var elem = document.createElement("div");
                if (isWin8) {
                    MSApp.execUnsafeLocalFunction(function() {
                        elem.innerHTML = div;
                    });
                } else
                    elem.innerHTML = div;

                div = elem;
            }
            var scripts = div.getElementsByTagName("script");
            div = null;
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.length > 0 && !remoteJSPages[scripts[i].src] && !isWin8) {
                    var doc = document.createElement("script");
                    doc.type = scripts[i].type;
                    doc.src = scripts[i].src;
                    document.getElementsByTagName("head")[0].appendChild(doc);
                    remoteJSPages[scripts[i].src] = 1;
                    doc = null;
                } else {
                    window["eval"](scripts[i].innerHTML);
                }
            }
        };


        /* custom events since people want to do $().click instead of $().bind("click") */
        ["click", "keydown", "keyup", "keypress", "submit", "load", "resize", "change", "select", "error"].forEach(function(event) {
            $.fn[event] = function(cb) {
                return cb ? this.bind(event, cb) : this.trigger(event);
            };
        });


        ["focus", "blur"].forEach(function(name) {
            $.fn[name] = function(callback) {
                if (this.length === 0) return;
                if (callback)
                    this.bind(name, callback);
                else{
                    for (var i = 0; i < this.length; i++) {
                        try {
                            this[i][name]();
                        } catch (e) {}
                    }
                }
                return this;
            };
        });

        $.Deferred = function(){
            return {
                reject:function(){},
                resolve:function(){},
                promise:{
                    then:function(){},
                    fail:function(){}
                }
            };
        };
        /**
         * End of APIS
         * @api private
         */
        return $;

    })(window);
    window.jq = af; //backwards compat
    "$" in window || (window.$ = af);
    if (typeof define === "function" && define.amd) {
        define("appframework", [], function() {
            "use strict";
            return af;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports.af = af;
        module.exports.$ = af;
    }
    //Helper function used in af.mobi.plugins.
    if (!window.numOnly) {
        window.numOnly = function numOnly(val) {
            "use strict";
            if (val === undefined || val === "") return 0;
            if (isNaN(parseFloat(val))) {
                if (val.replace) {
                    val = val.replace(/[^0-9.-]/g, "");
                } else return 0;
            }
            return parseFloat(val);
        };
    }
}

/**
 * ayepromise.js
 * @license BSD - https://github.com/cburgmer/ayepromise/commit/299eb65b5ce227873b2f1724c8f5b2bfa723680a
 * https://github.com/cburgmer/ayepromise
 */

// UMD header
(function (root, factory) {
    //remove AMD code
    root.ayepromise = factory();
}(this, function () {
    'use strict';

    var ayepromise = {};

    /* Wrap an arbitrary number of functions and allow only one of them to be
       executed and only once */
    var once = function () {
        var wasCalled = false;

        return function wrapper(wrappedFunction) {
            return function () {
                if (wasCalled) {
                    return;
                }
                wasCalled = true;
                wrappedFunction.apply(null, arguments);
            };
        };
    };

    var getThenableIfExists = function (obj) {
        // Make sure we only access the accessor once as required by the spec
        var then = obj && obj.then;

        if (obj !== null &&
            typeof obj === "object" &&
            typeof then === "function") {

            return function() { return then.apply(obj, arguments); };
        }
    };

    var aThenHandler = function (onFulfilled, onRejected) {
        var defer = ayepromise.defer();

        var doHandlerCall = function (func, value) {
            setTimeout(function () {
                var returnValue;
                try {
                    returnValue = func(value);
                } catch (e) {
                    defer.reject(e);
                    return;
                }

                if (returnValue === defer.promise) {
                    defer.reject(new TypeError('Cannot resolve promise with itself'));
                } else {
                    defer.resolve(returnValue);
                }
            }, 1);
        };

        return {
            promise: defer.promise,
            callFulfilled: function (value) {
                if (onFulfilled && onFulfilled.call) {
                    doHandlerCall(onFulfilled, value);
                } else {
                    defer.resolve(value);
                }
            },
            callRejected: function (value) {
                if (onRejected && onRejected.call) {
                    doHandlerCall(onRejected, value);
                } else {
                    defer.reject(value);
                }
            }
        };
    };

    // States
    var PENDING = 0,
        FULFILLED = 1,
        REJECTED = 2;

    ayepromise.defer = function () {
        var state = PENDING,
            outcome,
            thenHandlers = [];

        var doFulfill = function (value) {
            state = FULFILLED;
            outcome = value;

            thenHandlers.forEach(function (then) {
                then.callFulfilled(outcome);
            });
        };

        var doReject = function (error) {
            state = REJECTED;
            outcome = error;

            thenHandlers.forEach(function (then) {
                then.callRejected(outcome);
            });
        };

        var executeThenHandlerDirectlyIfStateNotPendingAnymore = function (then) {
            if (state === FULFILLED) {
                then.callFulfilled(outcome);
            } else if (state === REJECTED) {
                then.callRejected(outcome);
            }
        };

        var registerThenHandler = function (onFulfilled, onRejected) {
            var thenHandler = aThenHandler(onFulfilled, onRejected);

            thenHandlers.push(thenHandler);

            executeThenHandlerDirectlyIfStateNotPendingAnymore(thenHandler);

            return thenHandler.promise;
        };

        var safelyResolveThenable = function (thenable) {
            // Either fulfill, reject or reject with error
            var onceWrapper = once();
            try {
                thenable(
                    onceWrapper(transparentlyResolveThenablesAndFulfill),
                    onceWrapper(doReject)
                );
            } catch (e) {
                onceWrapper(doReject)(e);
            }
        };

        var transparentlyResolveThenablesAndFulfill = function (value) {
            var thenable;

            try {
                thenable = getThenableIfExists(value);
            } catch (e) {
                doReject(e);
                return;
            }

            if (thenable) {
                safelyResolveThenable(thenable);
            } else {
                doFulfill(value);
            }
        };

        var onceWrapper = once();
        return {
            resolve: onceWrapper(transparentlyResolveThenablesAndFulfill),
            reject: onceWrapper(doReject),
            promise: {
                then: registerThenHandler,
                fail: function (onRejected) {
                    return registerThenHandler(null, onRejected);
                }
            }
        };
    };
    return ayepromise;
}));
(function($){
    $.Deferred=ayepromise.defer;
})(af);
