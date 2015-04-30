/*! intel-appframework - v3.0.0 - 2015-04-30 */

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
        $.os.ios7 = ($.os.ipad||$.os.iphone)&&(userAgent.match(/7_/)||userAgent.match(/8_/)) ? true : false;
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

/**
 * appframework.ui - A User Interface library for App Framework applications
 *
 * @copyright 2011-2014 Intel
 * @author Intel
 * @version 3.0
 */
/* global FastClick*/

 /* jshint camelcase:false*/
 

(function($) {
    "use strict";
    var startPath = window.location.pathname + window.location.search;
    var defaultHash = window.location.hash;
    var previousTarget = defaultHash;
    var AFUi = function() {
        // Init the page
        var that = this;


        if (typeof define === "function" && define.amd) {
            that.autoLaunch=false;
            define("appframeworkui", [], function() {
                return $.afui;
            });
        } else if (typeof module !== "undefined" && module.exports) {
            that.autoLaunch=false;
            $.afui = that;
        }

        var setupAFDom = function() {
            setupCustomTheme();
            if(window.FastClick)
                FastClick.attach(document.documentElement);
        };

        if (document.readyState === "complete" || document.readyState === "loaded") {
            setupAFDom();
            if(that.init)
                that.autoBoot();
            else{
                $(window).one("afui:init", function() {
                    that.autoBoot();
                });
            }
        } else $(document).ready(
            function() {
                setupAFDom();
                if(that.init)
                    that.autoBoot();
                else{
                    $(window).one("afui:init", function() {
                        that.autoBoot();
                    });
                }
            },
        false);

        //click back event
        window.addEventListener("popstate", function() {

            if(!that.useInternalRouting) return;
            var id = that.getPanelId(document.location.hash);
            var hashChecker = document.location.href.replace(document.location.origin + "/", "");
            //make sure we allow hash changes outside afui

            if (hashChecker === "#") return;
            if (id === "" && that.history.length === 1) //Fix going back to first panel and an empty hash
                id = "#" + that.firstPanel.id;
            if (id === "") return;
            if ($(id).filter(".panel").length === 0) return;

            if (id !== "#" + that.activeDiv.id) that.goBack();

        }, false);


        window.addEventListener("orientationchange",function(){
            window.scrollTo(0, 0);
        });

        function setupCustomTheme() {

            if (that.useOSThemes) {

                var $el=$(document.body);
                $el.removeClass("ios ios7 win8 tizen bb android light dark firefox");
                if ($.os.android)
                    $el.addClass("android");
                else if ($.os.ie) {
                    $el.addClass("win8");
                } else if ($.os.blackberry||$.os.blackberry10||$.os.playbook) {
                    $el.addClass("bb");
                    that.backButtonText = "Back";
                } else if ($.os.ios7){
                    $el.addClass("ios7");
                } else if ($.os.ios)
                    $el.addClass("ios7");
                else if($.os.tizen)
                    $el.addClass("tizen");
                else if($.os.fennec)
                    $el.addClass("firefox");
            }
            if($.os.ios7&&that.overlayStatusbar){
                that.ready(function(){
                    $(document.body).addClass("overlayStatusbar");
                });
            }
        }
    };


    var clickHandlers=[];
    AFUi.prototype = {
        init:false,
        showLoading: true,
        loadingText: "Loading Content",
        remotePages: {},
        history: [],
        views:{},
        _readyFunc: null,
        doingTransition: false,
        ajaxUrl: "",
        transitionType: "slide",
        firstPanel: "",
        hasLaunched: false,
        isLaunching:false,
        launchCompleted: false,
        activeDiv: "",
        customClickHandler: "",
        useOSThemes: true,
        overlayStatusbar: false,
        useAutoPressed: true,
        useInternalRouting:true,
        autoBoot: function() {
            this.hasLaunched = true;
            if (this.autoLaunch) {
                this.launch();
            }
        },
        /**
         * This blocks the page from bouncing on iOS
         * @api private
         */
        blockPageBounce:function(enable){
            if(enable===false){
                window.removeEventListener("touchmove",this.handlePageBounce,false);
                window.removeEventListener("touchstart",this.handlePageBounce,false);
                return;
            }

            window.addEventListener("touchmove",this.handlePageBounce,false);
            window.addEventListener("touchstart",this.handlePageBounce,false);

        },
        /**
         * Handle touch events for scrolling divs
         * @api private
         */
        handlePageBounce:function(evt){
            if(evt.type==="touchstart"){
                this._startTouchY=evt.touches[0].screenY;
                return;
            }
            var panel=$(evt.target).closest(".panel");
            if(panel.length===0) return evt.preventDefault();
            var el=panel.get(0);

            var canScroll=el.scrollHeight>el.clientHeight;
            var hasTouchOverflow=$(el).computedStyle("-webkit-overflow-scrolling")==="touch";
            var hasOverflow=$(el).computedStyle("overflowY")!=="hidden";
            var height=parseInt($(el).computedStyle("height"),10);
            if(canScroll&&hasTouchOverflow&&hasOverflow){

                var currY=evt.touches[0].screenY;
                var scrollAtTop=((this._startTouchY<=currY)&&(el.scrollTop===0));
                var scrollAtBottom=((this._startTouchY>=currY)&&((el.scrollHeight-el.scrollTop)===height));
                if(scrollAtTop||scrollAtBottom)
                    evt.preventDefault();
                return;
            }

        },
        /**
         * Register a data directive for a click event.  Plugins use this to allow
         * html based execution (see af.popup.js)
         ```
         $.afui.registerDataDirective("[data-foo]",function(){
            console.log("foo was clicked");
         })
         ```
         * @param {string} selector
         * @param {function} callback to execute
         * @title $.afui.registerDataDirective
         */
        registerDataDirective:function(selector,cb){
            clickHandlers.push({sel:selector,cb:cb});
        },
        /**
         * This enables the tab bar ability to keep pressed states on elements
           ```
           $.afui.enableTabBar();
           ```
           @title $.afui.enableTabBar
         */
        enableTabBar:function(){
            $(document).on("click",".button-grouped.tabbed",function(e){
                var $el=$(e.target);
                $el.closest(".tabbed").find(".button").data("ignore-pressed","true").removeClass("pressed");
                //this is a hack, but the touchEvents plugin will remove pressed
                $el.closest(".button").addClass("pressed");
                setTimeout(function(){
                    $el.closest(".button").addClass("pressed");
                });
            });
        },
         /**
         * This disables the tab bar ability to keep pressed states on elements
           ```
           $.afui.disableTabBar();
           ```
         * @title $.afui.disableTabBar
         */
        disableTabBar:function(){
            $(document).off("click",".button-grouped.tabbed");
            $(".button-grouped.tabbed .button").removeAttr("data-ignore-pressed");
        },

        /**
          * This is a boolean property.   When set to true, we manage history and update the hash
             ```
            $.afui.manageHistory=false;//Don't manage for apps using Backbone
            ```
          *@title $.afui.manageHistory
          */
        manageHistory: true,

        /**
         * This is a boolean property.  When set to true (default) it will load that panel when the app is started
           ```
           $.afui.loadDefaultHash=false; //Never load the page from the hash when the app is started
           $.afui.loadDefaultHash=true; //Default
           ```
         *@title $.afui.loadDefaultHash
         */
        loadDefaultHash: true,
        /**
         * This is a shorthand call to the $.actionsheet plugin.  We wire it to the afui div automatically
           ```
           $.afui.actionsheet("<a href='javascript:;' class='button'>Settings</a> <a href='javascript:;' class='button red'>Logout</a>")
           $.afui.actionsheet("[{
                        text: 'back',
                        cssClasses: 'red',
                        handler: function () { $.afui.goBack(); ; }
                    }, {
                        text: 'show alert 5',
                        cssClasses: 'blue',
                        handler: function () { alert("hi"); }
                    }, {
                        text: 'show alert 6',
                        cssClasses: '',
                        handler: function () { alert("goodbye"); }
                    }]");
           ```
         * @param {(string|Array.<string>)} links
         * @title $.afui.actionsheet()
         */
        actionsheet: function(opts) {
            return $.query(document.body).actionsheet(opts);
        },
        /**
         * This is a wrapper to $.popup.js plugin.  If you pass in a text string, it acts like an alert box and just gives a message
           ```
           $.afui.popup(opts);
           $.afui.popup( {
                        title:"Alert! Alert!",
                        message:"This is a test of the emergency alert system!! Don't PANIC!",
                        cancelText:"Cancel me",
                        cancelCallback: function(){console.log("cancelled");},
                        doneText:"I'm done!",
                        doneCallback: function(){console.log("Done for!");},
                        cancelOnly:false
                      });
           $.afui.popup('Hi there');
           ```
         * @param {(object|string)} options
         * @title $.afui.popup(opts)
         */
        popup: function(opts) {
            return $.query(document.body).popup(opts);
        },

        /**
         * This is a reference to the drawer plugin.
           ```
            $.afui.drawer.show('#left','left','reveal')
           ```
        * @param {string} id of drawer
        * @param {string} position (left|right)
        * @param {string} transition (push, cover, reveal)
        * @title $.afui.drawer.show
        */

         /**
         * This is a reference to the drawer plugin.
           ```
            $.afui.drawer.hide('#left','left')
           ```
        * @param {string} id of drawer
        * @param {string} position (left|right)
        * @title $.afui.drawer.hide
        */


        /**
         *This will throw up a mask and block the UI
         ```
         $.afui.blockUI(.9)
         ````
         * @param {number} opacity
         * @title $.afui.blockUI(opacity)
         */
        blockUI: function(opacity) {
            $.blockUI(opacity);
        },
        /**
         *This will remove the UI mask
         ```
         $.afui.unblockUI()
         ````
         * @title $.afui.unblockUI()
         */
        unblockUI: function() {
            $.unblockUI();
        },

        /**
         * Boolean if you want to auto launch afui
           ```
           $.afui.autoLaunch = false; //
           ```
         * @title $.afui.autoLaunch
         */
        autoLaunch: true,
        /**
         * function to fire when afui is ready and completed launch
           ```
           $.afui.ready(function(){console.log('afui is ready');});
           ```
         * @param {function} param function to execute
         * @title $.afui.ready
         */
        ready: function(param) {
            if (this.launchCompleted)
                param();
            else {
                $(document).one("afui:ready", function() {
                    param();
                });
            }
        },

        /**
         * Initiate a back transition
           ```
           $.afui.goBack()
           ```

         * @title $.afui.goBack()
         * @param {number=} delta relative position from the last element (> 0)
         */
        goBack: function(e) {
            //find the view
            var view=$(this.activeDiv).closest(".view");
            if(e&&e.target)
                view=$(e.target).closest(".view");

            if(view.length===0) return;

            //history entry
            if(!this.views[view.prop("id")]) return;
            var hist=this.views[view.prop("id")];

            if(hist.length===0) return;
            var item=hist.pop();

            if(item.length===0) return;
            if(hist.length>0){

                var toTarget=hist[hist.length-1].target;
                if(!toTarget||item.target===toTarget) return;
                this.runTransition(item.transition,item.target,toTarget,true);
                this.loadContentData(toTarget,view,true);

                this.updateHash(toTarget.id);
            }
            else {
                //try to dismiss the view
                try{
                    this.dismissView(item.target,item.transition);
                }
                catch(ex){
                }

            }
        },
        /**
         * Clear the history queue for the current view based off the active div
           ```
           $.afui.clearHistory()
           ```

         * @title $.afui.clearHistory()
         */
        clearHistory: function() {
            //find the view
            var view=this.findViewTarget(this.activeDiv);
            this.views[view.prop("id")]=[];
            this.setBackButtonVisibility(false);
        },

        /**
         * PushHistory
           ```
           $.afui.pushHistory(previousPage, newPage, transition, hashExtras)
           ```
         * @api private
         * @title $.afui.pushHistory()
         */
        pushHistory: function(previousPage, newPage, transition, hashExtras) {
            //push into local history


            //push into the browser history
            try {
                if (!this.manageHistory) return;
                window.history.pushState(newPage, newPage, startPath + "#" + newPage + hashExtras);
                $(window).trigger("hashchange", null, {
                    newUrl: startPath + "#" + newPage + hashExtras,
                    oldUrl: startPath + previousPage
                });
            } catch (e) {}
        },


        /**
         * Updates the current window hash
         *
         * @param {string} newHash New Hash value
         * @title $.afui.updateHash(newHash)
         * @api private
         */
        updateHash: function(newHash) {
            if (!this.manageHistory) return;
            newHash = newHash.indexOf("#") === -1 ? "#" + newHash : newHash; //force having the # in the begginning as a standard
            previousTarget = newHash;

            var previousHash = window.location.hash;
            var panelName = this.getPanelId(newHash).substring(1); //remove the #
            try {
                window.history.replaceState(panelName, panelName, startPath + newHash);
                $(window).trigger("hashchange", null, {
                    newUrl: startPath + newHash,
                    oldUrl: startPath + previousHash
                });
            } catch (e) {}
        },
        /**
        * gets the panel name from an hash
        * @api private
        */
        getPanelId: function(hash) {
            var firstSlash = hash.indexOf("/");
            return firstSlash === -1 ? hash : hash.substring(0, firstSlash);
        },

        /**
        * set the back button text
           ```
           $.afui.setBackButtonText("about");
           ```
        * @param {string} text
        * @title $.afui.setBackButtonText(title)
        */
        setBackButtonText:function(text){
            $(this.activeDiv).closest(".view").find("header .backButton").html(text);
        },
        /**
         * Set the title of the active header from
         ```
         $.afui.setTitle("New Title")
         ```
         * @param {string|object} String or DOM node to get the title from
         * @title $.afui.setTitle
         */
        setTitle:function(item){
            //find the header
            var title="";
            if(typeof(item)==="string"){
                title=item;
                item=$(this.activeDiv).closest(".view");
            }
            else if($(item).attr("data-title"))
                title=$(item).attr("data-title");
            else if($(item).attr("title"))
                title=$(item).attr("title");

            if(title)
                $(item).closest(".view").children("header").find("h1").html(title);

        },
        /**
         * Get the title of the active header
         ```
         $.afui.getTitle()
         ```
         * @title $.afui.getTitle
         */
        getTitle:function(){
            return $(this.activeDiv).closest(".view").children("header").find("h1").html();
        },
         /**
         * Set the visibility of the back button for the current header
         ```
         $.afui.setBackButtonVisbility(true)
         ```
         * @param {boolean} Boolean to set the visibility. true show, false hide
         * @title $.afui.setBackButtonVisbility
         */
        setBackButtonVisibility:function(what){
            var visibility=what?"visible":"hidden";
            $(this.activeDiv).closest(".view").children("header").find(".backButton").css("visibility",visibility);
        },

        /**
         * Update a badge on the selected target.  Position can be
            bl = bottom left
            tl = top left
            br = bottom right
            tr = top right (default)
           ```
           $.afui.updateBadge("#mydiv","3","bl","green");
           ```
         * @param {string} target
         * @param {string} value
         * @param {string=} position
         * @param {(string=|object)} color Color or CSS hash
         * @title $.afui.updateBadge(target,value,[position],[color])
         */
        updateBadge: function(target, value, position, color) {
            if (position === undefined) position = "";

            var $target = $(target);
            var badge = $target.find("span.af-badge");

            if (badge.length === 0) {
                if ($target.css("position") !== "absolute") $target.css("position", "relative");
                badge = $.create("span", {
                    className: "af-badge " + position,
                    html: value
                });
                $target.append(badge);
            } else badge.html(value);
            badge.removeClass("tl bl br tr");
            badge.addClass(position);
            if (color === undefined)
                color = "red";
            if ($.isObject(color)) {
                badge.css(color);
            } else if (color) {
                badge.css("background", color);
            }
            badge.data("ignore-pressed", "true");


        },
        /**
         * Removes a badge from the selected target.
           ```
           $.afui.removeBadge("#mydiv");
           ```
         * @param {string} target
         * @title $.afui.removeBadge(target)
         */
        removeBadge: function(target) {
            $(target).find("span.af-badge").remove();
        },
        /**
         * Show the loading mask with specificed text
           ```
           $.afui.showMask()
           $.afui.showMask('Fetching data...')
           ```

         * @param {string=} text
         * @title $.afui.showMask(text);
         */
        showMask: function(text) {
            if (!text) text = this.loadingText || "";
            $.query("#afui_mask>h1").html(text);
            $.query("#afui_mask").show();
        },
        /**
         * Hide the loading mask
            ```
            $.afui.hideMask();
            ```
         * @title $.afui.hideMask();
         */
        hideMask: function() {
            $.query("#afui_mask").hide();
        },
        /**
         * @api private
         */

        dismissView:function(target,transition){
            transition=transition.replace(":dismiss","");
            var theView=$(target).closest(".view");
            this.runTransition(transition,theView,null,true,$(target.hash).addClass("active").closest(".view"));
            //this.activeDiv=target;
            this.activeDiv=$(".view").not(theView).find(".panel.active").get(0);
            this.updateHash(this.activeDiv.id);
        },
        /**
         * This is called to initiate a transition or load content via ajax.
         * We can pass in a hash+id or URL.
           ```
           $.afui.loadContent("#main",false,false,"up");
           ```
         * @param {string} target
         * @param {boolean=} newtab (resets history)
         * @param {boolean=} go back (initiate the back click)
         * @param {string=} transition
         * @param {object=} anchor
         * @title $.afui.loadContent(target, newTab, goBack, transition, anchor);
         * @api public
         */
        loadContent: function(target, newView, back, transition, anchor) {

            if (this.doingTransition) {
                return;
            }

            if (target.length === 0) return;
            if(target.indexOf("#")!==-1){
                this.loadDiv(target, newView, back, transition,anchor);
            }
            else{
                this.loadAjax(target, newView, back, transition,anchor);
            }
        },
        /**
         * This is called internally by loadContent.  Here we are loading a div instead of an Ajax link
           ```
           $.afui.loadDiv("#main",false,false,"up");
           ```
         * @param {string} target
         * @param {boolean=} newview (resets history)
         * @param {boolean=} back Go back (initiate the back click)
         * @param {string=} transition
         * @title $.afui.loadDiv(target,newTab,goBack,transition);
         * @api private
         */
        loadDiv: function(target, newView, back, transition,anchor) {
            // load a div
            var newDiv = target;

            var hashIndex = newDiv.indexOf("#");
            var slashIndex = newDiv.indexOf("/");
            if ((slashIndex !== -1)&&(hashIndex !== -1)) {
                //Ignore everything after the slash in the hash part of a URL
                //For example: app.com/#panelid/option1/option2  will become -> app.com/#panelid
                //For example: app.com/path/path2/path3  will still be -> app.com/path/path2/path3
                if (slashIndex > hashIndex) {
                    newDiv = newDiv.substr(0, slashIndex);
                }
            }
            newDiv = newDiv.replace("#", "");

            newDiv = $.query("#" + newDiv).get(0);
            if (!newDiv) {
                $(document).trigger("missingpanel", null, {missingTarget: target});
                this.doingTransition=false;
                return;
            }

            if (newDiv === this.activeDiv && !back) {
                //toggle the menu if applicable
                this.doingTransition=false;
                return;
            }

            this.transitionType = transition;

            var view=this.findViewTarget(newDiv);
            var previous=this.findPreviousPanel(newDiv,view);



            //check current view
            var currentView;
            if(anchor){
                currentView=this.findViewTarget(anchor);
            }
            else
                currentView=this.findViewTarget(this.activeDiv);

            //Check if we are dealing with the same view

            var isSplitViewParent=(currentView&&currentView.get(0)!==view.get(0)&&currentView.closest(".splitview").get(0)===view.closest(".splitview").get(0)&&currentView.closest(".splitview").length!==0);
            if(isSplitViewParent){
                newView=false;
            }
            $(newDiv).trigger("panelbeforeload");
            $(previous).trigger("panelbeforeunload");
            var isNewView=false;
            //check nested views
            if(!isSplitViewParent)
                isSplitViewParent=currentView.parent().closest(".view").length===1;

            if(isSplitViewParent&&currentView&&currentView.get(0)!==view.get(0))
                $(currentView).trigger("nestedviewunload");


            if(!isSplitViewParent&&(newView||currentView&&currentView.get(0)!==view.get(0))){
                //Need to transition the view
                newView=currentView||newView;
                this.runViewTransition(transition,view,newView,newDiv,back);

                this.updateViewHistory(view,newDiv,transition,target);
                isNewView=true;
            }
            else{
                this.runTransition(transition,previous, newDiv, back);
                this.updateViewHistory(view,newDiv,transition,target);
            }

            //Let's check if it has a function to run to update the data
            //Need to call after parsePanelFunctions, since new headers can override
            this.loadContentData(newDiv,view,false,isNewView);

        },
        /**
         * @api private
         */
        findViewTarget:function(panel){
            var view=$(panel).closest(".view");
            if(!view) return false;
            if(!this.views[view.prop("id")])
                this.views[view.prop("id")]=[];
            return view;
        },
       /**
         * @api private
         */
        findPreviousPanel:function(div,view){
            var item=$(view).find(">.pages .panel.active").not(div);
            if(item.length===0)
                item=$(view).find(">.pages .panel:first-of-type");
            return item.get(0);
        },
        /**
         * This is called internally by loadDiv.  This sets up the back button in the header and scroller for the panel
           ```
           $.afui.loadContentData("#main",false,false,"up");
           ```
         * @param {string} target
         * @param {boolean=} newtab (resets history)
         * @param {boolean=} go back (initiate the back click)
         * @title $.afui.loadContentData(target,newTab,goBack);
         * @api private
         */
        loadContentData: function(what,view,back,isNewView) {
            this.activeDiv = what;
            this.setTitle(what,view,back,isNewView);
            this.showBackButton(view,isNewView);
            this.setActiveTab(what,view);
        },

        /**
         * Set the active tab in the footer
         ```
         $.afui.setActiveTab("main",currView)
         ```
         @param {string|Node} id or DOM node for footer tab
         @param {Node} DOM node of the current view to set the footer
         @title $.afui.setActiveTab
         */
        setActiveTab:function(ele,view){
            var elementId;
            if(typeof(ele)!=="string")
                elementId=$(ele).prop("id");
            /*
            Check if an item exists:
            Note that footer hrefs' may point to elements preceded by a # when trying to load a div (f.ex.: <footer><a href="#panelId">).
            But in some other cases footer hrefs' may point to elements not preceded by a #
                F.ex.: <footer><a href="ajaxRequest"> when doing ajax calls
                F.ex.: <footer><a href="listX/itemY"> when using pushState routers - read more here: https://github.com/01org/appframework/issues/837
            We check whether an item exists including both options here (note the &&):
            */
            if((view.find("footer").find("a").filter("[href='"+elementId+"']").length===0)&&(view.find("footer").find("a").filter("[href='#"+elementId+"']").length===0)) return;
            var tmp = view.find("footer").find("a").removeClass("pressed").attr("data-ignore-pressed","true");
            /*
            Now we need to activate the elementId. We have to do this twice again. Once in case of loading a div using AF's router and once again in case of pushState routers or loading Ajax.
            */
            //In case of an Ajax call or if using a pushState router:
            tmp.filter("[href='"+elementId+"']").addClass("pressed");
            //In case of an loading a div with AF's internal router:
            tmp.filter("[href='#"+elementId+"']").addClass("pressed");
        },

         /**
         * Show or hide the back button
         ```
         $.afui.showBackButton(view,isNewView)
         ```
         @param {Node} DOM node of current view
         @param {boolean} Are we loading a new view (hide the back button)
         @title $.afui.showBackButton
         */
        showBackButton:function(view,isNewView) {
            var items=(this.views[view.prop("id")].length);
            var hdr=view.children("header");
            if(hdr.length===0) return;

            if(items>=2&&isNewView!==true){
                //Add the back button if it's not there
                if(hdr.find(".backButton").length===1) return;
                hdr.prepend("<a class='backButton back'>Back</a>");
            }
            else {
                hdr.find(".backButton").remove();
            }
        },
        /**
         * This is called internally by loadContent.  Here we are using Ajax to fetch the data
           ```
           $.afui.loadDiv("page.html",false,false,"up");
           ```
         * @param {string} target
         * @param {boolean=} newtab (resets history)
         * @param {boolean=} go back (initiate the back click)
         * @param {string=} transition
         * @param {object=} anchor
         * @title $.afui.loadDiv(target,newTab,goBack,transition);
         * @api private
         */
        loadAjax: function(target, newTab, back, transition, anchor) {
            var that=this;
            var crc=crc32(target);
            var found=$(".panel[data-crc='"+crc+"']");
            var forceRefresh=anchor.getAttribute("data-refresh");

            if(found.length>0){

                if(forceRefresh){
                    that.showLoading&&that.showMask("Loading Content");
                    $.ajax(target).then(function(res){
                        found.html(res);
                        that.showLoading&&that.hideMask();
                        return that.loadContent("#"+found.prop("id"),newTab,back,transition,anchor);
                    });
                }
                else
                    return that.loadContent("#"+found.prop("id"),newTab,back,transition,anchor);
            }
            that.showLoading&&that.showMask("Loading Content");
            $.ajax(target).then(function(res){
                var $res=$.create("div",{html:res});
                if(!$res.hasClass(".panel")){
                    $res=$res.attr("data-title",(target));
                    $res.prop("id",crc);
                    $res.addClass("panel");
                }
                else {
                    $res=$res.find(".panel");
                }
                $(that.activeDiv).closest(".pages").append($res);
                $res.attr("data-crc",crc);
                that.showLoading&&that.hideMask();
                that.loadContent("#"+$res.prop("id"),newTab,back,transition,anchor);
            }).fail(function(res){
                that.showLoading&&that.hideMask();
                console.log("Error with ajax request",res);
            });

        },
        /**
         * This executes the transition for the panel
            ```
            $.afui.runTransition(transition,oldDiv,currDiv,back)
            ```
         * @api private
         * @title $.afui.runTransition(transition,oldDiv,currDiv,back)
         */
        runTransition: function(transition,previous,target, back,noTrans) {

            if(!transition)
                transition="slide";

            if(transition.indexOf(":back")!==-1){
                transition=transition.replace(":back","");
                back=true;
            }

            var that=this;
            var show=back?previous:target;
            var hide=back?target:previous;
            var doPush=false;
            if(transition.indexOf("-reveal")!==-1){
                transition=transition.replace("-reveal","");
                doPush=true;
            }


            $(show).css("zIndex","10");
            $(hide).css("zIndex","1");
            $(noTrans).css("zIndex","1").addClass("active");

            var from=$(hide).animation().remove(transition+"-in");
            if(!doPush&&from){
                if(back)
                    from.reverse();
                from.end(function(){
                    if(!back){
                        this.classList.remove("active");
                        $(this).trigger("panelunload");
                    }
                    else{

                        this.classList.add("active");
                        $(this).trigger("panelload");
                    }
                    that.doingTransition=false;
                }).run(transition+"-out");
            }
            else {
                if(!back){
                    $(hide).trigger("panelunload");
                }
                else{
                    $(hide).trigger("panelload");
                    $(hide).addClass("activeDiv");

                }
            }

            var to=$(show).animation().remove(transition+"-out");
            if(back)
                to.reverse();
            to.end(function(){
                that.doingTransition=false;
                if(!back){

                    this.classList.add("active");
                    $(this).trigger("panelload");
                    $(noTrans).trigger("panelload");
                }
                else{
                    if(noTrans){
                        $(noTrans).css("zIndex","10");

                    }

                    this.classList.remove("active");
                    $(this).trigger("panelunload");
                }
            }).run(transition+"-in");
        },

         /**
         * This executes the transition of a view
            ```
            $.afui.runViewTransition(transition,view, active, newDiv,back)
            ```
         * @api private
         * @title $.afui.runViewTransition(transition,view, active, newDiv,back)
         */
        runViewTransition:function(transition,view,active,newDiv,back){
            //find the active

            view.addClass("active");
            //view.find(".panel").removeClass("active");
            $(newDiv).addClass("active");

            if(transition==="none"){
                this.doingTransition=false;

                setTimeout(function(){
                    active.removeClass("active");
                    //Try to add the active class again (even though in most cases the class will already be set).
                    //This solves an issue when swapping panels A->B->A by QUICKLY tapping footer buttons on slow devices.
                    //Under these circumstances the timeout sometimes comes after the active classes to panels A and B have been set.
                    //You may end up having no active panels (blank page).
                    view.addClass("active");
                    $(newDiv).addClass("active");
                },50);

                return;
            }
            this.runTransition(transition,active,view,back,newDiv);
        },
         /**
         * This updates the history of the view cache
            ```
            $.afui.updateViewHistory(view, div, transition, target)
            ```
         * @param {Node} DOM node for view
         * @param {Node} DOM node for div adding to the history
         * @param {string} string for the transition
         * @param {string} string of the hash for the div
         * @api private
         * @title $.afui.updateViewHistory(view, div, transition, target)
         */

        updateViewHistory:function(view,div,transition,target){
            var ref=this.views[view.prop("id")];
            if(!ref)
                ref=this.views[view.prop("id")]=[];
            if(ref.length>=1&&ref[ref.length-1].target===div) return;
            //pushHistory: function(previousPage, newPage, transition, hashExtras) {)
            this.pushHistory(div.id,div.id,transition,target.replace(div.id,"").replace("#",""));
            this.views[view.prop("id")].push({
                target:div,
                transition:transition
            });
        },

        /**
         * This is callled when you want to launch afui.  If autoLaunch is set to true, it gets called on DOMContentLoaded.
         * If autoLaunch is set to false, you can manually invoke it.
           ```
           $.afui.autoLaunch=false;
           $.afui.launch();
           ```
         * @title $.afui.launch();
         */
        launch: function() {
            if (this.hasLaunched === false || this.launchCompleted) {
                this.hasLaunched = true;
                return;
            }
            if(this.isLaunching)
                return true;
            this.isLaunching=true;
            this.blockPageBounce();
            var that = this;

            var maskDiv = $.create("div", {
                id: "afui_mask",
                className: "ui-loader",
                html: "<span class='ui-icon ui-icon-loading spin'></span><h1>Loading Content</h1>"
            }).css({
                "z-index": 20000,
                display: "none"
            });
            document.body.appendChild(maskDiv.get(0));
            //setup modalDiv
            //get first div, defer

            var first=$(".view[data-default='true']");
            if(first.length===0) {
                first=$(".view").eq(0);
                
                if(first.length===0)
                    throw ("You need to create a view");
            }

            first.addClass("active");
            //history
            this.views[first.prop("id")]=[];
            var firsthash=window.location.hash;
            var firstPanel=first.find(".panel[data-selected='true']").length===0?first.find(".panel").eq(0):first.find(".panel[data-selected='true']");
            firstPanel.addClass("active");
            this.activeDiv=firstPanel.get(0);
            this.views[first.prop("id")].push({
                target:firstPanel.get(0),
                transition:this.transitionType
            });
            this.defaultPanel=firstPanel.get(0);
            this.loadContentData(firstPanel.get(0),first,false,true);
            this.updateHash(firstPanel.get(0).id);

            if(this.loadDefaultHash){
                //delay launch so events can be registered/handled

                setTimeout(function(){
                    this.loadContent(firsthash,false,0,"none");

                }.bind(this));
            }
            this.enableTabBar();

            $(document).on("click", "a", function(e) {
                if(that.useInternalRouting)
                    checkAnchorClick(e, e.currentTarget);
            });

            /**
             * This is our data directive processor
             */
            $(document).on("click",function(e){

                var len=clickHandlers.length;
                var $el=$(e.target);
                for(var i=0;i<len;i++){
                    var handler=clickHandlers[i];
                    var checker=$el.closest(handler.sel);
                    if(checker.length>0)
                        handler.cb.call(that,checker.get(0),e);
                }
            });

            $(document).on("click", ".backButton, [data-back]", function() {
                if(that.useInternalRouting)
                    that.goBack(that);
            });
            //Check for includes

            var items=$("[data-include]");
            if(items.length===0){
                this.launchCompleted=true;
                $(document).trigger("afui:ready");
            }
            else{
                var deferred=[];
                items.each(function(){
                    var url=this.getAttribute("data-include");
                    var self=$(this);
                    deferred.push($.get(url,function(res){
                        self.append(res);
                    }));
                });
                $.when.apply($,deferred).then(function(){
                    this.launchCompleted=true;
                    $(document).trigger("afui:ready");
                }).fail(function(){
                    this.launchCompleted=true;
                    $(document).trigger("afui:ready");
                });
            }

            $(document).on("click","footer a:not(.button)",function(e){
                var $item=$(e.target);
                var footer=$item.closest("footer");
                $item.parent().find("a:not(.button)").attr("data-ignore-pressed","true").removeClass("pressed");
                if(footer.attr("data-ignore-pressed")==="true") return;
                $item.addClass("pressed");
            });
        }

        /**
         * END
         * @api private
         */
    };


    //lookup for a clicked anchor recursively and fire UI own actions when applicable
    var checkAnchorClick = function(e, theTarget) {
        theTarget=theTarget||e.currentTarget;
        if (theTarget === document) {
            return;
        }
        var custom = (typeof $.afui.customClickHandler === "function") ? $.afui.customClickHandler : false;
        if (custom !== false) {
            if ($.afui.customClickHandler(theTarget.getAttribute("href"),e)) return e.preventDefault();

        }
        
        //this technique fails when considerable content exists inside anchor, should be recursive ?
        if (theTarget.tagName.toLowerCase() !== "a" && theTarget.parentNode) return checkAnchorClick(e, theTarget.parentNode); //let's try the parent (recursive)
        //anchors
        if (theTarget.tagName !== "undefined" && theTarget.tagName.toLowerCase() === "a") {
            if (theTarget.href.toLowerCase().indexOf("javascript:") !== -1 || theTarget.getAttribute("data-ignore")) {
                return;
            }

            /* IE 10 fixes*/

            var href = theTarget.href,
                prefix = location.protocol + "//" + location.hostname + ":" + location.port + location.pathname;
            if (href.indexOf(prefix) === 0) {
                href = href.substring(prefix.length);
            }
            //empty links
            if (href === "#" || (href.indexOf("#") === href.length - 1) || (href.length === 0 && theTarget.hash.length === 0)) return e.preventDefault();

            //internal links
            //http urls
            var urlRegex=/^((http|https|file):\/\/)/;
            //only call prevent default on http/fileurls.  If it's a protocol handler, do not call prevent default.
            //It will fall through to the ajax call and fail
            if(theTarget.href.indexOf(":") !== -1 &&urlRegex.test(theTarget.href))
                e.preventDefault();

            var mytransition = theTarget.getAttribute("data-transition");
            if(!mytransition&&$(theTarget).closest("footer").length>0)
                mytransition="none";

            if(mytransition&&mytransition.indexOf(":dismiss")!==-1){
                return $.afui.dismissView(theTarget,mytransition);
            }
            href = theTarget.hash.length > 0 ? theTarget.hash : href;
            $.afui.loadContent(href, false, 0, mytransition, theTarget);
            return;
        }
    };

    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D"; /* Number */
    var crc32 = function( /* String */ str, /* Number */ crc) {
        if (crc === undefined) crc = 0;
        var n = 0; //a number between 0 and 255
        var x = 0; //an hex number
        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            n = (crc ^ str.charCodeAt(i)) & 0xFF;
            x = "0x" + table.substr(n * 9, 8);
            crc = (crc >>> 8) ^ x;
        }
        return (crc ^ (-1))>>>0;
    };

    $.afui = new AFUi();
    $.afui.init=true;

    $(window).trigger("afui:preinit");
    $(window).trigger("afui:init");
})(jQuery);

