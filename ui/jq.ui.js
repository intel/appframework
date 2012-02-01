/**
/**
 * jq.ui - A User Interface library for creating jqMobi applications
 * 
 * @copyright 2011 - AppMobi
 */ (function($) {
    
    var hasLaunched = false;
    var startPath = window.location.pathname;
    var ui = function() {
        // Init the page
        var that = this;
        
        if (window.AppMobi)
            document.addEventListener("appMobi.device.ready", function() {
                that.hasLaunched = true;
                if (that.autoLaunch) {
                    AppMobi.device.hideSplashScreen();
                    that.launch();
                }
            }, false);
        else if (document.readyState == "complete" || document.readyState == "loaded") {
            that.hasLaunched = true;
            if (that.autoLaunch) {
                that.launch();
            }
        } else
            document.addEventListener("DOMContentLoaded", function() {
                that.hasLaunched = true;
                if (that.autoLaunch) {
                    that.launch();
                }
            }, false);
        if (!window.AppMobi)
            AppMobi = {}, AppMobi.webRoot = "";
        window.addEventListener("popstate", function() {
            that.goBack();
        }, false);
    };
    
    
    ui.prototype = {
        autoLaunch: true,
        launchCompleted: false,
        showBackbutton: true,
        hasSplash: false,
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
        passwordBox: new jq.passwordBox(),
        selectBox: jq.selectBox,
        ajaxUrl: "",
        transitionType: "slide",
        scrollingDivs: [],
        firstDiv: "",
        remoteJSPages: {},
		hasLaunched: false,
        activeDiv: "",
        backButtonText: "",
		ready: function(param) {
            this._readyFunc = param;
        },
		css3animate: function(el, opts) {
            try {
                jq(el).css3Animate(opts);
            } catch (e) {
                console.log("Error animating " + e.message + "  " + el.id);
            }
        },
        setBackButtonStyle: function(className) {
            $am("backButton").className = className;
        },		
        goBack: function() {
            if (this.history.length > 0) {
                var tmpEl = this.history.pop();
                this.loadContent(tmpEl.target + "", 0, 1, tmpEl.transition);
                this.transitionType = tmpEl.transition;
            }
        },
		clearHistory: function() {
            this.history = [];
            this.backButton.style.visibility = "hidden";
        },
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
            } 
            else
                badge.html(value);
        
        },
        removeBadge: function(target) {
            jq(target).find("span.jq-badge").remove();
        },
        toggleNavMenu: function() {
            if (jq("#navbar").css("display") == "block") {
                jq("#content").css("bottom", "0px");
            } 
            else {
                jq("#content").css("bottom", jq("#navbar").css("height"));
            }
            jq("#navbar").toggle();
        },
        toggleHeaderMenu: function() {
            if (jq("#header").css("display") == "block") {
                jq("#content").css("top", "0px");
            } 
            else {
                jq("#content").css("top", jq("#header").css("height"));
            }
            jq("#header").toggle();
        },
		toggleSideMenu: function(force) {
            
            if (jq("#menu").css("display") != "block") {
                this.scrollingDivs["menu_scroller"].initEvents();
                jq("#menu").css("display", "block");
                window.setTimeout(function() {
                    jq("#menu").css3Animate({x: "200px",time: "300ms"});
                    jq("#header").css3Animate({x: "200px",time: "300ms"});
                    jq("#navbar").css3Animate({x: "200px",time: "300ms"});
                    jq("#content").css3Animate({x: "200px",time: "300ms"});
                }, 1); //needs to run after
            } 
            else {
                this.scrollingDivs["menu_scroller"].removeEvents();
                jq("#menu").css("display", "block").css3Animate({x: "0%",time: "300ms",callback: function() {
                        jq("#menu").css('display', 'none');
                    }});
                jq("#header").css3Animate({x: "0px",time: "300ms"});
                jq("#navbar").css3Animate({x: "0px",time: "300ms"});
                jq("#content").css3Animate({x: "0px",time: "300ms"});
            }
        },   
        updateNavbar: function() {
            var links = jq(this.navbar).find("a");
            for (var i = 0; i < links.length; i++) {
                links[i].ontouchstart = function() {
                    var that = this;
                    this.interval = window.setTimeout(function() {
                        that.ontouchend()
                    }, 200);
                }
                links[i].ontouchend = function(e) {
                    var that = this;
                    window.clearTimeout(that.interval);
                    this.interval = null;
                    if (this.doingTransition)
                        return;
                    jq("#navbar a").removeClass("selected");
                    jq(this).addClass("selected");
                    this.onclick();
                    e.preventDefault();
                }
            
            }
            links = null;
        },		
		updateFooter: function(elems) {
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
            
            this.updateAnchors(this.navbar, 1);
            this.updateNavbar();
        },
        updateMenu: function(elems) {
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
                that.toggleSideMenu();
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
            
            this.updateAnchors(this.menu);
        },
		setTitle: function(val) {
            this.titleBar.innerHTML = val;
        },
        setBackButtonText: function(text) {
            if (this.backButtonText.length > 0)
                this.backButton.innerHTML = "<div>" + this.backButtonText + "</div>";
            else
                this.backButton.innerHTML = "<div>" + text + "</div>";
        },
	    showMask: function() {
            $am("jQui_mask").style.display = "block";
        },
        hideMask: function() {
            $am("jQui_mask").style.display = "none";
        },
        showModal: function(id) {
            var that = this;
            try {
                if ($am(id)) {
                    
                    this.modalWindow.innerHTML = $am(id).innerHTML;
                    var button = document.createElement("a");
                    button.onclick = button.ontouchstart = function() {
                        that.hideModal();
                    }
                    button.className = "closebutton modalbutton";
                    this.modalWindow.appendChild(button);
                    this.modalWindow.style.display = "block";
                    button = null;
                    content = null;
                }
            } catch (e) {
                console.log("Error with modal - " + e, this.modalWindow);
            }
        },
        hideModal: function() {
            $am("jQui_modal").innerHTML = "";
            $am("jQui_modal").style.display = "none";
        },
       
        updateContentDiv: function(id, content) {
            var el = $am(id);
            if (!el)
                return;
			if(el.getAttribute("scrolling") && el.getAttribute("scrolling").toLowerCase() == "no")
			   el.innerHTML=content;
			else
               el.childNodes[0].innerHTML = content;
            this.updateAnchors(el);
        },
        addContentDiv: function(el, content, title, refresh, refreshFunc) {
            var myEl = $am(el);
            if (!myEl) {
                var newDiv = document.createElement("div");
                newDiv.id = el;
                newDiv.title = title;
                newDiv.innerHTML = content;
            } else {
                newDiv = myEl;
            }
            newDiv.className = "panel";
            var that = this;
            
            myEl = null;
            that.addDivAndScroll(newDiv, refresh, refreshFunc);
            newDiv = null;
            return;
        },
        addDivAndScroll: function(tmp, refreshPull, refreshFunc) {
            
            
            var addScroller = true;
            if (tmp.getAttribute("scrolling") && tmp.getAttribute("scrolling").toLowerCase() == "no")
                addScroller = false;
            if (!addScroller) {
                this.content.appendChild(tmp);
                this.updateAnchors(tmp);
                tmp = null;
                return;
            }
            //WE need to clone the div so we keep events
            var myDiv = tmp.cloneNode(false);
            
            
            tmp.title = null;
            tmp.id = null;
            tmp.removeAttribute("footer");
            tmp.removeAttribute("nav");
            jq(tmp).removeClass("panel");
            
            myDiv.appendChild(tmp);
            
            this.content.appendChild(myDiv);
            this.updateAnchors(tmp);
            
            this.selectBox.getOldSelects(myDiv.id);
            this.passwordBox.getOldPasswords(myDiv.id);
            
            if (addScroller) {
                this.scrollingDivs[myDiv.id] = (jq(tmp).scroller({
                    scrollBars: true,
                    verticalScroll: true,
                    horizontalScroll: false,
                    vScrollCSS: "jqmScrollbar",
                    refresh: false
                }));
                this.scrollingDivs[myDiv.id].removeEvents();
            }
            
            
            myDiv = null;
            tmp = null;
        },
        updateAnchors: function(domEl, reset) {
            
            var anchors = domEl.getElementsByTagName("a");
            
            var that = this;
            var theTransition;
            for (var i = 0; i < anchors.length; i++) {
                
                if (!(anchors[i].href.indexOf("file:///") !== -1 && anchors[i].href.indexOf("#") !== -1) && anchors[i].href.indexOf(":") != -1 && ((anchors[i].href.indexOf("http:") != 0 && anchors[i].href.indexOf("https:") != 0) || anchors[i].href.indexOf("http://maps.google.com/maps") != -1)) { //allow execution of tel: and protocol handlers
                    if (anchors[i].href.indexOf("javascript:") != 0) {
                        anchors[i].oldonclick = anchors[i].onclick;
                        anchors[i].oldhref = anchors[i].href;
                        anchors[i].href = "javascript:;";
                        anchors[i].onclick = function() {
                            if (that.isAppMobi)
                                AppMobi.device.launchExternal(this.oldhref);
                            else
                                window.open(this.oldhref);
                            if (typeof (this.oldonclick) == "function")
                                this.oldonclick();
                        }
                    }
                    
                    continue;
                }
                
                anchors[i].oldhref = anchors[i].href;
                anchors[i].oldhash = anchors[i].hash;
                anchors[i].href = "javascript:;";
                anchors[i].oldonclick = anchors[i].onclick;
                anchors[i].resetHistory = reset;
                anchors[i].displaytitle = anchors[i].title;
                anchors[i].touchStarted = false;
                anchors[i].onclick = function() {
                    var transition = "slide";
                    if (this.target && this.target != "") {
                        if (that.isAppMobi)
                            AppMobi.device.showRemoteSite(this.oldhref);
                        else {
                            window.open(this.oldhref);
                        }
                        return;
                    }
                    var mytransition = this.getAttribute("data-transition");
                    switch (mytransition) {
                        case "up":
                            transition = "up";
                            break;
                        case "down":
                            transition = "down";
                            break;
                        case "flip":
                            transition = "flip";
                            break;
                        case "fade":
                            transition = "fade";
                            break;
                        case "pop":
                            transition = "pop";
                            break;
                        default:
                            transition = "slide";
                    }
                    that.loadContent(
                    this.oldhash ? this.oldhash : this.oldhref, this.resetHistory, 0, transition, this);
                    if (typeof (this.oldonclick) !== "undefined" && this.oldonclick) {
                        this.oldonclick();
                    }
                };
            }
            anchors = null;
        
        },
        scrollToTop: function(id) {
            if (this.scrollingDivs[id]) {
                this.scrollingDivs[id].scrollTo({
                    x: 0,
                    y: 0
                });
            }
        },
        updateOrientation: function(event) {
            for (var j in this.scrollingDivs) {
                if (typeof (this.scrollingDivs[j]) !== "function")
                    this.scrollToTop(j);
            }
            this.css3animate(this.activeDiv, {
                x: "100%",
                time: "0ms"
            });
        },
        parsePanelFunctions: function(what, oldDiv) {
            //check for custom footer
            var hasFooter = what.getAttribute("data-footer");
            if (hasFooter && this.customFooter != hasFooter) {
                this.customFooter = hasFooter;
                this.updateFooter(jq("#" + hasFooter).children());
            } 
            else if (hasFooter != this.customFooter) {
                if (this.customFooter)
                    this.updateFooter(this.defaultFooter);
                this.customFooter = false;
            }
            var hasMenu = what.getAttribute("data-nav");
            if (hasMenu && this.customMenu != hasMenu) {
                this.customMenu = hasMenu;
                this.updateMenu(jq("#" + hasMenu).children());
            } 
            else if (hasMenu != this.customMenu) {
                if (this.customMenu)
                    this.updateMenu(this.defaultMenu);
                this.customMenu = false;
            }
            
            
            var fnc = what.getAttribute("data-load");
            if (typeof fnc == "string" && window[fnc]) 
            {
                window[fnc](what);
            }
            if (oldDiv) {
                fnc = oldDiv.getAttribute("data-unload");
                if (typeof fnc == "string" && window[fnc]) 
                {
                    window[fnc](oldDiv);
                }
            }
            if (this.menu.style.display == "block")
                this.toggleSideMenu(); //Close on phones to prevent orientation change bug.
            if (what.getAttribute("data-tab")) { //Allow the dev to force the footer menu
                jq("#navbar a").removeClass("selected");
                jq("#" + what.getAttribute("data-tab")).addClass("selected");
            }
        },      
        loadContent: function(target, newTab, back, transition, anchor) {
            
            if (this.doingTransition)
                return;
            
            try {
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
                                } : null
                                that.addContentDiv(urlHash, xmlhttp.responseText, refresh, refreshFunction);
                                $am(urlHash).title = anchor.title ? anchor.title : target;
                            } else {
                                that.updateContentDiv("jQui_ajax", xmlhttp.responseText);
                                $am("jQui_ajax").title = anchor.title ? anchor.title : target;
                                that.loadContent("#jQui_ajax", newTab, back);
                                doReturn = true;
                            }
                            //Let's load the content now.
                            /**
                             * Now we'll find any <script> tags and eval the JS or include them. We also keep a reference to the files included so we only
                             * include them once
                             */
                            var div = document.createElement("div");
                            div.innerHTML = xmlhttp.responseText;
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
                            if (doReturn)
                                return;
                            
                            return that.loadContent("#" + urlHash);
                        
                        }
                    };
                    ajaxUrl = target;
                    var newtarget = target + (target.split('?')[1] ? '&' : '?') + "cache=" + Math.random() * 10000000000000000;
                    xmlhttp.open("GET", newtarget, true);
                    xmlhttp.send();
                    // show Ajax Mask
                    this.showMask();
                    return;
                } 
                else {
                    // load a div
                    what = target.replace("#", "");
                    what = $am(what);
                    
                    if (!what)
                        throw ("Target: " + target + " was not found");
                    if (what == this.activeDiv && !back)
                        return;
                    
                    if (what.getAttribute("modal")) {
                        return this.showModal(what.id);
                    }
                    what.style.display = "block";
                    
                    
                    //fix scroller
                    if (this.scrollingDivs[what.id]) {
                        this.scrollingDivs[what.id].scrollTo({
                            x: 0,
                            y: 0
                        });
                    }
                    var oldHistory = [];
                    if (newTab) {
                        
                        this.history = [];
                        this.history.push({
                            target: "#" + this.firstDiv.id,
                            transition: transition
                        });
                        try {
                            window.history.pushState('', this.firstDiv.id, startPath);
                        } 
                        catch (e) {
                        }
                    
                    } else if (!back) {
                        this.history.push({
                            target: "#" + this.activeDiv.id,
                            transition: transition
                        });
                        try {
                            window.history.pushState('', this.activeDiv.id, startPath);
                        } 
                        catch (e) {
                        }
                    
                    }
                    this.transitionType = transition;
                    var oldDiv = this.activeDiv;
                    var currWhat = what;
                    
                    if (oldDiv == currWhat) //prevent it from going to itself
                        return;
                    
                    this.doingTransition = true;
                    switch (transition) {
                        case "up":
                            this.slideUpTransition(oldDiv, currWhat, back);
                            break;
                        case "down":
                            this.slideDownTransition(oldDiv, currWhat, back);
                            break;
                        case "fade":
                            this.fadeTransition(oldDiv, currWhat, back);
                            break;
                        case "flip":
                            this.flipTransition(oldDiv, currWhat, back);
                            break;
                        case "pop":
                            this.popTransition(oldDiv, currWhat, back);
                            break;
                        default:
                            this.slideTransition(oldDiv, currWhat, back);
                    }
                    
                    if (back) {
                        
                        if (this.history.length > 0) {
                            var val = this.history[this.history.length - 1];
                            
                            var el = $am(val.target.replace("#", ""));
                            this.setBackButtonText(el.title)
                        }
                    } 
                    else if (this.activeDiv.title)
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
                        this.scrollingDivs[this.activeDiv.id].initEvents();
                    }
                    if (this.scrollingDivs[oldDiv.id]) {
                        this.scrollingDivs[oldDiv.id].removeEvents();
                    }
                    //Let's check if it has a function to run to update the data
                    
                    this.parsePanelFunctions(what, oldDiv);
                
                }
            } catch (e) {
                console.log("Error with loading content " + e + "  - " + target);
            }
        },       
	    launch: function() {
            
            if (this.hasLaunched == false || this.launchCompleted) {
                this.hasLaunched = true;
                return;
            }
            this.isAppMobi = (window.AppMobi && typeof (AppMobi) == "object"&&AppMobi.app!==undefined) ? true : false;
            var that = this;
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
                this.menu.innerHTML = "<div id='menu_scroller'></div>";
                this.viewportContainer.append(this.menu);
                this.scrollingDivs["menu_scroller"] = jq("#menu_scroller").scroller({
                    scrollBars: true,
                    verticalScroll: true,
                    vScrollCSS: "jqmScrollbar"
                });
            }
            
            
            if (!this.content) {
                this.content = document.createElement("div");
                this.content.id = "content";
                this.viewportContainer.append(this.content);
            }
            this.header.innerHTML = '<a id="backButton"  href="javascript:;"><div>Back</div></a> <h1 id="pageTitle"></h1>' + header.innerHTML;
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
            modalDiv.className = "modal";
            
            
            this.viewportContainer.append(modalDiv);
            this.modalWindow = modalDiv;
            this.updateAnchors(this.navbar, 1);
            this.updateNavbar();
            var contentDivs = document.querySelectorAll(".panel");
            for (var i = 0; i < contentDivs.length; i++) {
                var el = contentDivs[i];
                var tmp = el;
                if (el.parentNode && el.parentNode.id != "content") {
                    el.parentNode.removeChild(el);
                    var id = el.id;
                    this.addDivAndScroll(tmp);
                    if (tmp.getAttribute("selected"))
                        this.firstDiv = $am(id);
                    id = null;
                } else if (!el.parsedContent) {
                    el.parsedContent = 1;
                    el.parentNode.removeChild(el);
                    var id = el.id;
                    this.addDivAndScroll(tmp);
                    if (tmp.getAttribute("selected"))
                        this.firstDiv = $am(id);
                    id = null;
                }
                el = null;
            }
            contentDivs = null;
            if (this.firstDiv) {
                
                var that = this;
                // Fix a bug in iOS where translate3d makes the content blurry
                this.activeDiv = this.firstDiv;
                if (this.scrollingDivs[this.activeDiv.id]) {
                    this.scrollingDivs[this.activeDiv.id].initEvents();
                }
                window.setTimeout(function() {
                    //activeDiv = firstDiv;
                    that.firstDiv.style.display = "block";
                    that.css3animate(that.firstDiv, {
                        x: "100%",
                        time: "0ms"
                    });
                    if (that.activeDiv.title)
                        that.titleBar.innerHTML = that.activeDiv.title;
                    that.parsePanelFunctions(that.activeDiv);
                }, 100);
            
            }
            modalDiv = null;
            maskDiv = null;
            this.launchCompleted = true;
            var e = document.createEvent('Events');
            e.initEvent('jq.ui.ready', true, true);
            document.dispatchEvent(e);
            jq("#splashscreen").remove();
            if (typeof (this._readyFunc) == "function") 
            {
                this._readyFunc();
            }
            
            this.defaultFooter = jq("#navbar").children();
            var firstMenu = jq("nav").get();
            this.defaultMenu = jq(firstMenu).children();
            
            this.updateMenu(this.defaultMenu);
        },             
        slideTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            
            if (back) {
                that.css3animate(oldDiv, {
                    x: "200%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "100%",
                            time: "200ms"
                        });
                    }
                });
            } else {
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                    }
                });
                that.css3animate(currDiv, {
                    x: "200%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "100%",
                            time: "200ms"
                        });
                    }
                });
            }
        },
        slideUpTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this;
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    y: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    y: "100%",
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    y: "100%",
                    x: "100%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "100%",
                            time: "200ms"
                        });
                    }
                });
            }
        },
        slideDownTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    y: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    y: "-100%",
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            
                            }
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    y: "-100%",
                    x: "100%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "100%",
                            time: "200ms"
                        });
                    }
                });
            }
        },
        flipTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "200%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "100%",
                            time: "200ms"
                        });
                    }
                });
                that.css3animate(oldDiv, {
                    x: "200%",
                    time: "200ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            opacity: 1,
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "200%",
                    time: "200ms",
                    scale: '.8',
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "200%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "100%",
                            time: "200ms"
                        });
                    }
                });
            }
        },
        fadeTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    opacity: .1,
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            opacity: 1,
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                currDiv.style.opacity = 0;
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "100%",
                            time: "200ms",
                            opacity: 1
                        });
                    }
                });
            }
        },
        popTransition: function(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    opacity: .1,
                    scale: .2,
                    origin: "50% 50%",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    y: "0%",
                    time: "1ms",
                    scale: .2,
                    origin: "50% 50%",
                    opacity: .1,
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "100%",
                            time: "200ms",
                            scale: 1,
                            opacity: 1,
                            origin: "0% 0%"
                        });
                    }
                });
            }
        },
        
        finishTransition: function(oldDiv) {
            oldDiv.style.display = 'none';
            this.doingTransition = false;
        
        }
    };
    
    function $am(el) {
        return jq("#" + el).get(0);
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

//The following is to setup the viewport properly on mobile devices.  The checking code
//is from https://github.com/zynga/viewporter
(function() {
    //Hacks for address bar
    var oldOrientation = 0, 
    orientationPos = {}, 
    jQUi;
    var hasRun = false;
    fixTopBar = function fixTopBar(force) {
        jQUi.css("position", "relative");
        jQUi.css("display", "block");
        var startHeight = window.innerHeight;
        var orientation = Math.abs(parseInt(window.orientation));
        if (isNaN(orientation))
            orientation = 0;
        if (oldOrientation == orientation && !force)
            return;
        oldOrientation = orientation;
        
        if (!orientationPos[orientation])
            document.documentElement.style.minHeight = '5000px';
        
        if (!orientationPos[orientation]) {
            var iterations = jq.os.android ? 20 : 5;
            var check = window.setInterval(function() {
                // retry scrolling
                if (window.innerHeight == 0)
                    return; //XDK reports 0 sometimes
                if (!jq.os.android)
                    window.scrollTo(0, 1); // Android has issues removing the address bar
                if (window.innerHeight > startHeight || --iterations < 0)  // iOS is comparably easy!
                {
                    document.documentElement.style.minHeight = window.innerHeight + 'px';
                    jQUi.css("height", window.innerHeight + "px");
                    clearInterval(check);
                    orientationPos[orientation] = jQUi.css("height");
                }
            }, 10);
        } else {
            document.documentElement.style.minHeight = window.innerHeight + 'px';
            jQUi.css("height", orientationPos[orientation]);
        }
    }


    jq(document).ready(function() {
		if (jq("nav").length > 0) 
        {
            jq("#jQUi #header").addClass("hasMenu");
            jq("#jQUi #content").addClass("hasMenu");
            jq("#jQUi #navbar").addClass("hasMenu");
        }
        jQUi = jq("#jQUi");
        fixTopBar(1);
    });
    
    window.addEventListener("orientationchange", function() {
        jq.ui.updateOrientation()
        window.scrollTo(0, 1)
        fixTopBar()
    }, true);
    
    var preventDefaultScroll = function(event) {
        event.preventDefault();
        window.scroll(0, 0);
        return false;
    };
    document.addEventListener('touchmove', preventDefaultScroll, false);
})();