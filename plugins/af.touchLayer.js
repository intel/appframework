//TouchLayer contributed by Carlos Ouro @ Badoo
//un-authoritive layer between touches and actions on the DOM
//(un-authoritive: listeners do not require useCapture)
//handles overlooking JS and native scrolling, panning,
//no delay on click, edit mode focus, preventing defaults, resizing content,
//enter/exit edit mode (keyboard on screen), prevent clicks on momentum, etc
//It can be used independently in other apps but it is required by jqUi
//Object Events
//Enter Edit Mode:
//pre-enter-edit - when a possible enter-edit is actioned - happens before actual click or focus (android can still reposition elements and event is actioned)
//cancel-enter-edit - when a pre-enter-edit does not result in a enter-edit
//enter-edit - on a enter edit mode focus
//enter-edit-reshape - focus resized/scrolled event
//in-edit-reshape - resized/scrolled event when a different element is focused
//Exit Edit Mode
//exit-edit - on blur
//exit-edit-reshape - blur resized/scrolled event
//Other
//orientationchange-reshape - resize event due to an orientationchange action
//reshape - window.resize/window.scroll event (ignores onfocus "shaking") - general reshape notice
(function($) {

    //singleton
    $.touchLayer = function(el) {
        //	if(af.os.desktop||!af.os.webkit) return;
        $.touchLayer = new touchLayer(el);
        return $.touchLayer;
    };
    //configuration stuff
    var inputElements = ['input', 'select', 'textarea'];
    var autoBlurInputTypes = ['button', 'radio', 'checkbox', 'range', 'date'];
    var requiresJSFocus = $.os.ios; //devices which require .focus() on dynamic click events
    var verySensitiveTouch = $.os.blackberry; //devices which have a very sensitive touch and touchmove is easily fired even on simple taps
    var inputElementRequiresNativeTap = $.os.blackberry||$.os.fennec || ($.os.android && !$.os.chrome); //devices which require the touchstart event to bleed through in order to actually fire the click on select elements
    var selectElementRequiresNativeTap = $.os.blackberry||$.os.fennec || ($.os.android && !$.os.chrome); //devices which require the touchstart event to bleed through in order to actually fire the click on select elements
    var focusScrolls = $.os.ios; //devices scrolling on focus instead of resizing
    var requirePanning = $.os.ios&&!$.os.ios7; //devices which require panning feature
    var addressBarError = 0.97; //max 3% error in position
    var maxHideTries = 2; //HideAdressBar does not retry more than 2 times (3 overall)
    var skipTouchEnd = false; //Fix iOS bug with alerts/confirms
    var cancelClick = false;

    function getTime() {
        var d = new Date();
        var n = d.getTime();
        return n;
    }
    var touchLayer = function(el) {
        this.clearTouchVars();
        el.addEventListener('touchstart', this, false);
        el.addEventListener('touchmove', this, false);
        el.addEventListener('touchend', this, false);
        el.addEventListener('click', this, false);
        el.addEventListener("focusin", this, false);
        document.addEventListener('scroll', this, false);
        window.addEventListener("resize", this, false);
        window.addEventListener("orientationchange", this, false);
        this.layer = el;
        //proxies
        this.scrollEndedProxy_ = $.proxy(this.scrollEnded, this);
        this.exitEditProxy_ = $.proxy(this.exitExit, this, []);
        this.launchFixUIProxy_ = $.proxy(this.launchFixUI, this);
        var that = this;
        this.scrollTimeoutExpireProxy_ = function() {
            that.scrollTimeout_ = null;
            that.scrollTimeoutEl_.addEventListener('scroll', that.scrollEndedProxy_, false);
        };
        this.retestAndFixUIProxy_ = function() {
            if (af.os.android) that.layer.style.height = '100%';
            $.asap(that.testAndFixUI, that, arguments);
        };
        //iPhone double clicks workaround
        document.addEventListener('click', function(e) {
        
            if (cancelClick) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            if (e.clientX !== undefined && that.lastTouchStartX != null) {
                if (2 > Math.abs(that.lastTouchStartX - e.clientX) && 2 > Math.abs(that.lastTouchStartY - e.clientY)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);
        //js scrollers self binding
        $.bind(this, 'scrollstart', function(el) {
            that.isScrolling = true;
            that.scrollingEl_ = el;
            if (!$.feat.nativeTouchScroll)
                that.scrollerIsScrolling = true;
            that.fireEvent('UIEvents', 'scrollstart', el, false, false);
        });
        $.bind(this, 'scrollend', function(el) {
            that.isScrolling = false;
            if (!$.feat.nativeTouchScroll)
                that.scrollerIsScrolling = false;
            that.fireEvent('UIEvents', 'scrollend', el, false, false);
        });
        //fix layer positioning
        this.launchFixUI(5); //try a lot to set page into place
    };

    touchLayer.prototype = {
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
        touchStartX: null,
        touchStartY: null,
        //elements
        layer: null,
        scrollingEl_: null,
        scrollTimeoutEl_: null,
        //handles / proxies
        scrollTimeout_: null,
        reshapeTimeout_: null,
        scrollEndedProxy_: null,
        exitEditProxy_: null,
        launchFixUIProxy_: null,
        reHideAddressBarTimeout_: null,
        retestAndFixUIProxy_: null,
        //options
        panElementId: "header",
        //public locks
        blockClicks: false,
        //private locks
        allowDocumentScroll_: false,
        ignoreNextResize_: false,
        blockPossibleClick_: false,
        //status vars
        isScrolling: false,
        isScrollingVertical_: false,
        wasPanning_: false,
        isPanning_: false,
        isFocused_: false,
        justBlurred_: false,
        requiresNativeTap: false,
        holdingReshapeType_: null,
        trackingClick: false,
        scrollerIsScrolling: false,

        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                    this.onTouchStart(e);
                    break;
                case 'touchmove':
                    this.onTouchMove(e);
                    break;
                case 'touchend':
                    this.onTouchEnd(e);
                    break;
                case 'click':
                    this.onClick(e);
                    break;
                case 'blur':
                    this.onBlur(e);
                    break;
                case 'scroll':
                    this.onScroll(e);
                    break;
                case 'orientationchange':
                    this.onOrientationChange(e);
                    break;
                case 'resize':
                    this.onResize(e);
                    break;
                case 'focusin':
                    this.onFocusIn(e);
                    break;
            }
        },
        launchFixUI: function(maxTries) {
            //this.log("launchFixUI");
            if (!maxTries) maxTries = maxHideTries;
            if (this.reHideAddressBarTimeout_ === null) return this.testAndFixUI(0, maxTries);
        },
        resetFixUI: function() {
            //this.log("resetFixUI");
            if (this.reHideAddressBarTimeout_) clearTimeout(this.reHideAddressBarTimeout_);
            this.reHideAddressBarTimeout_ = null;
        },
        testAndFixUI: function(retry, maxTries) {
            //this.log("testAndFixUI");
            //for ios or if the heights are incompatible (and not close)
            var refH = this.getReferenceHeight();
            var curH = this.getCurrentHeight();
            if ((refH != curH && !(curH * addressBarError < refH && refH * addressBarError < curH))) {
                //panic! page is out of place!
                this.hideAddressBar(retry, maxTries);
                return true;
            }
            if (af.os.android) this.resetFixUI();
            return false;
        },
        hideAddressBar: function(retry, maxTries) {
            if(af.ui&&af.ui.isIntel) return;
            if (retry >= maxTries) {
                this.resetFixUI();
                return; //avoid a possible loop
            }

            //this.log("hiding address bar");
            if (af.os.desktop || af.os.chrome) {
                this.layer.style.height = "100%";
            } else if (af.os.android) {
                //on some phones its immediate
                window.scrollTo(1, 1);
                this.layer.style.height = this.isFocused_ || window.innerHeight > window.outerHeight ? (window.innerHeight) + "px" : ((window.outerHeight) / window.devicePixelRatio) + 'px';
                //sometimes android devices are stubborn
                that = this;
                //re-test in a bit (some androids (SII, Nexus S, etc) fail to resize on first try)
                var nextTry = retry + 1;
                this.reHideAddressBarTimeout_ = setTimeout(this.retestAndFixUIProxy_, 250 * nextTry, [nextTry, maxTries]); //each fix is progressibily longer (slower phones fix)
            } else if (!this.isFocused_) {
                document.documentElement.style.height = "5000px";
                window.scrollTo(0, 0);
                document.documentElement.style.height = window.innerHeight + "px";
                this.layer.style.height = window.innerHeight + "px";
            }
        },
        getReferenceHeight: function() {
            //the height the page should be at
            if (af.os.android) {
                return Math.ceil(window.outerHeight / window.devicePixelRatio);
            } else return window.innerHeight;
        },
        getCurrentHeight: function() {
            //the height the page really is at
            if (af.os.android) {
                return window.innerHeight;
            } else return numOnly(document.documentElement.style.height); //TODO: works well on iPhone, test BB
        },
        onOrientationChange: function(e) {
            //this.log("orientationchange");
            //if a resize already happened, fire the orientationchange
            if (!this.holdingReshapeType_ && this.reshapeTimeout_) {
                this.fireReshapeEvent('orientationchange');
            } else this.previewReshapeEvent('orientationchange');
        },
        onResize: function(e) {
            //avoid infinite loop on iPhone
            if (this.ignoreNextResize_) {
                //this.log('ignored resize');
                this.ignoreNextResize_ = false;
                return;
            }
            //this.logInfo('resize');
            if (this.launchFixUI()) {
                this.reshapeAction();
            }
        },
        onClick: function(e) {
            //handle forms
            var tag = e.target && e.target.tagName !== undefined ? e.target.tagName.toLowerCase() : '';
            
            //this.log("click on "+tag);
            if (inputElements.indexOf(tag) !== -1 && (!this.isFocused_ || e.target !== (this.focusedElement))) {
                var type = e.target && e.target.type !== undefined ? e.target.type.toLowerCase() : '';
                var autoBlur = autoBlurInputTypes.indexOf(type) !== -1;

                //focus
                if (!autoBlur) {
                    //remove previous blur event if this keeps focus
                    if (this.isFocused_) {
                        this.focusedElement.removeEventListener('blur', this, false);
                    }
                    this.focusedElement = e.target;
                    this.focusedElement.addEventListener('blur', this, false);
                    //android bug workaround for UI
                    if (!this.isFocused_ && !this.justBlurred_) {
                        //this.log("enter edit mode");
                        $.trigger(this, 'enter-edit', [e.target]);
                        //fire / preview reshape event
                        if ($.os.ios) {
                            var that = this;
                            setTimeout(function() {
                                that.fireReshapeEvent('enter-edit');
                            }, 300); //TODO: get accurate reading from window scrolling motion and get rid of timeout
                        } else this.previewReshapeEvent('enter-edit');
                    }
                    this.isFocused_ = true;
                } else {
                    this.isFocused_ = false;
                }
                this.justBlurred_ = false;
                this.allowDocumentScroll_ = true;

                //fire focus action
                if (requiresJSFocus) {
                    e.target.focus();
                }

                //BB10 needs to be preventDefault on touchstart and thus need manual blur on click
            } else if ($.os.blackberry10 && this.isFocused_) {
                

                this.focusedElement.blur();
            }
        },
        previewReshapeEvent: function(ev) {
            //a reshape event of this type should fire within the next 750 ms, otherwise fire it yourself
            that = this;
            this.reshapeTimeout_ = setTimeout(function() {
                that.fireReshapeEvent(ev);
                that.reshapeTimeout_ = null;
                that.holdingReshapeType_ = null;
            }, 750);
            this.holdingReshapeType_ = ev;
        },
        fireReshapeEvent: function(ev) {
            //this.log(ev?ev+'-reshape':'unknown-reshape');
            $.trigger(this, 'reshape'); //trigger a general reshape notice
            $.trigger(this, ev ? ev + '-reshape' : 'unknown-reshape'); //trigger the specific reshape
        },
        reshapeAction: function() {
            if (this.reshapeTimeout_) {
                //we have a specific reshape event waiting for a reshapeAction, fire it now
                clearTimeout(this.reshapeTimeout_);
                this.fireReshapeEvent(this.holdingReshapeType_);
                this.holdingReshapeType_ = null;
                this.reshapeTimeout_ = null;
            } else this.previewReshapeEvent();
        },
        onFocusIn: function(e) {
            if (!this.isFocused_)
                this.onClick(e);
        },
        onBlur: function(e) {
            if (af.os.android && e.target == window) return; //ignore window blurs

            this.isFocused_ = false;
            //just in case...
            if (this.focusedElement) this.focusedElement.removeEventListener('blur', this, false);
            this.focusedElement = null;
            //make sure this blur is not followed by another focus
            this.justBlurred_ = true;
            $.asap(this.exitEditProxy_, this, [e.target]);
        },
        exitExit: function(el) {
            this.justBlurred_ = false;
            if (!this.isFocused_) {
                //this.log("exit edit mode");
                $.trigger(this, 'exit-edit', [el]);
                //do not allow scroll anymore
                this.allowDocumentScroll_ = false;
                //fire / preview reshape event
                if ($.os.ios) {
                    var that = this;
                    setTimeout(function() {
                        that.fireReshapeEvent('exit-edit');
                    }, 300); //TODO: get accurate reading from window scrolling motion and get rid of timeout
                } else this.previewReshapeEvent('exit-edit');
            }
        },
        onScroll: function(e) {
            //this.log("document scroll detected "+document.body.scrollTop);
            if (!this.allowDocumentScroll_ && !this.isPanning_ && e.target == (document)) {
                this.allowDocumentScroll_ = true;
                if (this.wasPanning_) {
                    this.wasPanning_ = false;
                    //give it a couple of seconds
                    setTimeout(this.launchFixUIProxy_, 2000, [maxHideTries]);
                } else {
                    //this.log("scroll forced page into place");
                    this.launchFixUI();
                }
            }
        },

        onTouchStart: function(e) {
            //setup initial touch position
            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
            this.lastTimestamp = e.timeStamp;
            this.lastTouchStartX = this.lastTouchStartY = null;

            if ($.os.ios) {

                if (skipTouchEnd === e.touches[0].identifier) {
                    cancelClick = true;
                    e.preventDefault();
                    return false;
                }
                skipTouchEnd = e.touches[0].identifier;
                cancelClick = false;
            }

            if (this.scrollerIsScrolling) {
                this.moved = true;
                this.scrollerIsScrolling = false;
                e.preventDefault();

                return false;
            }
            this.trackingClick = true;
            //check dom if necessary
            if (requirePanning || $.feat.nativeTouchScroll) this.checkDOMTree(e.target, this.layer);
            //scrollend check
            if (this.isScrolling) {
                //remove prev timeout
                if (this.scrollTimeout_ !== null) {
                    clearTimeout(this.scrollTimeout_);
                    this.scrollTimeout_ = null;
                    //different element, trigger scrollend anyway
                    if (this.scrollTimeoutEl_ != this.scrollingEl_) this.scrollEnded(false);
                    else this.blockPossibleClick_ = true;
                    //check if event was already set
                } else if (this.scrollTimeoutEl_) {
                    //trigger
                    this.scrollEnded(true);
                    this.blockPossibleClick_ = true;
                }

            }


            // We allow forcing native tap in android devices (required in special cases)
            var forceNativeTap = (af.os.android && e && e.target && e.target.getAttribute && e.target.getAttribute("data-touchlayer") == "ignore");

            //if on edit mode, allow all native touches
            //(BB10 must still be prevented, always clicks even after move)
            if (forceNativeTap || (this.isFocused_ && !$.os.blackberry10)) {
                this.requiresNativeTap = true;
                this.allowDocumentScroll_ = true;

                //some stupid phones require a native tap in order for the native input elements to work
            } else if (inputElementRequiresNativeTap && e.target && e.target.tagName !== undefined) {
                var tag = e.target.tagName.toLowerCase();
                if (inputElements.indexOf(tag) !== -1) {
                    //notify scrollers (android forms bug), except for selects
                    //if(tag != 'select') $.trigger(this, 'pre-enter-edit', [e.target]);
                    this.requiresNativeTap = true;
                }
            } else if (e.target && e.target.tagName !== undefined && e.target.tagName.toLowerCase() == "input" && e.target.type == "range") {
                this.requiresNativeTap = true;
            }

            //prevent default if possible
            if (!this.isPanning_ && !this.requiresNativeTap) {
                if ((this.isScrolling && !$.feat.nativeTouchScroll) || (!this.isScrolling))
                    e.preventDefault();
                //demand vertical scroll (don't let it pan the page)
            } else if (this.isScrollingVertical_) {
                this.demandVerticalScroll();
            }

        },
        demandVerticalScroll: function() {
            //if at top or bottom adjust scroll
            var atTop = this.scrollingEl_.scrollTop <= 0;
            if (atTop) {
                //this.log("adjusting scrollTop to 1");
                this.scrollingEl_.scrollTop = 1;
            } else {
                var scrollHeight = this.scrollingEl_.scrollTop + this.scrollingEl_.clientHeight;
                var atBottom = scrollHeight >= this.scrollingEl_.scrollHeight;
                if (atBottom) {
                    //this.log("adjusting scrollTop to max-1");
                    this.scrollingEl_.scrollTop = this.scrollingEl_.scrollHeight - this.scrollingEl_.clientHeight - 1;
                }
            }
        },
        //set rules here to ignore scrolling check on these elements
        //consider forcing user to use scroller object to assess these... might be causing bugs
        ignoreScrolling: function(el) {
            if (el['scrollWidth'] === undefined || el['clientWidth'] === undefined) return true;
            if (el['scrollHeight'] === undefined || el['clientHeight'] === undefined) return true;
            return false;
        },

        allowsVerticalScroll: function(el, styles) {
            var overflowY = styles.overflowY;
            if (overflowY == 'scroll') return true;
            if (overflowY == 'auto' && el['scrollHeight'] > el['clientHeight']) return true;
            return false;
        },
        allowsHorizontalScroll: function(el, styles) {
            var overflowX = styles.overflowX;
            if (overflowX == 'scroll') return true;
            if (overflowX == 'auto' && el['scrollWidth'] > el['clientWidth']) return true;
            return false;
        },


        //check if pan or native scroll is possible
        checkDOMTree: function(el, parentTarget) {

            //check panning
            //temporarily disabled for android - click vs panning issues
            if (requirePanning && this.panElementId == el.id) {
                this.isPanning_ = true;
                return;
            }
            //check native scroll
            if ($.feat.nativeTouchScroll) {

                //prevent errors
                if (this.ignoreScrolling(el)) {
                    return;
                }

                //check if vertical or hor scroll are allowed
                var styles = window.getComputedStyle(el);
                if (this.allowsVerticalScroll(el, styles)) {
                    this.isScrollingVertical_ = true;
                    this.scrollingEl_ = el;
                    this.isScrolling = true;
                    return;
                } else if (this.allowsHorizontalScroll(el, styles)) {
                    this.isScrollingVertical_ = false;
                    this.scrollingEl_ = null;
                    this.isScrolling = true;
                }

            }
            //check recursive up to top element
            var isTarget = el == (parentTarget);
            if (!isTarget && el.parentNode) this.checkDOMTree(el.parentNode, parentTarget);
        },
        //scroll finish detectors
        scrollEnded: function(e) {
            //this.log("scrollEnded");
            if (this.scrollTimeoutEl_ === null) { return; }
            if (e) this.scrollTimeoutEl_.removeEventListener('scroll', this.scrollEndedProxy_, false);
            this.fireEvent('UIEvents', 'scrollend', this.scrollTimeoutEl_, false, false);
            this.scrollTimeoutEl_ = null;
        },


        onTouchMove: function(e) {
            //set it as moved
            var wasMoving = this.moved;
            this.moved = true;
            //very sensitive devices check
            if (verySensitiveTouch) {
                this.cY = e.touches[0].pageY - this.dY;
                this.cX = e.touches[0].pageX - this.dX;
            }
            //panning check
            if (this.isPanning_) {
                return;
            }
            //native scroll (for scrollend)
            if (this.isScrolling) {

                if (!wasMoving) {
                    //this.log("scrollstart");
                    this.fireEvent('UIEvents', 'scrollstart', this.scrollingEl_, false, false);
                }
                //if(this.isScrollingVertical_) {
                this.speedY = (this.lastY - e.touches[0].pageY) / (e.timeStamp - this.lastTimestamp);
                this.lastY = e.touches[0].pageY;
                this.lastX = e.touches[0].pageX;
                this.lastTimestamp = e.timeStamp;
                //}
            }
            //non-native scroll devices

            if ((!$.os.blackberry10)) {
                //legacy stuff for old browsers
                if (!this.isScrolling || !$.feat.nativeTouchScroll)
                    e.preventDefault();
                return;
            }
            //e.stopImmediatPropegation();
            //e.stopPropagation();
        },

        onTouchEnd: function(e) {

            //double check moved for sensitive devices)
            var itMoved = this.moved;
            if (verySensitiveTouch) {
                itMoved = itMoved && !(Math.abs(this.cX) < 10 && Math.abs(this.cY) < 10);
            }

            //don't allow document scroll unless a specific click demands it further ahead
            if (!af.os.ios || !this.requiresNativeTap) this.allowDocumentScroll_ = false;

            //panning action

            if (this.isPanning_ && itMoved) {
                //wait 2 secs and cancel
                this.wasPanning_ = true;

                //a generated click
            } else if (!itMoved && !this.requiresNativeTap) {
                this.scrollerIsScrolling = false;
                if (!this.trackingClick) {
                    return;
                }
                //NOTE: on android if touchstart is not preventDefault(), click will fire even if touchend is prevented
                //this is one of the reasons why scrolling and panning can not be nice and native like on iPhone
                e.preventDefault();

                //fire click
                if (!this.blockClicks && !this.blockPossibleClick_) {
                    var theTarget = e.target;
                    if (theTarget.nodeType == 3) theTarget = theTarget.parentNode;
                    this.fireEvent('Event', 'click', theTarget, true, e.mouseToTouch, e.changedTouches[0]);
                    this.lastTouchStartX = this.dX;
                    this.lastTouchStartY = this.dY;
                }

            } else if (itMoved) {
                //setup scrollend stuff
                if (this.isScrolling) {
                    this.scrollTimeoutEl_ = this.scrollingEl_;
                    if (Math.abs(this.speedY) < 0.01) {
                        //fire scrollend immediatly
                        //this.log(" scrollend immediately "+this.speedY);
                        this.scrollEnded(false);
                    } else {
                        //wait for scroll event
                        //this.log($.debug.since()+" setting scroll timeout "+this.speedY);
                        this.scrollTimeout_ = setTimeout(this.scrollTimeoutExpireProxy_, 30);
                    }
                }
                //trigger cancel-enter-edit on inputs
                if (this.requiresNativeTap) {
                    if (!this.isFocused_) $.trigger(this, 'cancel-enter-edit', [e.target]);
                }
            }
            if($.os.blackberry10) {
                this.lastTouchStartX = this.dX;
                this.lastTouchStartY = this.dY;
            }
            
            this.clearTouchVars();
        },

        clearTouchVars: function() {
            //this.log("clearing touchVars");
            this.speedY = this.lastY = this.cY = this.cX = this.dX = this.dY = 0;
            this.moved = false;
            this.isPanning_ = false;
            this.isScrolling = false;
            this.isScrollingVertical_ = false;
            this.requiresNativeTap = false;
            this.blockPossibleClick_ = false;
            this.trackingClick = false;
        },

        fireEvent: function(eventType, eventName, target, bubbles, mouseToTouch, data) {
            //this.log("Firing event "+eventName);
            //create the event and set the options
            var theEvent = document.createEvent(eventType);
            theEvent.initEvent(eventName, bubbles, true);
            theEvent.target = target;
            if (data) {
                $.each(data, function(key, val) {
                    theEvent[key] = val;
                });
            }
            //af.DesktopBrowsers flag
            if (mouseToTouch) theEvent.mouseToTouch = true;
            target.dispatchEvent(theEvent);
        }
    };

})(af);