/**
 * af.actionsheet - an actionsheet for html5 mobile apps
 * Copyright 2014 - Intel
 */
/* EXAMPLE
  You can pass in an HTML string that will get rendered

  $(document.body).actionsheet('<a >Back</a><a onclick="alert(\'hi\');" >Show Alert 3</a><a onclick="alert(\'goodbye\');">Show Alert 4</a>');

  You can also use an arra of objects to show each item.  There are three propertyes
    text - the text to display
    cssClasses - extra css classes
    handler - click handler function

  $(document.body).actionsheet(
    [{
        text: 'back',
        cssClasses: 'red',
        handler: function () {
            $.ui.goBack();
        }
    }, {
        text: 'show alert 5',
        cssClasses: 'blue',
        handler: function () {
            alert("hi");
        }
    }, {
        text: 'show alert 6',
        cssClasses: '',
        handler: function () {
            alert("goodbye");
        }
    }]
  );

 */
 
(function($) {
    "use strict";
    $.fn.actionsheet = function(opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new actionsheet(this[i], opts);
        }
        return this.length === 1 ? tmp : this;
    };
    var actionsheet = function(elID, opts) {
        if (typeof elID === "string" || elID instanceof String) {
            this.el = document.getElementById(elID);
        } else {
            this.el = elID;
        }
        if (!this.el) {
            window.alert("Could not find element for actionsheet " + elID);
            return;
        }

        if (this instanceof actionsheet) {
            if (typeof(opts) === "object") {
                for (var j in opts) {
                    this[j] = opts[j];
                }
            }
        } else {
            return new actionsheet(elID, opts);
        }

        var markStart = "<div id='af_actionsheet'><div style='width:100%'>";
        var markEnd = "</div></div>";
        var markup;
        var noop=function(){};
        if (typeof opts === "string") {
            markup = $(markStart + opts + "<a href='javascript:;' class='cancel'>Cancel</a>" + markEnd);
        } else if (typeof opts === "object") {
            markup = $(markStart + markEnd);
            var container = $(markup.children().get(0));
            opts.push({
                text: "Cancel",
                cssClasses: "cancel"
            });
            for (var i = 0; i < opts.length; i++) {
                var item = $("<a href='javascript:;'>" + (opts[i].text || "TEXT NOT ENTERED") + "</a>");
                item[0].onclick = (opts[i].handler || noop);
                if (opts[i].cssClasses && opts[i].cssClasses.length > 0)
                    item.addClass(opts[i].cssClasses);
                container.append(item);
            }
        }
        $(elID).find("#af_actionsheet").remove();
        $(elID).find("#af_action_mask").remove();
        $(elID).append(markup);

        markup.vendorCss("Transition", "all 0ms");
        this.el.style.overflow = "hidden";
        markup.on("click", "a", this.sheetClickHandler.bind(this));
        this.activeSheet = markup;
        markup.cssTranslate("0," + ((markup.height())) + "px");
        $(elID).append("<div id='af_action_mask' style='position:absolute;top:0px;left:0px;right:0px;bottom:0px;z-index:9998;background:rgba(0,0,0,.4)'/>");
        setTimeout(function() {
            markup.vendorCss("Transition", "all 300ms");
            markup.cssTranslate("0,0");
        }, 10);
        $("#af_action_mask").bind("touchstart touchmove touchend click",function(e){
            e.preventDefault();
            e.stopPropagation();
        });

    };
    actionsheet.prototype = {
        activeSheet: null,
        sheetClickHandler:function(){
            this.hideSheet();
            return false;
        },
        hideSheet: function() {
            this.activeSheet.off("click", "a", this.sheetClickHandler);
            $(this.el).find("#af_action_mask").unbind("click").remove();
            this.activeSheet.vendorCss("Transition", "all 0ms");
            var markup = this.activeSheet;
            var theEl = this.el;
            setTimeout(function() {
                markup.vendorCss("Transition", "all 300ms");
                markup.cssTranslate("0,"+(markup.height()+60)+"px");
                setTimeout(function() {
                    markup.remove();
                    markup = null;
                    theEl.style.overflow = "none";
                }, 350);
            }, 10);
        }
    };
    $.afui.actionsheet=function(opts){
        return $(document.body).actionsheet(opts);
    };
})(jQuery);

