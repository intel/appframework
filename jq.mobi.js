 /*
 jshint newcap:false
 */
/**
 * jqMobi is a query selector class for HTML5 mobile apps on a WebkitBrowser.
 * Since most mobile devices (Android, iOS, webOS) use a WebKit browser, you only need to target one browser.
 * We are able to increase the speed greatly by removing support for legacy desktop browsers and taking advantage of browser features, like native JSON parsing and querySelectorAll
 
 
 * MIT License
 * @author AppMobi
 */
if (!window.jq || typeof (jq) !== "function") {
    var jq = (function(window) {
        "use strict";
        var undefined, 
        document = window.document, 
        emptyArray = [], 
        slice = emptyArray.slice, 
        classCache = [], 
        eventHandlers = [], 
        _eventID = 1, 
        jsonPHandlers = [], 
        _jsonPID = 1;
        function classRE(name) {
            return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
        }
        
        function unique(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr.indexOf(arr[i]) != i) {
                    arr.splice(i, 1);
                    continue;
                }
            }
            return arr;
        }
        
        function siblings(nodes, element) {
            var elems = [];
            if (nodes == undefined)
                return elems;
            
            for (; nodes; nodes = nodes.nextSibling) 
            {
                if (nodes.nodeType == 1 && nodes !== element) 
                {
                    elems.push(nodes);
                }
            }
            return elems;
        }
        
        
        var $jqm = function(toSelect, what) {
            this.length = 0;
            if (!toSelect) {
                return this;
            } 
            else if (toSelect instanceof $jqm && what == undefined) {
                return toSelect;
            } 
            else if ($.isFunction(toSelect)) {
                return $(document).ready(toSelect);
            } 
            else if ($.isArray(toSelect) && toSelect.length != undefined)  //Passing in an array or object
            {
                for (var i = 0; i < toSelect.length; i++)
                    this[this.length++] = toSelect[i];
                return this;
            } 
            else if ($.isObject(toSelect) && $.isObject(what))  //var tmp=$("span");  $("p").find(tmp);
            {
                if (toSelect.length == undefined) 
                {
                    if (toSelect.parentNode == what)
                        this[this.length++] = toSelect;
                } 
                else {
                    for (var i = 0; i < toSelect.length; i++)
                        if (toSelect[i].parentNode == what)
                            this[this.length++] = toSelect[i];
                }
                return this;
            } 
            else if ($.isObject(toSelect) && what == undefined) { //Single object 
                this[this.length++] = toSelect;
                return this;
            } 
            
            else if (what !== undefined) {
                if (what instanceof $jqm) {
                    return what.find(toSelect);
                }
            
            } 
            else {
                what = document;
            }
            
            var dom = this.selector(toSelect, what);
            if (!dom) {
                return this;
            } 
            //reverse the query selector all storage
            else if ($.isArray(dom)) {
                for (var j = 0; j < dom.length; j++) {
                    this[this.length++] = dom[j];
                }
            } 
            else {
                this[this.length++] = dom;
                return this;
            }
            return this;
        };
        
        var $ = function(selector, what) {
            return new $jqm(selector, what);
        };
        
        function _selector(selector, what) {
            var dom;
            try {
                if (selector[0] === "#" && selector.indexOf(" ") === -1 && selector.indexOf(">") === -1) {
                    if (what == document)
                        dom = what.getElementById(selector.replace("#", ""));
                    else
                        dom = [].slice.call(what.querySelectorAll(selector));
                } 
                else if (selector[0] === "<" && selector[selector.length - 1] === ">")  //html
                {
                    var tmp = document.createElement("div");
                    tmp.innerHTML = selector;
                    dom = [].slice.call(tmp.childNodes);
                } 
                else {
                    dom = [].slice.call(what.querySelectorAll(selector));
                }
            } 
            catch (e) {
            }
            return dom;
        }
        
        $.map = function(elements, callback) {
            var value, values = [], 
            i, key;
            if ($.isArray(elements))
                for (i = 0; i < elements.length; i++) {
                    value = callback(elements[i], i);
                    if (value !== undefined)
                        values.push(value);
                }
            else if ($.isObject(elements))
                for (key in elements) {
                    if (!elements.hasOwnProperty(key))
                        continue;
                    value = callback(elements[key], key);
                    if (value !== undefined)
                        values.push(value);
                }
            return $([values]);
        };
        
        $.each = function(elements, callback) {
            var i, key;
            if ($.isArray(elements))
                for (i = 0; i < elements.length; i++) {
                    if (callback(i, elements[i]) === false)
                        return elements;
                }
            else if ($.isObject(elements))
                for (key in elements) {
                    if (!elements.hasOwnProperty(key))
                        continue;
                    if (callback(key, elements[key]) === false)
                        return elements;
                }
            return elements;
        };
        
        $.extend = function(target) {
            if (target == undefined)
                target = this;
            if (arguments.length === 1) {
                for (var key in target)
                    this[key] = target[key];
                return this;
            } 
            
            else {
                slice.call(arguments, 1).forEach(function(source) {
                    for (var key in source)
                        target[key] = source[key];
                });
            }
            return target;
        };
        
        $.isArray = function(obj) {
            return Array.isArray(obj);
        };
        
        $.isFunction = function(obj) {
            return typeof obj === "function";
        };
        $.isObject = function(obj) {
            return typeof obj === "object";
        }
        
        $.fn = $jqm.prototype = {
            constructor: $jqm,
            forEach: emptyArray.forEach,
            reduce: emptyArray.reduce,
            push: emptyArray.push,
            indexOf: emptyArray.indexOf,
            concat: emptyArray.concat,
            selector: _selector,
            oldElement: undefined,
            slice: emptyArray.slice,
            setupOld: function(params) {
                if (params == undefined)
                    return $();
                params.oldElement = this;
                return params;
            
            },
            map: function(fn) {
                return $.map(this, function(el, i) {
                    return fn.call(el, i, el);
                });
            },
            each: function(callback) {
                this.forEach(function(el, idx) {
                    callback.call(el, idx, el);
                });
                return this;
            },
            ready: function(callback) {
                if (document.readyState === "complete" || document.readyState === "loaded")
                    callback();
                document.addEventListener("DOMContentLoaded", callback, false);
                return this;
            },
            find: function(sel) {
                if (this.length === 0)
                    return undefined;
                var elems = [];
                var tmpElems;
                for (var i = 0; i < this.length; i++) 
                {
                    tmpElems = ($(sel, this[i]));
                    
                    for (var j = 0; j < tmpElems.length; j++) 
                    {
                        elems.push(tmpElems[j]);
                    }
                }
                return $(unique(elems));
            },
            html: function(html) {
                if (this.length === 0)
                    return undefined;
                if (html === undefined)
                    return this[0].innerHTML;
                for (var i = 0; i < this.length; i++) {
                    this[i].innerHTML = html;
                }
                return this;
            },
            text: function(text) {
                if (this.length === 0)
                    return undefined;
                if (text === undefined)
                    return this[0].textContent;
                for (var i = 0; i < this.length; i++) {
                    this[i].textContent = text;
                }
                return this;
            },
            css: function(attribute, value) {
                if (this.length === 0)
                    return undefined;
                if (value === undefined && typeof (attribute) === "string")
                    return this[0].style[attribute];
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(attribute)) {
                        for (var j in attribute) {
                            this[i].style[j] = attribute[j];
                        }
                    } 
                    else
                        this[i].style[attribute] = value;
                }
                return this;
            },
            empty: function() {
                for (var i = 0; i < this.length; i++) {
                    this[i].innerHTML = '';
                }
                return this;
            },
            hide: function() {
                if (this.length === 0)
                    return undefined;
                for (var i = 0; i < this.length; i++) {
                    if (this[i].style.display != "none") {
                        this[i].setAttribute("jqmOldStyle", this[i].style.display);
                        this[i].style.display = "none";
                    }
                }
                return this;
            },
            show: function() {
                if (this.length === 0)
                    return undefined;
                for (var i = 0; i < this.length; i++) {
                    if (this[i].style.display == "none") {
                        this[i].style.display = this[i].getAttribute("jqmOldStyle") ? this[i].getAttribute("jqmOldStyle") : 'block';
                        this[i].removeAttribute("jqmOldStyle");
                    }
                }
                return this;
            },
            toggle: function(show) {
                var show2 = show === true ? true : false;
                for (var i = 0; i < this.length; i++) {
                    if (this[i].style.display !== "none" || (show !== undefined && show2 === false)) {
                        this[i].setAttribute("jqmOldStyle", this[i].style.display)
                        this[i].style.display = "none";
                    } 
                    else {
                        this[i].style.display = this[i].getAttribute("jqmOldStyle") !== "" ? this[i].getAttribute("jqmOldStyle") : 'block';
                        this[i].removeAttribute("jqmOldStyle");
                    }
                }
                return this;
            },
            val: function(value) {
                if (this.length === 0)
                    return undefined;
                if (value == undefined)
                    return this[0].value;
                for (var i = 0; i < this.length; i++) {
                    this[i].value = value;
                }
                return this;
            },
            attr: function(attr, value) {
                if (this.length === 0)
                    return undefined;
                if (value === undefined && !$.isObject(attr)) {
                    var val = this[0].getAttribute(attr);
                    
                    try {
                        val = JSON.parse(val);
                    } catch (e) {
                    }
                    return val;
                }
                value = $.isArray(value) || $.isObject(value) ? JSON.stringify(value) : value;
                for (var i = 0; i < this.length; i++) {
                    if ($.isObject(attr)) {
                        for (var key in attr) 
                        {
                            if (value == null && value !== undefined)
                                this[i].removeAttribute(key);
                            else
                                this[i].setAttribute(key, attr[key]);
                        }
                    } 
                    else 
                    if (value == null && value !== undefined)
                        this[i].removeAttribute(attr);
                    else
                        this[i].setAttribute(attr, value);
                }
                return this;
            },
            removeAttr: function(attr) {
                var that = this;
                for (var i = 0; i < this.length; i++) {
                    attr.split(/\s+/g).forEach(function(param) {
                        that[i].removeAttribute(param);
                    });
                }
                return this;
            },
            remove: function(selector) {
                var elems = $(this).filter(selector);
                for (var i = 0; i < elems.length; i++) {
                    elems[i].parentNode.removeChild(elems[i]);
                }
                return elems;
            },
            addClass: function(name) {
                for (var i = 0; i < this.length; i++) {
                    var cls = this[i].className;
                    var classList = [];
                    var that = this;
                    name.split(/\s+/g).forEach(function(cname) {
                        if (!that.hasClass(cname, that[i]))
                            classList.push(cname);
                    });
                    
                    this[i].className += (cls ? " " : "") + classList.join(" ");
                    this[i].className = this[i].className.trim();
                }
                return this;
            },
            removeClass: function(name) {
                for (var i = 0; i < this.length; i++) {
                    if (name == undefined) {
                        this[i].className = '';
                        return this;
                    }
                    var classList = this[i].className;
                    name.split(/\s+/g).forEach(function(cname) {
                        classList = classList.replace(classRE(cname), "");
                    });
                    if (classList.length > 0)
                        this[i].className = classList.trim();
                    else
                        this[i].className = "";
                }
                return this;
            },
            hasClass: function(name, element) {
                if (this.length === 0)
                    return false;
                if (!element)
                    element = this[0];
                return classRE(name).test(element.className);
            },
            bind: function(event, callback) {
                if (event === "" || event == undefined)
                    return;
                for (var i = 0; i < this.length; i++) {
                    (function(obj) {
                        
                        var id = obj._eventID ? obj._eventID : _eventID++;
                        obj._eventID = id;
                        var that = obj;
                        event.split(/\s+/g).forEach(function(name) {
                            var prxFn = function(event) {
                                event.originalEvent = event; //for backwards compatibility with jQuery...leh sigh
                                var result = callback.call(that, event);
                                if (result === false)
                                    event.preventDefault();
                                return result;
                            };
                            eventHandlers[id + "_" + name] = prxFn;
                            obj.addEventListener(name, prxFn, false);
                        });
                    })(this[i]);
                
                }
                return this;
            },
            unbind: function(event) {
                if (event === "" || event == undefined)
                    return;
                for (var i = 0; i < this.length; i++) {
                    (function(obj) {
                        var id = obj._eventID;
                        var that = obj;
                        event.split(/\s+/g).forEach(function(name) {
                            if (eventHandlers[id + "_" + name]) {
                                var prxFn = eventHandlers[id + "_" + name];
                                delete eventHandlers[id + "_" + name];
                                that.removeEventListener(name, prxFn, false);
                            }
                        });
                    })(this[i]);
                }
                
                return this;
            },
            trigger: function(event, data) {
                if (this.length === 0)
                    return this;
                if (typeof (event) === "string") {
                    var evtName = event;
                    var newEvent = document.createEvent("Event");
                    newEvent.type = evtName;
                    newEvent.target = this[0];
                    newEvent.initEvent(evtName, false, true);
                } 
                else
                    var newEvent = event;
                newEvent.data = data;
                this[0].dispatchEvent(newEvent);
                return this;
            },
            append: function(element, insert) {
                if (element && element.length != undefined && element.length === 0)
                    return this;
                if ($.isArray(element) || $.isObject(element))
                    element = $(element);
                var i;
                
                for (i = 0; i < this.length; i++) {
                    if (element.length && typeof element != "string") {
                        element = $(element);
                        for (var j = 0; j < element.length; j++)
                            insert != undefined ? this[i].insertBefore(element[j], this[i].firstChild) : this[i].appendChild(element[j]);
                    } 
                    else {
                        var obj = $(element).get();
                        
                        if (obj == undefined || obj.length == 0) {
                            obj = document.createTextNode(element);
                        }
                        if (obj.nodeName != undefined && obj.nodeName.toLowerCase() == "script" && (!obj.type || obj.type.toLowerCase() === 'text/javascript')) {
                            window.eval(obj.innerHTML);
                        } 
                        
                        else
                            insert != undefined ? this[i].insertBefore(obj, this[i].firstChild) : this[i].appendChild(obj);
                    }
                }
                return this;
            },
            prepend: function(element) {
                return this.append(element, 1);
            },
            get: function(index) {
                index = index == undefined ? 0 : index;
                if (index < 0)
                    index += this.length;
                return (this[index]) ? this[index] : undefined;
            },
            offset: function() {
                if (this.length === 0)
                    return undefined;
                var obj = this[0].getBoundingClientRect();
                return {
                    left: obj.left + window.pageXOffset,
                    top: obj.top + window.pageYOffset,
                    width: parseInt(this[0].style.width),
                    height: parseInt(this[0].style.height)
                };
            },
            parent: function(selector) {
                if (this.length == 0)
                    return undefined;
                var elems = [];
                for (var i = 0; i < this.length; i++) 
                {
                    if (this[i].parentNode)
                        elems.push(this[i].parentNode);
                }
                return this.setupOld($(unique(elems)).filter(selector));
            },
            children: function(selector) {
                
                if (this.length == 0)
                    return undefined;
                var elems = [];
                for (var i = 0; i < this.length; i++) 
                {
                    elems = elems.concat(siblings(this[i].firstChild));
                }
                return this.setupOld($((elems)).filter(selector));
            
            },
            siblings: function(selector) {
                if (this.length == 0)
                    return undefined;
                var elems = [];
                for (var i = 0; i < this.length; i++) 
                {
                    if (this[i].parentNode)
                        elems = elems.concat(siblings(this[i].parentNode.firstChild, this[i]));
                }
                return this.setupOld($(elems).filter(selector));
            },
            closest: function(selector, context) {
                if (this.length == 0)
                    return undefined;
                var elems = [], cur = this[0];
                
                var start = $(selector, context);
                if (start.length == 0)
                    return $();
                while (cur && start.indexOf(cur) == -1) {
                    cur = cur !== context && cur !== document && cur.parentNode;
                }
                return $(cur);
            
            },
            filter: function(selector) 
            {
                if (this.length == 0)
                    return undefined;
                
                if (selector == undefined)
                    return this;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var val = this[i];
                    if (val.parentNode && $(selector, val.parentNode).indexOf(val) >= 0)
                        elems.push(val);
                }
                return this.setupOld($(unique(elems)));
            },
            not: function(selector) {
                if (this.length == 0)
                    return undefined;
                var elems = [];
                for (var i = 0; i < this.length; i++) {
                    var val = this[i];
                    if (val.parentNode && $(selector, val.parentNode).indexOf(val) == -1)
                        elems.push(val);
                }
                return this.setupOld($(unique(elems)));
            },
            data: function(key, value) {
                return this.attr('data-' + key, value);
            },
            end: function() {
                return this.oldElement != undefined ? this.oldElement : $();
            },
            clone: function(deep) {
                if (this.length == 0)
                    return undefined;
                return this[0].cloneNode(deep);
            },
            size: function() {
                return this.length;
            }
        
        };


        /* AJAX functions */
        
        function empty() {
        }
        var ajaxSettings = {
            type: 'GET',
            beforeSend: empty,
            success: empty,
            error: empty,
            complete: empty,
            context: undefined,
            timeout: 0
        };
        
        $.jsonP = function(options) {
            var callbackName = 'jsonp_callback' + (++_jsonPID);
            var abortTimeout = "", 
            context;
            var script = document.createElement("script");
            var abort = function() {
                $(script).remove();
                if (window[callbackName])
                    window[callbackName] = empty;
            };
            window[callbackName] = function(data) {
                clearTimeout(abortTimeout);
                $(script).remove();
                delete window[callbackName];
                options.success.call(context, data);
            };
            script.src = options.url.replace(/=\?/, '=' + callbackName);
            $('head').append(script);
            if (options.timeout > 0)
                abortTimeout = setTimeout(function() {
                    options.error.call(context, "", 'timeout');
                }, options.timeout);
            return {};
        };
        
        $.ajax = function(opts) {
            var xhr;
            try {
                xhr = new window.XMLHttpRequest();
                var settings = opts || {};
                for (var key in ajaxSettings) {
                    if (!settings[key])
                        settings[key] = ajaxSettings[key];
                }
                
                if (!settings.url)
                    settings.url = window.location;
                if (!settings.contentType)
                    settings.contentType = "application/x-www-form-urlencoded";
                if (!settings.headers)
                    settings.headers = {};
                settings.headers = $.extend({
                    'X-Requested-With': 'XMLHttpRequest'
                }, settings.headers);
                if (!settings.dataType)
                    settings.dataType = "text/html";
                else {
                    switch (settings.dataType) {
                        case "script":
                            settings.dataType = 'text/javascript, application/javascript';
                            break;
                        case "json":
                            settings.dataType = 'application/json';
                            break;
                        case "xml":
                            settings.dataType = 'application/xml, text/xml';
                            break;
                        case "html":
                            settings.dataType = 'text/html';
                            break;
                        case "text":
                            settings.dataType = 'text/plain';
                            break;
                        default:
                            settings.dataType = "text/html";
                            break;
                        case "jsonp":
                            return $.jsonP(opts);
                            break;
                    }
                }
                if ($.isObject(settings.data))
                    settings.data = $.param(settings.data);
                if (settings.type.toLowerCase() === "get" && settings.data) {
                    if (settings.url.indexOf("?") === -1)
                        settings.url += "?" + settings.data;
                    else
                        settings.url += "&" + settings.data;
                }
                
                if (/=\?/.test(settings.url)) {
                    return $.jsonP(settings);
                }
                
                var abortTimeout;
                var context = settings.context;
                
                xhr.onreadystatechange = function() {
                    var mime = settings.dataType;
                    if (xhr.readyState === 4) {
                        clearTimeout(abortTimeout);
                        var result, error = false;
                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
                            if (mime === 'application/json' && !(/^\s*$/.test(xhr.responseText))) {
                                try {
                                    result = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    error = e;
                                }
                            } else
                                result = xhr.responseText;
                            if (error)
                                settings.error.call(context, xhr, 'parsererror', error);
                            else {
                                
                                settings.success.call(context, result, 'success', xhr);
                            }
                        } else {
                            error = true;
                            settings.error.call(context, xhr, 'error');
                        }
                        settings.complete.call(context, xhr, error ? 'error' : 'success');
                    }
                };
                xhr.open(settings.type, settings.url, true);
                
                if (settings.contentType)
                    settings.headers['Content-Type'] = settings.contentType;
                for (var name in settings.headers)
                    xhr.setRequestHeader(name, settings.headers[name]);
                if (settings.beforeSend.call(context, xhr, settings) === false) {
                    xhr.abort();
                    return false;
                }
                
                if (settings.timeout > 0)
                    abortTimeout = setTimeout(function() {
                        xhr.onreadystatechange = empty;
                        xhr.abort();
                        settings.error.call(context, xhr, 'timeout');
                    }, settings.timeout);
                xhr.send(settings.data);
            } 
            catch (e) {
                console.log(e);
            }
            return xhr;
        };
        $.get = function(url, success) {
            return this.ajax({
                url: url,
                success: success
            });
        };
        $.post = function(url, data, success, dataType) {
            if (typeof (data) === "function") {
                success = data;
                data = {};
            }
            if (dataType === undefined)
                dataType = "html";
            return this.ajax({
                url: url,
                type: "POST",
                data: data,
                dataType: dataType,
                success: success
            });
        };
        $.getJSON = function(url, data, success) {
            if (typeof (data) === "function") {
                success = data;
                data = {};
            }
            return this.ajax({
                url: url,
                data: data,
                success: success,
                dataType: "json"
            });
        };
        $.param = function(obj, prefix) {
            var str = [];
            if (obj instanceof $jqm) {
                obj.each(function() {
                    var k = prefix ? prefix + "[]" : this.id, 
                    v = this.value;
                    str.push((k) + "=" + encodeURIComponent(v));
                });
            } 
            else {
                for (var p in obj) {
                    var k = prefix ? prefix + "[" + p + "]" : p, 
                    v = obj[p];
                    str.push($.isObject(v) ? $.param(v, k) : (k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        };
        $.parseJSON = function(string) {
            return JSON.parse(string);
        };
        $.parseXML = function(string) {
            return (new DOMParser).parseFromString(string, "text/xml");
        };
        
        function detectUA($, userAgent) {
            $.os = {};
            $.os.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false;
            $.os.android = userAgent.match(/(Android)\s+([\d.]+)/) || userAgent.match(/Silk-Accelerated/) ? true : false;
            $.os.ipad = userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false;
            $.os.iphone = !$.os.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false;
            $.os.webos = userAgent.match(/(webOS|hpwOS)[\s\/]([\d.]+)/) ? true : false;
            $.os.touchpad = $.os.webos && userAgent.match(/TouchPad/) ? true : false;
            $.os.ios = $.os.ipad || $.os.iphone;
            $.os.blackberry = userAgent.match(/BlackBerry/) || userAgent.match(/PlayBook/) ? true : false;
            $.os.opera = userAgent.match(/Opera Mobi/) ? true : false;
            $.os.fennec = userAgent.match(/fennec/i) ? true : false;
        }
        detectUA($, navigator.userAgent);
        $.__detectUA = detectUA; //needed for unit tests
        if (typeof String.prototype.trim !== 'function') {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/, '');
            };
        }
        
        $.replace = function ( newElem, oldElem ) {
   		 	oldElem[0].parentNode.replaceChild(newElem, oldElem[0]);
        };
        
        return $;
    
    
    })(window);
    '$' in window || (window.$ = jq);
}