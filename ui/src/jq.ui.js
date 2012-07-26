/**
 * jq.ui - A User Interface library for creating jqMobi applications
 * 
 * @copyright 2011
 * @author AppMobi
 */(function($) {
    
    var hasLaunched = false;
    var startPath = window.location.pathname;
    var defaultHash = window.location.hash;
    var previousTarget = defaultHash;
    var ui = function() {
        // Init the page
        var that = this;
		
		//setup the menu and boot touchLayer
	    jq(document).ready(function() {
			//setup the menu
	        if (jq("nav").length > 0) {
	            jq("#jQUi #header").addClass("hasMenu off");
	            jq("#jQUi #content").addClass("hasMenu off");
	            jq("#jQUi #navbar").addClass("hasMenu off");
	        }
			//boot touchLayer
			//TODO: touchLayer should be initiated here, but requires jQUI element to exist
			//if $.ui.launch can optionally create the jQUI object, we should had that option here somehow...
	        jQUi = document.getElementById("jQUi");
			$.touchLayer(jQUi);
	    });
		
        if (window.AppMobi)
            document.addEventListener("appMobi.device.ready", function(){that.autoBoot();}, false);
        else if (document.readyState == "complete" || document.readyState == "loaded") {
            this.autoBoot();
        } else 
            document.addEventListener("DOMContentLoaded", function(){that.autoBoot();}, false);
			
        if (!window.AppMobi)
            AppMobi = {}, AppMobi.webRoot = "";
			
		//click back event
        window.addEventListener("popstate", function() {
			that.goBack();
        }, false);
		
        /**
         * Helper function to setup the transition objects
         * Custom transitions can be added via $.ui.availableTransitions
           ```
           $.ui.availableTransitions['none']=function();
           ```
         */
         this.availableTransitions = {};
         this.availableTransitions['default'] =this.availableTransitions['none'] = this.noTransition;
    };
    
    
    ui.prototype = {
        isAppMobi: false,
        titlebar: "",
        navbar: "",
        header: "",
        viewportContainer: "",
        backButton: "",
        remotePages: {},
        history: [],
        homeDiv: "",
        screenWidth: "",
        content: "",
        modalWindow: "",
        customFooter: false,
        defaultFooter: "",
        customMenu: false,
        defaultMenu: "",
        _readyFunc: null,
        doingTransition: false,
        passwordBox: jq.passwordBox ? new jq.passwordBox() : false,
        selectBox: jq.selectBox ? jq.selectBox : false,
        ajaxUrl: "",
        transitionType: "slide",
        scrollingDivs: [],
        firstDiv: "",
        remoteJSPages: {},
        hasLaunched: false,
        launchCompleted: false,
        activeDiv: "",
		menuAnimation: null,
		togglingSideMenu:false,
		
		autoBoot: function(){
            this.hasLaunched = true;
            if (this.autoLaunch) {
                this.launch();
            }
		},
        css3animate: function(el, opts) {
            return jq(el).css3Animate(opts);
        },
        /**
         * this is a boolean when set to true (default) it will load that panel when the app is started
           ```
           $.ui.loadDefaultHash=false; //Never load the page from the hash when the app is started
           $.ui.loadDefaultHash=true; //Default
           ```
         *@title $.ui.loadDefaultHash
         */
        loadDefaultHash:true,
        
        /**
         * This is a boolean that when set to true will add "&cache=_rand_" to any ajax loaded link
           ```
           $.ui.useAjaxCacheBuster=true;
           ```
          *@title $.ui.useAjaxCacheBuster
          */
        useAjaxCacheBuster:false,
        /**
         * This is a shorthand call to the jq.actionsheet plugin.  We wire it to the jQUi div automatically
           ```
           $.ui.actionsheet("<a href='javascript:;' class='button'>Settings</a> <a href='javascript:;' class='button red'>Logout</a>")
           $.ui.actionsheet("[{
                        text: 'back',
                        cssClasses: 'red',
                        handler: function () { $.ui.goBack(); ; }
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
         * @param {String,Array} links
         * @title $.ui.actionsheet()
         */
        actionsheet: function(opts) {
            return jq("#jQUi").actionsheet(opts);
        },
        /**
         * This is a wrapper to jq.popup.js plugin.  If you pass in a text string, it acts like an alert box and just gives a message
           ```
           $.ui.popup(opts);
           $.ui.popup( {
                        title:"Alert! Alert!",
                        message:"This is a test of the emergency alert system!! Don't PANIC!",
                        cancelText:"Cancel me", 
                        cancelCallback: function(){console.log("cancelled");},
                        doneText:"I'm done!",
                        doneCallback: function(){console.log("Done for!");},
                        cancelOnly:false
                      });
           $.ui.popup('Hi there');
           ```
         * @param {Object|String} options
         * @title $.ui.popup(opts)
         */
        popup: function(opts) {
            return $("#jQUi").popup(opts);
        },
        
        /**
         *This will throw up a mask and block the UI
         ```
         $.ui.blockUI(.9)
         ````
         * @param {Float} opacity
         * @title $.ui.blockUI(opacity)
         */
        blockUI: function(opacity) {
            $.blockUI(opacity);
        },
        /**
         *This will remove the UI mask
         ```
         $.ui.unblockUI()
         ````
         * @title $.ui.unblockUI()
         */
        unblockUI: function() {
            $.unblockUI();
        },
        /**
         * Will remove the bottom nav bar menu from your application
           ```
           $.ui.removeFooterMenu();
           ```
         * @title $.ui.removeFooterMenu
         */
        removeFooterMenu: function() {
            jq("#navbar").hide();
            jq("#content").css("bottom", "0px");
            this.showNavMenu = false;
        },
        /**
         * Boolean if you want to show the bottom nav menu.
           ```
           $.ui.showNavMenu = false;
           ```
         * @title $.ui.showNavMenu
         */
        showNavMenu: true,
        /**
         * Boolean if you want to auto launch jqUi
           ```
           $.ui.autoLaunch = false; //
         * @title $.ui.autoLaunch
         */
        autoLaunch: true,
        /**
         * Boolean if you want to show the back button
           ```
           $.ui.showBackButton = false; //
         * @title $.ui.showBackButton
         */
        showBackbutton: true,
        /**
         * @api private
         */
        backButtonText: "",
        /**
         * Boolean if you want to reset the scroller position when navigating panels.  Default is true
           ```
           $.ui.resetScrollers=false; //Do not reset the scrollers when switching panels
           ```
         * @title $.ui.resetScrollers
         */
        resetScrollers: true,
        /**
         * function to fire when jqUi is ready and completed launch
           ```
           $.ui.ready(function(){console.log('jqUi is ready');});
           ```
         * @param {Function} function to execute
         * @title $.ui.ready
         */
        ready: function(param) {
            if(this.launchCompleted) 
                param();
            else
                document.addEventListener("jq.ui.ready",param,false);
        },
        /**
         * Override the back button class name
           ```
           $.ui.setBackButtonStyle('newClass');
           ```
         * @param {String} new class name
         * @title $.ui.setBackButtonStyle(class)
         */
        setBackButtonStyle: function(className) {
            $am("backButton").className = className;
        },
        /**
         * Initiate a back transition
           ```
           $.ui.goBack()
           ```
           
         * @title $.ui.goBack()
         */
        goBack: function() {
			if (this.history.length > 0) {
                var that = this;
                $.asap(
                    function() {
                        var tmpEl = that.history.pop();
                        that.loadContent(tmpEl.target + "", 0, 1, tmpEl.transition);
                        that.transitionType = tmpEl.transition;
                        //for Android 4.0.x, we must touchLayer.hideAdressBar()
                    });
            }
        },
        /**
         * Clear the history queue
           ```
           $.ui.clearHistory()
           ```
           
         * @title $.ui.clearHistory()
         */
        clearHistory: function() {
            this.history = [];
            this.backButton.style.visibility = "hidden";
        },
        /**
         * Updates the current window hash
         *
         * @param {String} newHash New Hash value
         * @title $.ui.updateHash(newHash)
         */
        updateHash: function(newHash) {
            previousTarget = '#' + newHash.replace('#', '');

            var previousHash = window.location.hash;
            var firstSlash = newHash.indexOf('/');
            var panelName = newHash.substring(1, firstSlash == -1?null:firstSlash - 1);

            try {
                window.history.replaceState(panelName, panelName, window.location.pathname + newHash);
                $(window).trigger("hashchange", {newUrl: window.location.pathname + newHash, oldUrl: window.location.pathname + previousHash});
            }
            catch (e) {
            }
        },
        /**
         * Update a badge on the selected target.  Position can be
            bl = bottom left
            tl = top left
            br = bottom right
            tr = top right (default)
           ```
           $.ui.updateBadge('#mydiv','3','bl');
           ```
         * @param {String} target
         * @param {String} Value
         * @param {String} [position]         
         * @title $.ui.updateBadge(target,value,[position])
         */
        updateBadge: function(target, value, position) {
            if (position === undefined)
                position = "";
            
            if (target[0] != "#")
                target = "#" + target;
            var badge = jq(target).find("span.jq-badge");
            if (badge.length == 0) {
                if (jq(target).css("position") != "absolute")
                    jq(target).css("position", "relative");
                badge = jq(target).append("<span class='jq-badge " + position + "'>" + value + "</span>");
            } else
                badge.html(value);
        
        },
        /**
         * Removes a badge from the selected target.
           ```
           $.ui.removeBadge('#mydiv');
           ```
         * @param {String} target
         * @title $.ui.removeBadge(target)
         */
        removeBadge: function(target) {
            jq(target).find("span.jq-badge").remove();
        },
        /**
         * Toggles the bottom nav nav menu.  Force is a boolean to force show or hide.
           ```
           $.ui.toggleNavMenu();//toggle it
           $.ui.toggleNavMenu(true); //force show it
           ```
         * @param {Boolean} [force]
         * @title $.ui.toggleNavMenu([force])
         */
        toggleNavMenu: function(force) {
            if (!jq.ui.showNavMenu)
                return;
            if (jq("#navbar").css("display") != "none" && ((force !== undefined && force !== true) || force === undefined)) {
                jq("#content").css("bottom", "0px");
                jq("#navbar").hide();
            } else if (force === undefined || (force !== undefined && force === true)) {
                jq("#navbar").show();
                jq("#content").css("bottom", jq("#navbar").css("height"));
            
            }
        },
        /**
         * Toggles the top header menu.
           ```
           $.ui.toggleHeaderMenu();//toggle it
           ```
         * @param {Boolean} [force]
         * @title $.ui.toggleHeaderMenu([force])
         */
         toggleHeaderMenu: function(force) {
            if (jq("#header").css("display") != "none" && ((force !== undefined && force !== true) || force === undefined)) {
                jq("#content").css("top", "0px");
                jq("#header").hide();
            } else if (force === undefined || (force !== undefined && force === true)) {
                jq("#header").show();
				var val = numOnly(jq("#header").css("height"));
                jq("#content").css("top", val+'px');
            }
        },
		
		
        /**
         * Toggles the side menu.  Force is a boolean to force show or hide.
           ```
           $.ui.toggleSideMenu();//toggle it
           ```
         * @param {Boolean} [force]
         * @title $.ui.toggleSideMenu([force])
         */
        toggleSideMenu: function(force, callback) {
			if(!this.isSideMenuEnabled() || this.togglingSideMenu) return;
            this.togglingSideMenu = true;

            var that = this;
            var menu = jq("#menu");
			var els = jq("#content, #menu, #header, #navbar");
			
            if (!(menu.hasClass("on") || menu.hasClass("to-on")) && ((force !== undefined && force !== false) || force === undefined)) {

				menu.show();
				$.asap(function(){
					that.css3animate(els,{
						"removeClass":"to-off off on",
						"addClass":"to-on",
						complete:function(canceled){
							if(!canceled){
	                            that.css3animate(els,{
									"removeClass":"to-off off to-on",
									"addClass":"on",
									time:0,
									complete:function(){
                                        that.togglingSideMenu = false;
										if(callback) callback(false);
									}
								});
							} else{
                                that.togglingSideMenu = false;
                                if(callback) callback(true);
                            }
						}
					});
				});	
            
            } else if (force === undefined || (force !== undefined && force === false)) {


				that.css3animate(els,{
					"removeClass":"on off to-on",
					"addClass":"to-off",
					complete:function(canceled){
						if(!canceled){
	                        that.css3animate(els,{
								"removeClass":"to-off on to-on",
								"addClass":"off",
								time:0,
								complete:function(){
	                                menu.hide();
                                    that.togglingSideMenu = false;
									if(callback) callback(false);
								}
							});
						} else{
                            that.togglingSideMenu = false;
                            if(callback) callback(true);
                        }
					}
				});
            }
        },
		disableSideMenu:function(){
			var that = this;
			var els = jq("#content, #menu, #header, #navbar");
			if(this.isSideMenuOn()){
				this.toggleSideMenu(false, function(canceled){
					if(!canceled) els.removeClass("hasMenu");
				});
			} else els.removeClass("hasMenu");
		},
		enableSideMenu:function(){
			var that = this;
			var els = jq("#content, #menu, #header, #navbar");
			els.addClass("hasMenu");
		},
		isSideMenuEnabled:function(){
			return jq("#content").hasClass("hasMenu");
		},
		isSideMenuOn:function(){
			var menu = jq('#menu');
			return this.isSideMenuEnabled() && (menu.hasClass("on") || menu.hasClass("to-on"));
		},
		
        /**
         * Updates the elements in the navbar
           ```
           $.ui.updateNavbarElements(elements);
           ```
         * @param {String|Object} Elements
         * @title $.ui.updateNavbarElements(Elements)
         */
        updateNavbarElements: function(elems) {
            var nb = jq("#navbar");
            if (elems === undefined || elems == null)
                return;
            if (typeof (elems) == "string")
                return nb.html(elems), null;
            nb.html("");
            for (var i = 0; i < elems.length; i++) {
                var node = elems[i].cloneNode(true);
                if (elems[i].oldhash) {
                    node.href = elems[i].oldhref;
                    node.onclick = elems[i].oldonclick;
                }
                nb.append(node);
            }
             jq("#navbar a").data("ignore-pressed", "true").data("resetHistory", "true");
        },
        /**
         * Updates the elements in the side menu
           ```
           $.ui.updateSideMenu(elements);
           ```
         * @param {String|Object} Elements
         * @title $.ui.updateSideMenu(Elements)
         */
        updateSideMenu: function(elems) {
			
            var that = this;
            
            var nb = jq("#menu_scroller");
            
            if (elems === undefined || elems == null)
                return;
            if (typeof (elems) == "string")
                return nb.html(elems), null;
            nb.html('');
            var close = document.createElement("a");
            close.className = "closebutton jqMenuClose";
            close.href = "javascript:;"
            close.onclick = function() {
                that.toggleSideMenu(false);
            };
            nb.append(close);
            var tmp = document.createElement("div");
            tmp.className = "jqMenuHeader";
            tmp.innerHTML = "Menu";
            nb.append(tmp);
            for (var i = 0; i < elems.length; i++) {
                var node = elems[i].cloneNode(true);
                if (elems[i].oldhash) {
                    node.href = elems[i].oldhref;
                    node.onclick = elems[i].oldonclick;
                }
                nb.append(node);
            }
            //Move the scroller to the top and hide it
            this.scrollingDivs['menu_scroller'].hideScrollbars();
            this.scrollingDivs['menu_scroller'].scrollTo({
                x: 0,
                y: 0
            }, "0");
        },
        /**
         * Set the title of the current panel
           ```
           $.ui.setTitle("new title");
           ```
           
         * @param {String} value
         * @title $.ui.setTitle(value)
         */
        setTitle: function(val) {
            this.titleBar.innerHTML = val;
        },
        /**
         * Override the text for the back button
           ```
           $.ui.setBackButtonText("GO...");
           ```
           
         * @param {String} value
         * @title $.ui.setBackButtonText(value)
         */
        setBackButtonText: function(text) {
            if (this.backButtonText.length > 0)
                this.backButton.innerHTML = this.backButtonText;
            else
                this.backButton.innerHTML = text;
        },
        /**
         * Show the loading mask
           ```
           $.ui.showMask()
           $.ui.showMask(;Doing work')
           ```
           
         * @param {String} [text]
         * @title $.ui.showMask(text);
         */
        showMask: function(text) {
            if (!text)
                text = "Loading Content";
            jq("#jQui_mask>h1").html(text);
            $am("jQui_mask").style.display = "block";
        },
        /**
         * Hide the loading mask
         * @title $.ui.hideMask();
         */
        hideMask: function() {
            $am("jQui_mask").style.display = "none";
        },
        /**
         * Load a content panel in a modal window.  We set the innerHTML so event binding will not work.
           ```
           $.ui.showModal("#myDiv");
           ```
         * @param {String|Object} panel to show
         * @title $.ui.showModal();
         */
        showModal: function(id) {
            var that = this;
            try {
                if ($am(id)) {
                    //jq("#modalContainer").html('<div style="width:1px;height:1px;-webkit-transform:translate3d(0,0,0);float:right"></div>'+$am(id).childNodes[0].innerHTML+'');
                    jq("#modalContainer").html($am(id).childNodes[0].innerHTML+'');
                    jq('#modalContainer').append("<a href='javascript:;' onclick='$.ui.hideModal();' class='closebutton modalbutton'></a>");
                    this.modalWindow.style.display = "block";
                    
                    button = null;
                    content = null;
                    this.scrollingDivs['modal_container'].enable();
                    this.scrollToTop('modal');
                }
            } catch (e) {
                console.log("Error with modal - " + e, this.modalWindow);
            }
        },
        /**
         * Hide the modal window and remove the content
           ```
           $.ui.hideModal("#myDiv");
           ```
         * @title $.ui.hideModal();
         */
        hideModal: function() {
            $am("modalContainer").innerHTML = "";
            $am("jQui_modal").style.display = "none";
            
            this.scrollingDivs['modal_container'].disable();
        },

        /**
         * Update the HTML in a content panel
           ```
           $.ui.updateContentDiv("#myDiv","This is the new content");
           ```
         * @param {String,Object} panel
         * @param {String} html to update with
         * @title $.ui.updateContentDiv(id,content);
         */
        updateContentDiv: function(id, content) {
            var el = $am(id);
            if (!el)
                return;
            
            var newDiv = document.createElement("div");
            newDiv.innerHTML = content;
            if($(newDiv).children('.panel') && $(newDiv).children('.panel').length > 0) newDiv = $(newDiv).children('.panel').get();
                
             
            
            if (el.getAttribute("js-scrolling") && el.getAttribute("js-scrolling").toLowerCase() == "yes"){
                $.cleanUpContent(el.childNodes[0], false, true);
                el.childNodes[0].innerHTML = content;
            }
            else{
                $.cleanUpContent(el, false, true);
                el.innerHTML = content;
            }
                
            if($(newDiv).title) el.title = $(newDiv).title;
        },
        /**
         * Dynamically create a new panel on the fly.  It wires events, creates the scroller, applies Android fixes, etc.
           ```
           $.ui.addContentDiv("myDiv","This is the new content","Title");
           ```
         * @param {String|Object} Element to add
         * @param {String} Content
         * @param {String} title
         * @title $.ui.addContentDiv(id,content,title);
         */
        addContentDiv: function(el, content, title, refresh, refreshFunc) {
            var myEl = $am(el);
            if (!myEl) {
                var newDiv = document.createElement("div");
                newDiv.innerHTML = content;
                if($(newDiv).children('.panel') && $(newDiv).children('.panel').length > 0) newDiv = $(newDiv).children('.panel').get();
                
                if(!newDiv.title&&title) newDiv.title = title;
                var newId = (newDiv.id)? newDiv.id : el; //figure out the new id - either the id from the loaded div.panel or the crc32 hash
                newDiv.id = newId;
            } else {
                newDiv = myEl;
            }
            newDiv.className = "panel";
            var that = this;
            
            myEl = null;
            that.addDivAndScroll(newDiv, refresh, refreshFunc);
            newDiv = null;
            return newId;
        },
        /**
         *  Takes a div and sets up scrolling for it..
           ```
           $.ui.addDivAndScroll(object);
           ```
         * @param {Object} Element
         * @title $.ui.addDivAndScroll(element);
         * @api private
         */
        addDivAndScroll: function(tmp, refreshPull, refreshFunc) {
			var jsScroll = false;
			var overflowStyle = tmp.style.overflow;
			var hasScroll = overflowStyle!='hidden'&&overflowStyle!='visible';
			
			//sets up scroll when required and not supported
			if(!$.feat.nativeTouchScroll&&hasScroll) tmp.setAttribute("js-scrolling", "yes");
			
            if (tmp.getAttribute("js-scrolling") && tmp.getAttribute("js-scrolling").toLowerCase() == "yes"){
				jsScroll = true;
				hasScroll = true;
            }
            
			
                
            if (!jsScroll) {
                this.content.appendChild(tmp);
				var scrollEl = tmp;
            } else {
	            //WE need to clone the div so we keep events
	            var scrollEl = tmp.cloneNode(false);
            
            
	            tmp.title = null;
	            tmp.id = null;
	            tmp.removeAttribute("footer");
	            tmp.removeAttribute("nav");
	            jq(tmp).replaceClass("panel", "jqmScrollPanel");
            
	            scrollEl.appendChild(tmp);
            
	            this.content.appendChild(scrollEl);
            	
	            if(this.selectBox!==false) this.selectBox.getOldSelects(scrollEl.id);
	            if(this.passwordBox!==false) this.passwordBox.getOldPasswords(scrollEl.id);
            	
            }

			if(hasScroll){
	            this.scrollingDivs[scrollEl.id] = (jq(tmp).scroller({
	                scrollBars: true,
	                verticalScroll: true,
	                horizontalScroll: false,
	                vScrollCSS: "jqmScrollbar",
	                refresh: refreshPull,
					useJsScroll:jsScroll,
					autoEnable:false	//dont enable the events unnecessarilly
	            }));
				//backwards compatibility
				if(refreshFunc) $.bind(this.scrollingDivs[scrollEl.id], 'refresh-release', function(trigger){if(trigger) refreshFunc()});
			}
            
			tmp = null;
			scrollEl = null;
        },

        /**
         *  Scrolls a panel to the top
           ```
           $.ui.scrollToTop(id);
           ```
         * @param {String} id without hash
         * @title $.ui.scrollToTop(id);
         */
        scrollToTop: function(id) {
            if (this.scrollingDivs[id]) {
                this.scrollingDivs[id].scrollTo({
                    x: 0,
                    y: 0
                }, 0);
            }
        },

        /**
         *  This is used when a transition fires to do helper events.  We check to see if we need to change the nav menus, footer, and fire
         * the load/onload functions for panels
           ```
           $.ui.parsePanelFunctions(currentDiv,oldDiv);
           ```
         * @param {Object} current div
         * @param {Object} old div
         * @title $.ui.parsePanelFunctions(currentDiv,oldDiv);
         * @api private
         */
        parsePanelFunctions: function(what, oldDiv) {
            //check for custom footer
            var that = this;
            var hasFooter = what.getAttribute("data-footer");
            
			//Note: this used to be a setTimeout(,10) and I set it to $.asap
			//It should be ok, but if anyone finds a bug related to it feel free to change it back
            $.asap(function() {
                if (hasFooter && hasFooter.toLowerCase() == "none") {
                    that.toggleNavMenu(false);
                } else {
                    that.toggleNavMenu(true);
                }
                if (hasFooter && that.customFooter != hasFooter) {
                    that.customFooter = hasFooter;
                    that.updateNavbarElements(jq("#" + hasFooter).children());
                } else if (hasFooter != that.customFooter) {
                    if (that.customFooter)
                        that.updateNavbarElements(that.defaultFooter);
                    that.customFooter = false;
                }
                if (what.getAttribute("data-tab")) { //Allow the dev to force the footer menu
                    jq("#navbar a").removeClass("selected");
                    jq("#" + what.getAttribute("data-tab")).addClass("selected");
                }
            });
            var hasMenu = what.getAttribute("data-nav");
            if (hasMenu && this.customMenu != hasMenu) {
				this.customMenu = hasMenu;
                this.updateSideMenu(jq("#" + hasMenu).children());
            } else if (hasMenu != this.customMenu) {
                if (this.customMenu){
					this.updateSideMenu(this.defaultMenu);
                }  
                this.customMenu = false;
            }
            
            
           
            if (oldDiv) {
                fnc = oldDiv.getAttribute("data-unload");
                if (typeof fnc == "string" && window[fnc]) {
                    window[fnc](oldDiv);
                }
            }
            $(what).trigger("unloadpanel");
             var fnc = what.getAttribute("data-load");
            if (typeof fnc == "string" && window[fnc]) {
                window[fnc](what);
            }
            $(what).trigger("loadpanel");
            if (this.isSideMenuOn()){
				this.toggleSideMenu(false);
            }
        },
        /**
         * Helper function that parses a contents html for any script tags and either adds them or executes the code
         * @api private
         */
        parseScriptTags: function(div) {
            if (!div)
                return;
            var scripts = div.getElementsByTagName("script");
            div = null;
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src.length > 0 && !that.remoteJSPages[scripts[i].src]) {
                    var doc = document.createElement("script");
                    doc.type = scripts[i].type;
                    doc.src = scripts[i].src;
                    document.getElementsByTagName('head')[0].appendChild(doc);
                    that.remoteJSPages[scripts[i].src] = 1;
                    doc = null;
                } else {
                    window.eval(scripts[i].innerHTML);
                }
            }
        },
        /**
         * This is called to initiate a transition or load content via ajax.
         * We can pass in a hash+id or URL and then we parse the panel for additional functions
           ```
           $.ui.loadContent("#main",false,false,"up");
           ```
         * @param {String} target
         * @param {Boolean} newtab (resets history)
         * @param {Boolean} go back (initiate the back click)
         * @param {String} transition
         * @title $.ui.loadContent(target,newTab,goBack,transition);
         * @api public
         */
        loadContent: function(target, newTab, back, transition, anchor) {
            
            if (this.doingTransition)
                return;
            
            what = null;
            var that = this;
            that.hideMask();
            var loadAjax = true;
            if (target.indexOf("#") == -1) {
                var urlHash = "url" + crc32(target); //Ajax urls
                if ($am(urlHash)) {

                    //ajax div already exists.  Let's see if we should be refreshing it.
                    loadAjax = false;
                    if (anchor.getAttribute("data-refresh-ajax") === 'true' || (anchor.refresh && anchor.refresh === true)) {
                        loadAjax = true;
                    } else
                        target = "#" + urlHash;
                }
            }
                
            if (target.indexOf("#") == -1 && anchor && loadAjax) {

                // XML Request
                if (this.activeDiv.id == "jQui_ajax" && target == this.ajaxUrl)
                    return;
                if (target.indexOf("http") == -1)
                    target = AppMobi.webRoot + target;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        this.doingTransition = false;
                            
                        var doReturn = false;

                        //Here we check to see if we are retaining the div, if so update it
                        if ($am(urlHash) !== undefined) {
                            that.updateContentDiv(urlHash, xmlhttp.responseText);
                            $am(urlHash).title = anchor.title ? anchor.title : target;
                        } else if (anchor.getAttribute("data-persist-ajax")) {
                                
                            var refresh = (anchor.getAttribute("data-pull-scroller") === 'true') ? true : false;
                            refreshFunction = refresh ? 
                            function() {
                                anchor.refresh = true;
                                that.loadContent(target, newTab, back, transition, anchor);
                                anchor.refresh = false;
                            } : null;
                            that.addContentDiv(urlHash, xmlhttp.responseText, refresh, refreshFunction);
                            $am(urlHash).title = anchor.title ? anchor.title : target;
                        } else {
                            that.updateContentDiv("jQui_ajax", xmlhttp.responseText);
                            $am("jQui_ajax").title = anchor.title ? anchor.title : target;
                            that.loadContent("#jQui_ajax", newTab, back);
                            doReturn = true;
                        }
                        //Let's load the content now.
                        //We need to check for any script tags and handle them
                        var div = document.createElement("div");
                        div.innerHTML = xmlhttp.responseText;
                        that.parseScriptTags(div);
                        if (doReturn)
                            return;
                            
                        return that.loadContent("#" + urlHash);
                        
                    }
                };
                ajaxUrl = target;
                var newtarget = this.useAjaxCacheBuster?target + (target.split('?')[1] ? '&' : '?') + "cache=" + Math.random() * 10000000000000000:target;
                xmlhttp.open("GET", newtarget, true);
                xmlhttp.send();
                // show Ajax Mask
                this.showMask();
                return;
            } else {
                // load a div
                what = target.replace("#", "");

                var slashIndex = what.indexOf('/');
                var hashLink = "";
                if (slashIndex != -1) {
                    // Ignore everything after the slash for loading
                    hashLink = what.substr(slashIndex);
                    what = what.substr(0, slashIndex);
                }

                what = $am(what);
                    
                if (!what)
                    throw ("Target: " + target + " was not found");
                if (what == this.activeDiv && !back){
                	//toggle the menu if applicable
		            if (this.isSideMenuOn()) this.toggleSideMenu(false);
					return;
                }
                    
                if (what.getAttribute("data-modal") == "true" || what.getAttribute("modal") == "true") {
                    return this.showModal(what.id);
                }
                what.style.display = "block";
                    
                    
                    
                this.transitionType = transition;
                var oldDiv = this.activeDiv;
                var currWhat = what;
                    
                if (oldDiv == currWhat) //prevent it from going to itself
                    return;
                    
                if (newTab) {
                    this.history = [];
                    this.history.push({
                        target: "#" + this.firstDiv.id,
                        transition: transition
                    });
                } else if (!back) {
                    this.history.push({
                        target: previousTarget,
                        transition: transition
                    });
                }
                try {
                    window.history.pushState(what.id, what.id, startPath + '#' + what.id + hashLink);
                    $(window).trigger("hashchange", {newUrl: startPath + '#' + what.id + hashLink,oldURL: startPath + previousTarget});
                } 
                catch (e) {
                }
                    
                previousTarget = '#' + what.id + hashLink;
                    
                if (this.resetScrollers && this.scrollingDivs[what.id]) {
                    this.scrollingDivs[what.id].scrollTo({
                        x: 0,
                        y: 0
                    });
                }
                this.doingTransition = true;
				this.runTransition(transition, oldDiv, currWhat, back);
                
                    
                if (back) {
                    if (this.history.length > 0) {
                        var val = this.history[this.history.length - 1];
						var slashIndex = val.target.indexOf('/');
						if (slashIndex != -1) {
						    var prevId = val.target.substr(0, slashIndex);
						} else var prevId = val.target;
                        var el = $am(prevId.replace("#", ""));
						//make sure panel is there
                        if(el) this.setBackButtonText(el.title);
						else this.setBackButtonText("Back");
                    }
                } else if (this.activeDiv.title)
                    this.setBackButtonText(this.activeDiv.title)
                else
                    this.setBackButtonText("Back");
                if (what.title) {
                    this.titleBar.innerHTML = what.title;
                }
                if (newTab) {
                    this.setBackButtonText(this.firstDiv.title)
                }
                    
                if (this.history.length == 0) {
                    this.backButton.style.visibility = "hidden";
                    this.history = [];
                } else if (this.showBackbutton)
                    this.backButton.style.visibility = "visible";
                this.activeDiv = what;
                if (this.scrollingDivs[this.activeDiv.id]) {
                    this.scrollingDivs[this.activeDiv.id].enable();
                }
                if (this.scrollingDivs[oldDiv.id]) {
                    this.scrollingDivs[oldDiv.id].disable();
                }
                //Let's check if it has a function to run to update the data
                this.parsePanelFunctions(what, oldDiv);
                window.scrollTo(1,1);
			}
        },
		
		runTransition: function(transition, oldDiv, currWhat, back){
            if (!this.availableTransitions[transition]) transition = 'default';
            this.availableTransitions[transition].call(this, oldDiv, currWhat, back);
		},
		
        /**
         * This is callled when you want to launch jqUi.  If autoLaunch is set to true, it gets called on DOMContentLoaded.
         * If autoLaunch is set to false, you can manually invoke it.
           ```
           $.ui.autoLaunch=false;
           $.ui.launch();
           ```
         * @title $.ui.launch();
         */
        launch: function() {
            
            if (this.hasLaunched == false || this.launchCompleted) {
                this.hasLaunched = true;
                return;
            }
			
			var that = this;

            this.isAppMobi = (window.AppMobi && typeof (AppMobi) == "object" && AppMobi.app !== undefined) ? true : false;
            this.viewportContainer = jq("#jQUi");
            this.navbar = $am("navbar");
            this.content = $am("content");
            this.header = $am("header");
            this.menu = $am("menu");
            if (this.viewportContainer.length == 0) {
                var container = document.createElement("div");
                container.id = "jQUi";
                var body = document.body;
                while (body.firstChild) {
                    container.appendChild(body.firstChild);
                }
                jq(document.body).prepend(container);
                this.viewportContainer = jq("#jQUi");
            }
			//set anchor click handler for UI
			this.viewportContainer[0].addEventListener('click', function(e){
				var theTarget = e.target;
				checkAnchorClick(e, theTarget);
			}, false);
			
			var enterEditEl = null;
			//on enter-edit keep a reference of the actioned element
			$.bind($.touchLayer, 'enter-edit', function(el){ enterEditEl = el; });
			//enter-edit-reshape panel padding and scroll adjust
			$.bind($.touchLayer, 'enter-edit-reshape', function(){
				//onReshape UI fixes
				//check if focused element is within active panel
				var jQel = $(enterEditEl);
				var jQactive = jQel.closest(that.activeDiv);
				if(jQactive && jQactive.size()>0){
					if($.os.ios || $.os.chrome){
						var paddingTop, paddingBottom;
						if(document.body.scrollTop){
							paddingTop=document.body.scrollTop-jQactive.offset().top;
						} else {
							paddingTop=0;
						}
						//not exact, can be a little above the actual value
						//but we haven't found an accurate way to measure it and this is the best so far
						paddingBottom=jQactive.offset().bottom-jQel.offset().bottom;	
						that.scrollingDivs[that.activeDiv.id].setPaddings(paddingTop, paddingBottom);

					} else if($.os.android || $.os.blackberry){
						var elPos = jQel.offset();
						var containerPos = jQactive.offset();
						if(elPos.bottom>containerPos.bottom && elPos.height<containerPos.height){
							//apply fix
							that.scrollingDivs[that.activeDiv.id].scrollToItem(jQel, 'bottom');
						}
					}
				}
			});
			if($.os.ios){
				$.bind($.touchLayer, 'exit-edit-reshape', function(){
					that.scrollingDivs[that.activeDiv.id].setPaddings(0, 0);
				});
			}
			
			
			
			
            if (!this.navbar) {
                this.navbar = document.createElement("div");
                this.navbar.id = "navbar";
                this.navbar.style.cssText = "display:none";
                this.viewportContainer.append(this.navbar);
            }
            if (!this.header) {
                this.header = document.createElement("div");
                this.header.id = "header";
                this.viewportContainer.prepend(this.header);
            }
            if (!this.menu) {
                this.menu = document.createElement("div");
                this.menu.id = "menu";
                this.menu.style.overflow = "hidden";
                this.menu.innerHTML = '<div id="menu_scroller"></div>';
                this.viewportContainer.append(this.menu);
                this.scrollingDivs["menu_scroller"] = jq("#menu_scroller").scroller({
                    scrollBars: false,
                    verticalScroll: true,
                    vScrollCSS: "jqmScrollbar"
                });
            }
            
            
            if (!this.content) {
                this.content = document.createElement("div");
                this.content.id = "content";
                this.viewportContainer.append(this.content);
            }
			
            this.header.innerHTML = '<a id="backButton"  href="javascript:;"></a> <h1 id="pageTitle"></h1>' + header.innerHTML;
            this.backButton = $am("backButton");
            this.backButton.className = "button";
            
            this.backButton.onclick = function() {
				that.goBack();
            };
            this.backButton.style.visibility = "hidden";
            this.titleBar = $am("pageTitle");
            this.addContentDiv("jQui_ajax", "");
            var maskDiv = document.createElement("div");
            maskDiv.id = "jQui_mask";
            maskDiv.className = "ui-loader";
            maskDiv.innerHTML = "<span class='ui-icon ui-icon-loading spin'></span><h1>Loading Content</h1>";
            maskDiv.style.zIndex = 20000;
            maskDiv.style.display = "none";
            document.body.appendChild(maskDiv);
            var modalDiv = document.createElement("div");
            modalDiv.id = "jQui_modal";
            
            this.viewportContainer.append(modalDiv);
            modalDiv.appendChild(jq("<div id='modalContainer'></div>").get());
            this.scrollingDivs['modal_container'] = jq("#modalContainer").scroller({
                scrollBars: true,
                vertical: true,
                vScrollCSS: "jqmScrollbar"
            });
            
            this.modalWindow = modalDiv;
            
            var defer = {};
            var contentDivs = this.viewportContainer.get().querySelectorAll(".panel");
            for (var i = 0; i < contentDivs.length; i++) {
                var el = contentDivs[i];
                var tmp = el;
                var id;
                if (el.parentNode && el.parentNode.id != "content") {
                    el.parentNode.removeChild(el);
                    var id = el.id;
                    this.addDivAndScroll(tmp);
                    if (tmp.getAttribute("selected"))
                        this.firstDiv = $am(id);
                } else if (!el.parsedContent) {
                    el.parsedContent = 1;
                    el.parentNode.removeChild(el);
                    var id = el.id;
                    this.addDivAndScroll(tmp);
                    if (tmp.getAttribute("selected"))
                        this.firstDiv = $am(id);
                }
                if (el.getAttribute("data-defer"))
                    defer[id] = el.getAttribute("data-defer");
                el = null;
            }
            contentDivs = null;
            var loadingDefer=false;
            var toLoad=Object.keys(defer).length;
            if(toLoad>0){
                loadingDefer=true;
                var loaded=0;
                for (var j in defer) {
                    (function(j) {
                        jq.ajax({url:AppMobi.webRoot + defer[j], success:function(data) {
                            if (data.length == 0)
                                return;
                            $.ui.updateContentDiv(j, data);
                            that.parseScriptTags(jq(j).get());
                            loaded++;
                            if(loaded>=toLoad){
                               $(document).trigger("defer:loaded");
                               loadingDefer=false;
                               
                            }
                        },error:function(msg){
                            //still trigger the file as being loaded to not block jq.ui.ready
                            console.log("Error with deferred load "+AppMobi.webRoot+defer[j])
                            loaded++;
                            if(loaded>=toLoad){
                               $(document).trigger("defer:loaded");
                               loadingDefer=false;
                            }
                        }});
                    })(j);
                }
            }
            if (this.firstDiv) {
                
                var that = this;
                // Fix a bug in iOS where translate3d makes the content blurry
                this.activeDiv = this.firstDiv;
                if (this.scrollingDivs[this.activeDiv.id]) {
                    this.scrollingDivs[this.activeDiv.id].enable();
                }
                
                //window.setTimeout(function() {
                var loadFirstDiv=function(){
                    //activeDiv = firstDiv;
                    //activeDiv = firstDiv;
                    if (defaultHash.length > 0 && that.loadDefaultHash&&defaultHash!=("#"+that.firstDiv.id)&&$(defaultHash).length>0)
                    {
                        that.activeDiv=$(defaultHash).get();
                        jq("#header #backButton").css("visibility","visible");
                        that.setBackButtonText(that.activeDiv.title)
                        that.history=[{target:"#"+that.firstDiv.id}]; //Reset the history to the first div
                    }
                    else
                        previousTarget="#"+that.activeDiv.id;
                    
                    that.activeDiv.style.display = "block";
                    
                   
                    if (that.activeDiv.title)
                        that.setTitle(that.activeDiv.title);
                    that.parsePanelFunctions(that.activeDiv);
                    //Load the default hash
                    
                    that.history=[{target:"#"+that.firstDiv.id}]; //Reset the history to the first div
                    modalDiv = null;
                    maskDiv = null;
                    that.launchCompleted = true;
                    
                   if(jq("#navbar a").length>0){
                        jq("#navbar a").data("ignore-pressed", "true").data("resetHistory", "true");
                        that.defaultFooter = jq("#navbar").children();
                        that.updateNavbarElements(that.defaultFooter);
                    }
                    var firstMenu = jq("nav").get();
                    if(firstMenu){
                        that.defaultMenu = jq(firstMenu).children();
                        that.updateSideMenu(that.defaultMenu);
                    }
                    that.defaultHeader = jq("#header").children();
                    jq(document).trigger("jq.ui.ready");
                    jq("#splashscreen").remove();
                    jq("#navbar").on("click", "a", function(e) {
                        jq("#navbar a").not(this).removeClass("selected");
                        setTimeout(function() {
                            $(e.target).addClass("selected");
                        }, 10);
                    });
                };
                if(loadingDefer){
                    $(document).one("defer:loaded",loadFirstDiv);
                }
                else
                    window.setTimeout(loadFirstDiv,100);	//could this be $.asap?
            }
           
        },
        noTransition: function(oldDiv, currDiv, back) {
            currDiv.style.display = "block";
			oldDiv.style.display = "block";
            var that = this;
            that.clearAnimations(currDiv);
			that.css3animate(oldDiv, {
                x: "-100%",
                y: 0
            });
            that.finishTransition(oldDiv);
            currDiv.style.zIndex = 2;
            oldDiv.style.zIndex = 1;
        },
		/**
         * This must be called at the end of every transition to hide the old div and reset the doingTransition variable
         *
         * @param {Object} Div that transitioned out
         * @title $.ui.finishTransition(oldDiv)
         */
        finishTransition: function(oldDiv, currDiv) {
            oldDiv.style.display = 'none';
            this.doingTransition = false;
			if(currDiv) this.clearAnimations(currDiv);
        },
		
        /**
         * This must be called at the end of every transition to remove all transforms and transitions attached to the inView object (performance + native scroll)
         *
         * @param {Object} Div that transitioned out
         * @title $.ui.finishTransition(oldDiv)
         */
        clearAnimations: function(inViewDiv) {
			inViewDiv.style.webkitTransform = "none";
			inViewDiv.style.webkitTransition = "none";
        }
		
    /**
         * END
         * @api private
         */
    };
    
    function $am(el) {
        el = typeof el == 'string' && el.indexOf("#") == -1 ? "#" + el : el;
        return jq(el).get(0);
    }
	
	//lookup for a clicked anchor recursively and fire UI own actions when applicable 
    var checkAnchorClick = function(e, theTarget) {
			
		if(theTarget.isSameNode(jQUi)) {
			return;
		}
			
		//this technique fails when considerable content exists inside anchor, should be recursive ?
        if (theTarget.tagName.toLowerCase() != "a" && theTarget.parentNode)
            return checkAnchorClick(e, theTarget.parentNode); //let's try the parent (recursive)
			
		//anchors
		if (theTarget.tagName.toLowerCase() == "a") {
            if (theTarget.href.toLowerCase().indexOf("javascript:") !== -1||theTarget.getAttribute("data-ignore")) {
                return;
            }
            
            //external links
            if (theTarget.hash.indexOf("#") === -1 && theTarget.target.length > 0) 
            {
                if (theTarget.href.toLowerCase().indexOf("javascript:") != 0) {
                    if (jq.ui.isAppMobi) {
                    	e.preventDefault();
						AppMobi.device.launchExternal(theTarget.href);
                    } else if (!jq.os.desktop){
                    	e.target.target = "_blank";
                    }
                }
                return;
            }
			
			//empty links
            if (theTarget.href=="#" || theTarget.href.length==0)
                return;
            
            
			//internal links
			e.preventDefault();
            var mytransition = theTarget.getAttribute("data-transition");
            var resetHistory = theTarget.getAttribute("data-resetHistory");
            resetHistory = resetHistory && resetHistory.toLowerCase() == "true" ? true : false;
            var href = theTarget.hash.length > 0 ? theTarget.hash : theTarget.href;
            jq.ui.loadContent(href, resetHistory, 0, mytransition, theTarget);
			return;
        }
    }
	
    
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D"; /* Number */
    var crc32 = function( /* String */str,  /* Number */crc) {
        if (crc == undefined)
            crc = 0;
        var n = 0; //a number between 0 and 255 
        var x = 0; //an hex number 
        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            n = (crc ^ str.charCodeAt(i)) & 0xFF;
            x = "0x" + table.substr(n * 9, 8);
            crc = (crc >>> 8) ^ x;
        }
        return crc ^ (-1);
    };
    
    
    $.ui = new ui;
})(jq);


//The following functions are utilitiy functions for jqUi within appMobi.
//TODO: consider taking all appMobi constraints from jQUI into this code
(function() {
    document.addEventListener("appMobi.device.ready", function() { //in AppMobi, we need to undo the height stuff since it causes issues.
        setTimeout(function() {
            document.getElementById('jQUi').style.height="100%"; 
			document.body.style.height = "100%";
            document.documentElement.style.minHeight = window.innerHeight;
        }, 300);
    });

})();