/** 
 * This plugin creates a "grow" transition using scaling and transforms
 * @author Ian Maffett
 * @copyright 2014 Intel
 */


(function($){
    "use strict";


    $.afui.registerDataDirective("[data-grower]",function(item,e){
        var $el=$(item).closest("[data-grower]");
        var items=$el.offset();
        var view=$el.closest(".view");
        var toPanel=e.target.hash||$el.attr("data-grower");
        view.css("zIndex","1");
        var growView=$(toPanel).closest(".view");

        var scaleX=($el.width()/window.innerWidth);
        var scaleY=($el.height()/window.innerHeight);

        var transProps={
            left:items.left,
            top:items.top,
            x:scaleX,
            y:scaleY
        };
        $(toPanel).trigger("panelgrowstart",[$el.get(0)]);
        growView.addClass("active").css("zIndex","10");
        growView.vendorCss("TransformOrigin","0 0");
        growView.data("growTransProps",transProps);
        growView.vendorCss("TransitionDuration","0");
        growView.vendorCss("Transform","translate3d("+items.left+"px,"+items.top+"px,0) scale("+scaleX+","+scaleY+")");
        growView.data("growTarget",$el.closest(".panel"));
        growView.data("growFrom",$(toPanel).attr("id"));
        $.afui.loadContent(toPanel,view,false,"stretch");
        $(toPanel).one("panelload",function(){
            growView.vendorCss("Transform","");
            $(toPanel).trigger("panelgrowcomplete",[$el.get(0)]);
        });
    });

    $.afui.registerDataDirective("[data-grower-back]",function(item){

        var growView=$(item).closest(".view");
        var fromPanel=$("#"+growView.data("growFrom"));
        fromPanel.trigger("panelgrowendstart");
        var trans=growView.data("growTransProps");
        var toPanel="#"+growView.data("growTarget").prop("id");
        $(toPanel).closest(".view").addClass("active");
        growView.addClass("animation-active");

        growView.transition().end(function(){
            growView.removeClass("active");
            fromPanel.trigger("panelgrowendstart");
            $.afui.loadContent(toPanel,false,false,"none");
        }).run("translate3d("+trans.left+"px,"+trans.top+"px,0) scale("+trans.x+","+trans.y+")","300ms");
    });
})(jQuery);
//Touch events are based from zepto/touch.js
//Many modifications and enhancements made
/**
 * Simply include this in your project to get access to the following touch events on an element
 * tap
 * doubleTap
 * singleTap
 * longPress
 * swipe(Left,Right,Up,Down)
* swipeStart(Left,Right,Up,Down)
 */

