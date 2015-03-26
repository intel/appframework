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
            if (af(id).filter(".panel").length === 0) return;

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
            if(first.length===0)
                first=$(".view").eq(0);
            else
                throw ("You need to create a view");

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
                    that.goBack.bind(that);
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