(function($) {
    "use strict";
    var touch = {}, touchTimeout;

    function parentIfText(node) {
        return "tagName" in node ? node : node.parentNode;
    }

    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            return (x1 - x2 > 0 ? "Left" : "Right");
        } else {
            return (y1 - y2 > 0 ? "Up" : "Down");
        }
    }

    var longTapDelay = 750;
    function longTap() {
        if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
            touch.el.trigger("longTap");
            touch = {};
        }
    }
    var swipeCounter;
    var longTapTimer;
    var parentChecker=false;
    var didParentCheck=false;
    $(document).ready(function() {
        var prevEl;
        $(document.body).bind("touchstart", function(e) {
            swipeCounter=0;
            if (e.originalEvent)
                e = e.originalEvent;
            if (!e.touches || e.touches.length === 0) return;
            var now = Date.now(), delta = now - (touch.last || now);
            if (!e.touches || e.touches.length === 0) return;
            touch.el = $(parentIfText(e.touches[0].target));
            touchTimeout && clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            touch.x2 = touch.y2 = 0;
            if (delta > 0 && delta <= 250)
                touch.isDoubleTap = true;
            touch.last = now;
            longTapTimer = setTimeout(longTap, longTapDelay);

            if ($.afui.useAutoPressed && !touch.el.attr("data-ignore-pressed"))
                touch.el.addClass("pressed");
            if (prevEl && $.afui.useAutoPressed && !prevEl.attr("data-ignore-pressed") && prevEl[0] !== touch.el[0])
                prevEl.removeClass("pressed");
            prevEl = touch.el;
            parentChecker=false;
            didParentCheck=false;
        }).bind("touchmove", function(e) {
            if(e.originalEvent)
                e = e.originalEvent;
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
            if(!didParentCheck&&(Math.abs(touch.x2-touch.x1)>5||Math.abs(touch.y2-touch.y1)>5))
            {
                var moveX=Math.abs(touch.x2-touch.x1)>5;
                var moveY=Math.abs(touch.y2-touch.y1)>5;

                didParentCheck=true;
                touch.el.trigger("swipeStart",[e]);
                touch.el.trigger("swipeStart" + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)), [touch,e]);
                var parentContainers=touch.el.closest(".swipe, .swipe-reveal, .swipe-x, .swipe-y");
                var elScroller=touch.el.closest(".x-scroll, .y-scroll, .scroll");


                parentChecker=touch.el.closest(".swipe, .swipe-reveal").length!==0;
                if(elScroller.parent(parentContainers).length!==0)
                {
                    parentChecker=false;
                }
                else if(moveX&&touch.el.closest(".swipe-x").length!==0)
                    parentChecker=true;
                else if(moveY&&touch.el.closest(".swipe-y").length!==0)
                    parentChecker=true;
            }

            if($.os.android){
                if(didParentCheck&&parentChecker)
                    e.preventDefault();
            }
            clearTimeout(longTapTimer);
        }).bind("touchend", function(e) {
            if(e.originalEvent)
                e=e.originalEvent;
            if (!touch.el)
                return;
            if ($.afui.useAutoPressed && !touch.el.attr("data-ignore-pressed"))
                touch.el.removeClass("pressed");
            if (touch.isDoubleTap) {
                touch.el.trigger("doubleTap");
                touch = {};
            } else if ((touch.x2 > 0 || touch.y2 > 0) && (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30)) {
                touch.el.trigger("swipe");
                //touch.el.trigger("swipe" + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)), touch);
                //@TODO - don't dispatch when you need to block it (scrolling areas)
                var direction= (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2));
                var scrollDir=".x-scroll";
                var swipeDir=".swipe-x";
                if(direction.toLowerCase()==="up"||direction.toLowerCase()==="down"){
                    scrollDir=".y-scroll";
                    swipeDir=".swipe-y";
                }
                var swipe=touch.el.closest(swipeDir);
                var scroller=touch.el.closest(scrollDir);

                if((swipe.length===0||scroller.length===0)||swipe.find(scroller).length===0)
                {
                    touch.el.trigger("swipe"+direction);
                }

                touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
            } else if ("last" in touch) {
                touch.el.trigger("tap");
                touchTimeout = setTimeout(function() {
                    touchTimeout = null;
                    if (touch.el)
                        touch.el.trigger("singleTap");
                    touch = {};
                }, 250);
            }

        }).bind("touchcancel", function() {
            if(touch.el && $.afui.useAutoPressed && !touch.el.attr("data-ignore-pressed"))
                touch.el.removeClass("pressed");
            touch = {};
            clearTimeout(longTapTimer);
        });
    });

    ["swipe", "swipeLeft", "swipeRight", "swipeUp", "swipeDown", "doubleTap", "tap", "singleTap", "longTap"].forEach(function(m) {
        $.fn[m] = function(callback) {
            return this.bind(m, callback);
        };
    });
})(jQuery);

/**
 * af.animateheader
 * @copyright Intel 2014
 *
 */

(function($){
    "use strict";
    //animate the headers on transtion
    var oldTitle=$.afui.setTitle;
    $.afui.animateHeader=function(what){
        if(what!==false){
            $.afui.setTitle=function(item,view,back,newView){

                var title;
                if(typeof(item)==="string"){
                    title=item;
                }
                else if($(item).attr("data-title"))
                    title=$(item).attr("data-title");
                else if($(item).attr("title"))
                    title=$(item).attr("title");

                if(!title||title.length===0) return;

                var header=$(this.activeDiv).closest(".view").children("header").eq(0);
                var cssClass=back?"header-unload":"header-load";

                var old=header.find("h1").eq(0).html();

                //update the current header h1 so we keep the DOM node for events, etc
                header.find("h1").eq(0).html(title).removeClass("header-unload header-load");
                if(newView) return;
                header.find("h1").animation().run(cssClass+"-to");

                //append a second for animation
                var second=$("<h1>"+old+"</h1>");
                header.append(second);
                second.animation().end(function(){
                    $(this).remove();
                }).run(cssClass);
            };
        }
        else{
            $.afui.setTitle=oldTitle;
        }
    };

})(jQuery);
/**
 * af.popup - a popup/alert library for html5 mobile apps
 * copyright Indiepath 2011 - Tim Fisher
 * Modifications/enhancements by Intel for App Framework
 *
 */
/* EXAMPLE
 $.query("body").popup({
        title:"Alert! Alert!",
        message:"This is a test of the emergency alert system!! Don't PANIC!",
        cancelText:"Cancel me",
        cancelCallback: function(){console.log("cancelled");},
        doneText:"I'm done!",
        doneCallback: function(){console.log("Done for!");},
        cancelOnly:false,
        doneClass:'button',
        cancelClass:'button',
        onShow:function(){console.log("showing popup");}
        autoCloseDone:true, //default is true will close the popup when done is clicked.
        suppressTitle:false //Do not show the title if set to true
  });

  You can programatically trigger a close by dispatching a "close" event to it.

 $.query("body").popup({title:'Alert',id:'myTestPopup'});
 $("#myTestPopup").trigger("close");

 */

(function ($) {
    "use strict";
    $.fn.popup = function (opts) {
        return new popup(this[0], opts);
    };
    var queue = [];
    var popup = function (containerEl, opts) {

        if (typeof containerEl === "string" || containerEl instanceof String) {
            this.container = document.getElementById(containerEl);
        } else {
            this.container = containerEl;
        }
        if (!this.container) {
            window.alert("Error finding container for popup " + containerEl);
            return;
        }

        try {
            if (typeof (opts) === "string" || typeof (opts) === "number")
                opts = {
                    message: opts,
                    cancelOnly: "true",
                    cancelText: "OK"
                };
            this.id = opts.id = opts.id || $.uuid(); //opts is passed by reference
            this.addCssClass = opts.addCssClass ? opts.addCssClass : "";
            this.suppressTitle = opts.suppressTitle || this.suppressTitle;
            this.title = opts.suppressTitle ? "" : (opts.title || "Alert");
            this.message = opts.message || "";
            this.cancelText = opts.cancelText || "Cancel";
            this.cancelCallback = opts.cancelCallback || function () {};
            this.cancelClass = opts.cancelClass || "button";
            this.doneText = opts.doneText || "Done";
            this.doneCallback = opts.doneCallback || function () {
                // no action by default
            };
            this.doneClass = opts.doneClass || "button";
            this.cancelOnly = opts.cancelOnly || false;
            this.onShow = opts.onShow || function () {};
            this.autoCloseDone = opts.autoCloseDone !== undefined ? opts.autoCloseDone : true;

            queue.push(this);
            if (queue.length === 1)
                this.show();
        } catch (e) {
            console.log("error adding popup " + e);
        }

    };

    popup.prototype = {
        id: null,
        addCssClass: null,
        title: null,
        message: null,
        cancelText: null,
        cancelCallback: null,
        cancelClass: null,
        doneText: null,
        doneCallback: null,
        doneClass: null,
        cancelOnly: false,
        onShow: null,
        autoCloseDone: true,
        suppressTitle: false,
        show: function () {
            var self = this;
            var markup = "<div id='" + this.id + "' class='afPopup hidden "+ this.addCssClass + "'>"+
                        "<header>" + this.title + "</header>"+
                        "<div>" + this.message + "</div>"+
                        "<footer>"+
                             "<a href='javascript:;' class='" + this.cancelClass + "' id='cancel'>" + this.cancelText + "</a>"+
                             "<a href='javascript:;' class='" + this.doneClass + "' id='action'>" + this.doneText + "</a>"+
                             "<div style='clear:both'></div>"+
                        "</footer>"+
                        "</div>";

            var $el=$(markup);
            $(this.container).append($el);
            $el.bind("close", function () {
                self.hide();
            });

            if (this.cancelOnly) {
                $el.find("A#action").hide();
                $el.find("A#cancel").addClass("center");
            }
            $el.find("A").each(function () {
                var button = $(this);
                button.bind("click", function (e) {
                    if (button.attr("id") === "cancel") {
                        self.cancelCallback.call(self.cancelCallback, self);
                        self.hide();
                    } else {
                        self.doneCallback.call(self.doneCallback, self);
                        if (self.autoCloseDone)
                            self.hide();
                    }
                    e.preventDefault();
                });
            });
            self.positionPopup();
            $.blockUI(0.5);

            $el.bind("orientationchange", function () {
                self.positionPopup();
            });

            //force header/footer showing to fix CSS style bugs
            $el.find("header").show();
            $el.find("footer").show();
            setTimeout(function(){
                $el.removeClass("hidden").addClass("show");
                self.onShow(self);
            },50);
        },

        hide: function () {
            var self = this;
            $.query("#" + self.id).addClass("hidden");
            $.unblockUI();
            if(!$.os.ie&&!$.os.android){
                setTimeout(function () {
                    self.remove();
                }, 250);
            }
            else
                self.remove();
        },

        remove: function () {
            var self = this;
            var $el = $.query("#" + self.id);
            $el.unbind("close");
            $el.find("BUTTON#action").unbind("click");
            $el.find("BUTTON#cancel").unbind("click");
            $el.unbind("orientationchange").remove();
            queue.splice(0, 1);
            if (queue.length > 0)
                queue[0].show();
        },

        positionPopup: function () {
            var popup = $.query("#" + this.id);

            popup.css("top", ((window.innerHeight / 2.5) + window.pageYOffset) - (popup[0].clientHeight / 2) + "px");
            popup.css("left", (window.innerWidth / 2) - (popup[0].clientWidth / 2) + "px");
        }
    };
    var uiBlocked = false;
    $.blockUI = function (opacity) {
        if (uiBlocked)
            return;
        opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
        $.query("BODY").prepend($("<div id='mask'" + opacity + "></div>"));
        $.query("BODY DIV#mask").bind("touchstart", function (e) {
            e.preventDefault();
        });
        $.query("BODY DIV#mask").bind("touchmove", function (e) {
            e.preventDefault();
        });
        uiBlocked = true;
    };

    $.unblockUI = function () {
        uiBlocked = false;
        $.query("BODY DIV#mask").unbind("touchstart");
        $.query("BODY DIV#mask").unbind("touchmove");
        $("BODY DIV#mask").remove();
    };


    $.afui.registerDataDirective("[data-alert]",function(item){
        var $item=$(item);
        var message=$item.attr("data-message");
        if(message.length===0) return;
        $(document.body).popup(message);
    });

    $.afui.popup=function(opts){
        return $(document.body).popup(opts);
    };

})(jQuery);

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

/**
 * af.splashscreen 
 * @copyright Intel 2014 
 * 
 */
(function($){
    "use strict";
    $.afui.ready(function(){
        //delay to hide the splashscreen
        setTimeout(function(){
            $("#splashscreen").remove();
        },250);
    });
})(jQuery);
/**
 * af.drawer
 * @copyright Intel 2014
 *
 */

(function($){
    "use strict";
    var activePosition=null;
    var activeEl;
    function Drawer(){
        return this;
    }

    var transitionTypes = {
        push:function(elem,reverse,position){
            var item=$(elem).closest(".view").children().filter(":not(nav):not(aside)");
            position=position||activePosition;
            for(var i=0;i<item.length;i++){
                var anim=$(item[i]).show().animation();
                if(reverse){
                    anim.remove("slide-"+position+"-out").reverse();
                }
                else
                    anim.keep();

                anim.run("slide-"+position+"-out");
            }

        },
        cover:function(){},
        reveal:function(elem,reverse){
            return this.push(elem,reverse);
        }
    };


    Drawer.prototype= {
        defaultTransition:"slide",
        defaultAnimation:"cover",
        isTransitioning:false,
        autoHide:function(event){
            event.preventDefault();
            this.hide();
        },
        checkViewToClose:function(e){
            this.autoHide(e);
        },
        autoHideCheck:null,
        selfCheckViewToClose:null,
        show:function(id,position,animation){
            if(this.isTransitioning) return;
            var self=this;
            activePosition=position==="right"?"right":"left";
            animation=transitionTypes[animation]?animation:this.defaultAnimation;
            var currEl=document.getElementById(id.replace("#",""));
            if(!currEl) return;
            //Let"s find the view
            activeEl=currEl;
            if(currEl.classList.contains("active")) {
                return;
            }
            this.isTransitioning=true;
            this.autoHideCheck=this.autoHide.bind(this);
            $(currEl).closest(".view").children().filter(":not(nav):not(aside)").off("touchstart",this.autoHideCheck);
            currEl.classList.add(activePosition);
            //Let"s remove the other animation types
            var anim=$(currEl).show();
            var other=activePosition==="right"?"left":"right";


            if($(currEl).closest(".view").find(".slide-"+other+"-out").length>0){
                $(currEl).closest(".view").find(".slide-"+other+"-out").removeClass("slide-"+other+"-out");
                $(currEl).closest(".view").find("aside.active, nav.active").removeClass("left right active").hide();
            }
            if(animation!=="reveal"){
                anim.css("zIndex","999").animation().run("slide-"+activePosition+"-in").end(function(){
                    this.classList.add("active");
                    self.isTransitioning=false;
                });
            }
            else {
                anim.animation().run("blank").end(function(){
                    $(this).css("zIndex","999");
                    this.classList.add("active");
                    self.isTransitioning=false;
                });
            }
            currEl.activeAnimation=animation;
            currEl.activePosition=activePosition;
            currEl.toggled=true;
            transitionTypes[animation](currEl,false);
            //fix bug with synthetic events bubbling up
            setTimeout(function(){
                $(currEl).closest(".view").children().filter(":not(nav):not(aside)").on("touchstart",self.autoHideCheck);
            });
            this.selfCheckViewToClose=self.checkViewToClose.bind(this);
            $(currEl).bind("nestedviewunload",this.selfCheckViewToClose);
        },
        hide:function(id,position){
            if(this.isTransitioning) return;
            var self=this;
            var currEl=id&&document.getElementById(id.replace("#",""))||activeEl;
            $(currEl).unbind("nestedviewunload",this.selfCheckViewToClose);

            if(!currEl||!currEl.toggled) return;
            $(currEl).closest(".view").children().filter(":not(nav):not(aside)").off("touchstart",this.autoHideCheck);
            var activePosition=position||currEl.activePosition;
            var anim=$(currEl).animation();
            if(currEl.activeAnimation==="reveal")
                $(currEl).css("zIndex","1");
            var theTransition=currEl.activeAnimation==="reveal"?"blank":"slide-"+activePosition+"-in";
            anim.reverse().reRun(theTransition).end(function(){
                this.classList.remove("active");
                this.classList.remove(activePosition);
                this.style.display="none";
                this.style.zIndex="";
                self.isTransitioning=false;
            });


            if(transitionTypes[currEl.activeAnimation]){
                transitionTypes[currEl.activeAnimation](currEl,true);
            }
            currEl.toggled=false;
            activeEl=null;
        }
    };

    $.afui.drawer =new Drawer();



    //Register the handler for opening

    $.afui.registerDataDirective("[data-left-menu]:not([data-menu-close]),[data-right-menu]:not([data-menu-close])",function(item){
        var $item=$(item);
        var position=$item.attr("data-left-menu")?"left":"right";
        var obj=position==="left"?$item.attr("data-left-menu"):$item.attr("data-right-menu");
        var transition=$item.attr("data-transition");
        this.drawer.show(obj,position,transition);
    });

    //Register the handler for closing
    $.afui.registerDataDirective("[data-menu-close]",function(item){
        var $item=$(item);
        var position=null;
        if($item.attr("data-left-menu"))
            position="left";
        if($item.attr("data-right-menu"))
            position="right";
        var obj=position==="left"?$item.attr("data-left-menu"):$item.attr("data-right-menu");
        if(!obj)
        {
            //Am i dismissing from a drawer?
            obj=$(item).closest("nav").prop("id");
            //let"s find the visible item in the container
            if(!obj||obj.length===0)
                obj=$(item).closest(".view").find("nav.active,aside.active").prop("id");
        }
        this.drawer.hide(obj,position);
    });

})(jQuery);
/**
 * af.swipereveal
 * @copyright Intel 2014
 *
 */
(function($){
    "use strict";

    //Register the handler for opening
    var target;
    var pos=0;
    var end;
    var width;
    $.afui.swipeThreshold=0.3;
    $(document).on("swipeStartLeft",".swipe-reveal",function(e,touch,originalE){

        originalE.preventDefault();
        target=$(e.target).closest(".swipe-content");
        pos=touch.x2;
        width=target.closest(".swipe-reveal").find(".swipe-hidden").width();
        if($.getCssMatrix(e.target).e!==0)
            return ;

        target.bind("touchmove",tracker);
        target.one("touchend",function(){
            target.unbind("touchmove",tracker);
            if(Math.abs(end)/width<$.afui.swipeThreshold)
            {
                width=0;
            }
            target.transition().keep().end(function(){
                width=null;
                target=null;
            }).run("translate3d("+(-width)+"px,0px,0)","100ms");
        });
    });

    $(document).on("swipeStartRight",".swipe-reveal",function(e,touch,originalE){
        originalE.preventDefault();
        target=$(e.target).closest(".swipe-content");

        width=target.closest(".swipe-reveal").find(".swipe-hidden").width();
        if($.getCssMatrix(e.target).e===0)
            return ;
        pos=touch.x2+width;
        target.bind("touchmove",tracker);
        target.one("touchend",function(){
            target.unbind("touchmove",tracker);
            if((1-Math.abs(end)/width)>$.afui.swipeThreshold)
            {
                width=0;
            }
            target.transition().keep().end(function(){
                width=null;
                target=null;
            }).run("translate3d("+(-width)+"px,0px,0)","100ms");
        });
    });


    var tracker=function(e){
        var to=-(pos-(e.touches[0].pageX));
        if((to)<-width)
            to="-"+width;
        else if(to>0)
            to=0;
        end=to;

        target.cssTranslate(to+"px,0");
    };

})(jQuery);
/**
 * desktopBrowsers contributed by Carlos Ouro @ Badoo
 * translates desktop browsers events to touch events and prevents defaults
 * It can be used independently in other apps but it is required for using the touchLayer in the desktop
 *
 * @param {Function} $ The appframework selector function
 */
 
(function ($) {
    "use strict";
    var cancelClickMove = false;
    //See if we can create a touch event
    var tmp;
    if($.os.supportsTouch) return;
    try {
        tmp = document.createEvent("TouchEvent");
        return;
    } catch (ex) {

    }
    $.os.supportsTouch=true;
    var preventAll = function (e) {
        e.preventDefault();
        e.stopPropagation();
    };
    var ieThreshold=navigator.userAgent.match(/Phone/i)?2:7;
    /**
     * Stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
     *
     * @param {Event} event
     * @param {HTMLElement} target
     */
    var preventAllButInputs = function(event, target) {
        var tag = target.tagName.toUpperCase();
        if (tag.indexOf("SELECT") > -1 || tag.indexOf("TEXTAREA") > -1 || tag.indexOf("INPUT") > -1) {
            return;
        }
        preventAll(event);
    };



    var redirectMouseToTouch = function (type, originalEvent, newTarget,skipPrevent) {

        var theTarget = newTarget ? newTarget : originalEvent.target;
        if(!skipPrevent)
            preventAllButInputs(originalEvent, theTarget);

        var touchevt = document.createEvent("MouseEvent");

        touchevt.initEvent(type, true, true);
        touchevt.initMouseEvent(type, true, true, window, originalEvent.detail, originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY, originalEvent.ctrlKey, originalEvent.shiftKey, originalEvent.altKey, originalEvent.metaKey, originalEvent.button, originalEvent.relatedTarget);
        touchevt.touches=  new $.feat.TouchList();
        touchevt.changedTouches = new $.feat.TouchList();
        touchevt.targetTouches = new $.feat.TouchList();
        var thetouch=new $.feat.Touch();
        thetouch.pageX=originalEvent.pageX;
        thetouch.pageY=originalEvent.pageY;
        thetouch.target=originalEvent.target;
        touchevt.changedTouches._add(thetouch);
        if (type !== "touchend") {
            touchevt.touches = touchevt.changedTouches;
            touchevt.targetTouches = touchevt.changedTouches;
        }
        //target

        touchevt.mouseToTouch = true;
        if ($.os.ie) {
            // handle inline event handlers for target and parents (for bubbling)
            var elem = originalEvent.target;
            while (elem !== null) {
                if (elem.hasAttribute("on" + type)) {
                    eval(elem.getAttribute("on" + type));
                }
                elem = elem.parentElement;
            }
        }
        theTarget.dispatchEvent(touchevt);
    };

    var mouseDown = false,
        lastTarget = null,
        prevX=0,
        prevY=0;
    if (!window.navigator.msPointerEnabled) {

        document.addEventListener("mousedown", function (e) {
            mouseDown = true;
            lastTarget = e.target;
            if (e.target.nodeName.toLowerCase() === "a" && e.target.href.toLowerCase() === "javascript:;")
                e.target.href = "#";
            redirectMouseToTouch("touchstart", e);
            cancelClickMove = false;
            prevX=e.clientX;
            prevY=e.clientY;
        }, true);

        document.addEventListener("mouseup", function (e) {
            if (!mouseDown) return;
            redirectMouseToTouch("touchend", e, lastTarget); //bind it to initial mousedown target
            lastTarget = null;
            mouseDown = false;
        }, true);

        document.addEventListener("mousemove", function (e) {
            if(e.clientX===prevX&&e.clientY===prevY) return;
            if (!mouseDown) return;
            redirectMouseToTouch("touchmove", e, lastTarget);
            cancelClickMove = true;
        }, true);
    } else { //Win8
        var skipMove=false;
        document.addEventListener("MSPointerDown", function (e) {
            mouseDown = true;
            skipMove=true;
            lastTarget = e.target;
            if (e.target.nodeName.toLowerCase() === "a" && e.target.href.toLowerCase() === "javascript:;")
                e.target.href = "";
            redirectMouseToTouch("touchstart", e,null,true);
            cancelClickMove = false;
            prevX=e.clientX;
            prevY=e.clientY;
            return true;
        }, true);

        document.addEventListener("MSPointerUp", function (e) {
            if (!mouseDown) return;
            redirectMouseToTouch("touchend", e, lastTarget,true); // bind it to initial mousedown target
            lastTarget = null;
            mouseDown = false;
            return true;
        }, true);
        document.addEventListener("MSPointerMove", function (e) {
            //IE is very flakey...we need 7 pixel movement before we trigger it

            if(Math.abs(e.clientX-prevX)<=ieThreshold||Math.abs(e.clientY-prevY)<=ieThreshold) return;
            if (!mouseDown) return;
            redirectMouseToTouch("touchmove", e, lastTarget,true);

            cancelClickMove = true;
            return true;
        }, true);
    }

    // prevent all mouse events which don't exist on touch devices
    document.addEventListener("drag", preventAll, true);
    document.addEventListener("dragstart", preventAll, true);
    document.addEventListener("dragenter", preventAll, true);
    document.addEventListener("dragover", preventAll, true);
    document.addEventListener("dragleave", preventAll, true);
    document.addEventListener("dragend", preventAll, true);
    document.addEventListener("drop", preventAll, true);
    // Allow selection of input elements
    document.addEventListener("selectstart", function(e){
        preventAllButInputs(e, e.target);
    }, true);
    document.addEventListener("click", function (e) {
        if (!e.mouseToTouch && e.target === lastTarget) {
            preventAll(e);
        }
        if (cancelClickMove) {
            preventAll(e);
            cancelClickMove = false;
        }
    }, true);
})(jQuery,window);



 

(function ($) {
    "use strict";
    $.fn.toast = function (opts) {
        return new Toast(this[0], opts);
    };
    var Toast = (function () {
        var Toast = function (containerEl, opts) {

            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                window.alert("Error finding container for toast " + containerEl);
                return;
            }
            if (typeof (opts) === "string" || typeof (opts) === "number") {
                opts = {
                    message: opts
                };
            }
            this.addCssClass = opts.addCssClass ? opts.addCssClass : "";
            this.message = opts.message || "";
            this.delay=opts.delay||this.delay;
            this.position=opts.position||"";
            this.addCssClass+=" "+this.position;
            this.type=opts.type||"";
            //Check if the container exists
            this.container=$(this.container);
            if(this.container.find(".afToastContainer").length===0)
            {
                this.container.append("<div class='afToastContainer'></div>");
            }
            this.container=this.container.find(".afToastContainer");
            this.container.removeClass("tr br tl bl tc bc").addClass(this.addCssClass);
            if(opts.autoClose===false)
                this.autoClose=false;
            this.show();
        };

        Toast.prototype = {
            addCssClass: null,
            message: null,
            delay:5000,
            el:null,
            container:null,
            timer:null,
            autoClose:true,
            show: function () {
                var self = this;
                var markup = "<div  class='afToast "+this.type+"'>"+
                            "<div>" + this.message + "</div>"+
                            "</div>";
                this.el=$(markup).get(0);
                this.container.append(this.el);
                var $el=$(this.el);
                var height=this.el.clientHeight;
                $el.addClass("hidden");
                setTimeout(function(){
                    $el.css("height",height);
                    $el.removeClass("hidden");
                },20);
                if(this.autoClose){
                    this.timer=setTimeout(function(){
                        self.hide();
                    },this.delay);
                }
                $el.bind("click",function(){
                    self.hide();
                });
            },

            hide: function () {
                var self = this;
                clearTimeout(this.timer);
                $(this.el).unbind("click").addClass("hidden");
                $(this.el).css("height","0px");
                if(!$.os.ie&&!$.os.android){
                    setTimeout(function () {
                        self.remove();
                    }, 300);
                }
                else
                    self.remove();
            },

            remove: function () {
                var $el = $(this.el);
                $el.remove();
            }
        };
        return Toast;
    })();


    $.afui.toast=function(opts){
        $(document.body).toast(opts);
    };

    $.afui.registerDataDirective("[data-toast]",function(item){
        var $item=$(item);
        var message=$item.attr("data-message")||"";
        if(message.length===0) return;
        var position=$item.attr("data-position")||"tr";
        var type=$item.attr("data-type");
        var autoClose=$item.attr("data-auto-close")==="false"?false:true;
        var delay=$item.attr("data-delay")||0;
        var opts={
            message:message,
            position:position,
            delay:delay,
            autoClose:autoClose,
            type:type
        };
        $(document.body).toast(opts);
    });

})(jQuery);

/**
 * af.lockscreen - a lockscreen for html5 mobile apps
 * Copyright 2015 - Intel
 */
 
 /* global FastClick*/

 /* jshint camelcase:false*/


(function($){
    "use strict";

    $.fn.lockScreen = function(opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new LockScreen(this[i], opts);
        }
        return this.length === 1 ? tmp : this;
    };

    var LockScreen = function (containerEl, opts) {
        if (typeof(opts) === "object") {
            for (var j in opts) {
                this[j] = opts[j];
            }
        }
    };
    LockScreen.prototype= {
        logo:"<div class='icon database big'></div>",
        roundKeyboard:false,
        validatePassword:function(){},
        renderKeyboard:function(){
            var html="";
            for(var i=0;i<8;i=i+3){
                html+="<div class='row'>";
                for(var j=1;j<=3;j++){
                    var num=i+j;
                    html+="<div data-key='"+num+"'>"+num+"</div>";
                }
                html+="</div>";
            }
            html+="<div class='row'><div data-key='' class='grey blank'>&nbsp;</div><div data-key='0'>0</div><div data-key='delete' class='grey'><=</div></div>";
            return html;
        },
        show: function () {
            if(this.visible) return;
            var logo=this.logo;
            var container="<div class='content flexContainer'><div class='password'>"+logo+"<input maxlength=4 type='password' placeholder='****' disabled></div><div class='error'>Invalid Password</div></div>";
            container+="<div class='keyboard flexContainer'>"+this.renderKeyboard()+"</div>";
            var item=$("<div id='lockScreen'/>");
            item.html(container);
            if(this.roundKeyboard){
                item.addClass("round");
                item.find("input[type='password']").attr("placeholder",("◌◌◌◌"));
            }
            this.lockscreen=item;
            $(document.body).append(item);
            var pass=$("#lockScreen input[type='password']");
            var self=this;
            $(item).on("click",function(evt){
                var target=$(evt.target);
                if(target.length===0) return;
                var key=target.attr("data-key");
                if(!key) return;
                if(key==="delete"){
                    pass.val(pass.val().substring(0,pass.val().length-1));
                    return;
                }
                var len=pass.val().length;

                if(len<4)
                    pass.val(pass.val()+key);
                if(pass.val().length===4){
                    if(self.validatePassword(pass.val()))
                        self.hide();
                    else {
                        self.lockscreen.find(".error").css("visibility","visible");
                        setTimeout(function(){
                            self.lockscreen.find(".error").css("visibility","hidden");
                            pass.val("");
                        },1000);
                    }
                }
            });
            $(item).on("touchstart",function(evt){
                $(evt.target).addClass("touched");
            }).on("touchend",function(evt){
                 $(evt.target).removeClass("touched");
            });
        },
        hide:function(){
            if(this.lockscreen)
                this.lockscreen.remove();
        }
    };
})(jQuery);
