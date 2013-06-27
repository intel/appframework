/**
 * af.scroller 
 * created by appMobi with modifications by Carlos Ouro @ Badoo and Intel
 * Supports iOS native touch scrolling
 * Optimizations and bug improvements by Intel
 * @copyright Intel
 */ (function ($) {
    var HIDE_REFRESH_TIME = 75; // hide animation of pull2ref duration in ms
    var cache = [];
    var objId = function (obj) {
        if (!obj.afScrollerId) obj.afScrollerId = $.uuid();
        return obj.afScrollerId;
    };
    $.fn["scroller"] = function (opts) {
        var tmp, id;
        for (var i = 0; i < this.length; i++) {
            //cache system
            id = objId(this[i]);
            if (!cache[id]) {
                if (!opts) opts = {};
                if (!$.feat.nativeTouchScroll) opts.useJsScroll = true;

                tmp = scroller(this[i], opts);
                cache[id] = tmp;
            } else {
                tmp = cache[id];
            }
        }
        return this.length == 1 ? tmp : this;
    };
    var boundTouchLayer = false;

    function checkConsistency(id) {
        if (!cache[id].el) {
            delete cache[id];
            return false;
        }
        return true;
    }

    function bindTouchLayer() {
        //use a single bind for all scrollers
        if (af.os.android && !af.os.chrome && af.os.webkit) {
            var androidFixOn = false;
            //connect to touchLayer to detect editMode
            $.bind($.touchLayer, ['cancel-enter-edit', 'exit-edit'], function (focusEl) {
                if (androidFixOn) {
                    androidFixOn = false;
                    //dehactivate on scroller
                    for (var el in cache)
                        if (checkConsistency(el) && cache[el].androidFormsMode) cache[el].stopFormsMode();
                }
            });
        }
        boundTouchLayer = true;
    }
    var scroller = (function () {
        var translateOpen = $.feat.cssTransformStart;
        var translateClose = $.feat.cssTransformEnd;
        var jsScroller, nativeScroller;

        //initialize and js/native mode selector
        var scroller = function (elID, opts) {

            var el;

            if (!boundTouchLayer && $.touchLayer && $.isObject($.touchLayer)) bindTouchLayer();
            else if (!$.touchLayer || !$.isObject($.touchLayer)) $.touchLayer = {};
            if (typeof elID == "string" || elID instanceof String) {
                el = document.getElementById(elID);
            } else {
                el = elID;
            }
            if (!el) {
                alert("Could not find element for scroller " + elID);
                return;
            }
            if (af.os.desktop)
                return new scrollerCore(el, opts);
            else if (opts.useJsScroll) return new jsScroller(el, opts);
            return new nativeScroller(el, opts);

        };

        //parent abstract class (common functionality)
        var scrollerCore = function (el, opts) {
            this.el = el;
            this.afEl = $(this.el);
            for (var j in opts) {
                this[j] = opts[j];
            }
        };
        scrollerCore.prototype = {
            //core default properties
            refresh: false,
            refreshContent: "Pull to Refresh",
            refreshHangTimeout: 2000,
            refreshHeight: 60,
            refreshElement: null,
            refreshCancelCB: null,
            refreshRunning: false,
            scrollTop: 0,
            scrollLeft: 0,
            preventHideRefresh: true,
            verticalScroll: true,
            horizontalScroll: false,
            refreshTriggered: false,
            moved: false,
            eventsActive: false,
            rememberEventsActive: false,
            scrollingLocked: false,
            autoEnable: true,
            blockFormsFix: false,
            loggedPcentY: 0,
            loggedPcentX: 0,
            infinite: false,
            infiniteEndCheck: false,
            infiniteTriggered: false,
            scrollSkip: false,
            scrollTopInterval: null,
            scrollLeftInterval: null,
            bubbles:true,
            lockBounce:false,
            _scrollTo: function (params, time) {
                time = parseInt(time, 10);
                if (time === 0 || isNaN(time)) {
                    this.el.scrollTop = Math.abs(params.y);
                    this.el.scrollLeft = Math.abs(params.x);
                    return;
                }
                var singleTick = 10;
                var distPerTick = (this.el.scrollTop - params.y) / Math.ceil(time / singleTick);
                var distLPerTick = (this.el.scrollLeft - params.x) / Math.ceil(time / singleTick);
                var self = this;
                var toRunY = Math.ceil(this.el.scrollTop - params.y) / distPerTick;
                var toRunX = Math.ceil(this.el.scrollLeft - params.x) / distPerTick;
                var xRun =0, yRun = 0;
                self.scrollTopInterval = window.setInterval(function () {
                    self.el.scrollTop -= distPerTick;
                    yRun++;
                    if (yRun >= toRunY) {
                        self.el.scrollTop = params.y;
                        clearInterval(self.scrollTopInterval);
                    }
                }, singleTick);

                self.scrollLeftInterval = window.setInterval(function () {
                    self.el.scrollLeft -= distLPerTick;
                    xRun++;
                    if (xRun >= toRunX) {
                        self.el.scrollLeft = params.x;
                        clearInterval(self.scrollLeftInterval);
                    }
                }, singleTick);
            },
            enable: function () {},
            disable: function () {},
            hideScrollbars: function () {},
            addPullToRefresh: function () {},
            /**
             * We do step animations for 'native' - iOS is acceptable and desktop browsers are fine
             * instead of css3
             */
            _scrollToTop: function (time) {
                this._scrollTo({
                    x: 0,
                    y: 0
                }, time);
            },
            _scrollToBottom: function (time) {
                this._scrollTo({
                    x: 0,
                    y: this.el.scrollHeight - this.el.offsetHeight
                }, time);
            },
            scrollToBottom: function (time) {
                return this._scrollToBottom(time);
            },
            scrollToTop: function (time) {
                return this._scrollToTop(time);
            },

            //methods
            init: function (el, opts) {
                this.el = el;
                this.afEl = $(this.el);
                this.defaultProperties();
                for (var j in opts) {
                    this[j] = opts[j];
                }
                //assign self destruct
                var that = this;
                var orientationChangeProxy = function () {
                    //no need to readjust if disabled...
                    if (that.eventsActive) that.adjustScroll();
                };
                this.afEl.bind('destroy', function () {
                    that.disable(true); //with destroy notice
                    var id = that.el.afScrollerId;
                    if (cache[id]) delete cache[id];
                    $.unbind($.touchLayer, 'orientationchange-reshape', orientationChangeProxy);
                });
                $.bind($.touchLayer, 'orientationchange-reshape', orientationChangeProxy);
            },
            needsFormsFix: function (focusEl) {
                return this.useJsScroll && this.isEnabled() && this.el.style.display != "none" && $(focusEl).closest(this.afEl).size() > 0;
            },
            handleEvent: function (e) {
                if (!this.scrollingLocked) {
                    switch (e.type) {
                        case 'touchstart':
                            clearInterval(this.scrollTopInterval);
                            this.preventHideRefresh = !this.refreshRunning; // if it's not running why prevent it xD
                            this.moved = false;
                            this.onTouchStart(e);
                            if(!this.bubbles)
                                e.stopPropagation();
                            break;
                        case 'touchmove':

                            this.onTouchMove(e);
                            if(!this.bubbles)
                                e.stopPropagation();
                            break;
                        case 'touchend':
                            this.onTouchEnd(e);
                            if(!this.bubbles)
                                e.stopPropagation();
                            break;
                        case 'scroll':
                            this.onScroll(e);
                            break;
                    }
                }
            },
            coreAddPullToRefresh: function (rEl) {
                if (rEl) this.refreshElement = rEl;
                //Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
                //add the refresh div
                var afEl;
                if (this.refreshElement === null) {
                    var orginalEl = document.getElementById(this.container.id + "_pulldown");
                    if (orginalEl !== null) {
                        afEl = af(orginalEl);
                    } else {
                        afEl = af("<div id='" + this.container.id + "_pulldown' class='afscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;position:relative;text-align:center;line-height:60px;color:white;width:100%;'>" + this.refreshContent + "</div>");
                    }
                } else {
                    afEl = af(this.refreshElement);
                }
                var el = afEl.get(0);

                this.refreshContainer = af("<div style=\"overflow:hidden;width:100%;height:0;margin:0;padding:0;padding-left:5px;padding-right:5px;display:none;\"></div>");
                $(this.el).prepend(this.refreshContainer.append(el, 'top'));
                this.refreshContainer = this.refreshContainer[0];
            },
            fireRefreshRelease: function (triggered, allowHide) {
                if (!this.refresh || !triggered) return;

                var autoCancel = $.trigger(this, 'refresh-release', [triggered]) !== false;
                this.preventHideRefresh = false;
                this.refreshRunning = true;
                if (autoCancel) {
                    var that = this;
                    if (this.refreshHangTimeout > 0) this.refreshCancelCB = setTimeout(function () {
                            that.hideRefresh();
                        }, this.refreshHangTimeout);
                }
            },
            setRefreshContent: function (content) {
                af(this.container).find(".afscroll_refresh").html(content);
            },
            lock: function () {
                if (this.scrollingLocked) return;
                this.scrollingLocked = true;
                this.rememberEventsActive = this.eventsActive;
                if (!this.eventsActive) {
                    this.initEvents();
                }
            },
            unlock: function () {
                if (!this.scrollingLocked) return;
                this.scrollingLocked = false;
                if (!this.rememberEventsActive) {
                    this.removeEvents();
                }
            },
            scrollToItem: function (el, where) { //TODO: add functionality for x position
                if (!$.is$(el)) el = $(el);
                var newTop,itemPos,panelTop,itemTop;
                if (where == 'bottom') {
                    itemPos = el.offset();
                    newTop = itemPos.top - this.afEl.offset().bottom + itemPos.height;
                    newTop += 4; //add a small space
                } else {
                    itemTop = el.offset().top;
                    newTop = itemTop - document.body.scrollTop;
                    panelTop = this.afEl.offset().top;
                    if (document.body.scrollTop < panelTop) {
                        newTop -= panelTop;
                    }
                    newTop -= 4; //add a small space
                }

                this.scrollBy({
                    y: newTop,
                    x: 0
                }, 0);
            },
            setPaddings: function (top, bottom) {
                var el = $(this.el);
                var curTop = numOnly(el.css('paddingTop'));
                el.css('paddingTop', top + "px").css('paddingBottom', bottom + "px");
                //don't let padding mess with scroll
                this.scrollBy({
                    y: top - curTop,
                    x: 0
                });
            },
            //freak of mathematics, but for our cases it works
            divide: function (a, b) {
                return b !== 0 ? a / b : 0;
            },
            isEnabled: function () {
                return this.eventsActive;
            },
            addInfinite: function () {
                this.infinite = true;
            },
            clearInfinite: function () {
                this.infiniteTriggered = false;
                this.scrollSkip = true;
            }
        };

        //extend to jsScroller and nativeScroller (constructs)
        jsScroller = function (el, opts) {
            this.init(el, opts);
            //test
            //this.refresh=true;
            this.container = this.el.parentNode;
            this.container.afScrollerId = el.afScrollerId;
            this.afEl = $(this.container);

            if (this.container.style.overflow != 'hidden') this.container.style.overflow = 'hidden';

            this.addPullToRefresh(null, true);
            if (this.autoEnable) this.enable(true);
            var scrollDiv;
            //create vertical scroll
            if (this.verticalScroll && this.verticalScroll === true && this.scrollBars === true) {
                scrollDiv = createScrollBar(5, 20);
                scrollDiv.style.top = "0px";
                if (this.vScrollCSS) scrollDiv.className = this.vScrollCSS;
                //scrollDiv.style.opacity = "0";
                scrollDiv.style.display='none';
                this.container.appendChild(scrollDiv);
                this.vscrollBar = scrollDiv;
                scrollDiv = null;
            }
            //create horizontal scroll
            if (this.horizontalScroll && this.horizontalScroll === true && this.scrollBars === true) {
                scrollDiv = createScrollBar(20, 5);
                scrollDiv.style.bottom = "0px";


                if (this.hScrollCSS) scrollDiv.className = this.hScrollCSS;
                //scrollDiv.style.opacity = "0";
                scrollDiv.style.display='none';
                this.container.appendChild(scrollDiv);
                this.hscrollBar = scrollDiv;
                scrollDiv = null;
            }
            if (this.horizontalScroll) this.el.style['float'] = "left";

            this.el.hasScroller = true;

        };
        nativeScroller = function (el, opts) {
           
            if(opts.nativeParent){
                el=el.parentNode;
            }
            this.init(el, opts);
            
            var $el = $(el);

            if (opts.noParent !== true) {
                var oldParent = $el.parent();

                $el.css('height', oldParent.height()).css("width", oldParent.width());
                $el.insertBefore($el.parent());
                //$el.parent().parent().append($el);
                oldParent.remove();
            }
            this.container = this.el;
            $el.css("-webkit-overflow-scrolling", "touch");
            if(opts.autoEnable)
                this.enable();
        };
        nativeScroller.prototype = new scrollerCore();
        jsScroller.prototype = new scrollerCore();




        ///Native scroller
        nativeScroller.prototype.defaultProperties = function () {

            this.refreshContainer = null;
            this.dY = this.cY = 0;
            this.dX = this.cX = 0;
            this.cancelPropagation = false;
            this.loggedPcentY = 0;
            this.loggedPcentX = 0;
            var that = this;
            this.adjustScrollOverflowProxy_ = function () {
                that.afEl.css('overflow', 'auto');
                that.afEl.parent().css("overflow","hidden");
            };
        };
        nativeScroller.prototype.enable = function (firstExecution) {
            if (this.eventsActive) return;
            this.eventsActive = true;
            //unlock overflow
            this.el.style.overflow = 'auto';
            this.el.parentNode.style.overflow="hidden";
            //set current scroll

            if (!firstExecution) this.adjustScroll();
            //set events
            this.el.addEventListener('touchstart', this, false);
            this.el.addEventListener('scroll', this, false);
        };
        nativeScroller.prototype.disable = function (destroy) {
            if (!this.eventsActive) return;
            //log current scroll
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
            //lock overflow
            if (!destroy) {
                this.el.style.overflow = 'hidden';
            }
            //remove events
            this.el.removeEventListener('touchstart', this, false);
            this.el.removeEventListener('touchmove', this, false);
            this.el.removeEventListener('touchend', this, false);
            this.el.removeEventListener('scroll', this, false);
            this.eventsActive = false;
        };
        nativeScroller.prototype.addPullToRefresh = function (el, leaveRefresh) {
            this.el.removeEventListener('touchstart', this, false);
            this.el.addEventListener('touchstart', this, false);
            if (!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh === true) {
                this.coreAddPullToRefresh(el);
                this.refreshContainer.style.position = "absolute";
                this.refreshContainer.style.top = "-60px";
                this.refreshContainer.style.height = "60px";
                this.refreshContainer.style.display = "block";
            }
        };
        nativeScroller.prototype.onTouchStart = function (e) {
            

            if(this.el.scrollTop===0)
                this.el.scrollTop=1;
            if(this.el.scrollTop===(this.el.scrollHeight - this.el.clientHeight))
                this.el.scrollTop-=1;
            
            if(this.horizontalScroll){
                if(this.el.scrollLeft===0)
                    this.el.scrollLeft=1;
                if(this.el.scrollLeft===(this.el.scrollWidth-this.el.clientWidth))
                    this.el.scrollLeft-=1;
            }
            if (this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
            //get refresh ready
            this.el.addEventListener('touchmove', this,false);
            this.dY = e.touches[0].pageY;
            if (this.refresh || this.infinite) {


                if (this.refresh && this.dY < 0) {
                    this.showRefresh();

                }
            }
           
        };
        nativeScroller.prototype.onTouchMove = function (e) {
           
            var newcY = e.touches[0].pageY - this.dY;
            var newcX = e.touches[0].pageX - this.dX;
            if(this.hasVertScroll&&this.el.clientHeight==this.el.scrollHeight){
                e.preventDefault();

            }
            if(this.hasHorScroll&&this.el.clientWidth==this.el.scrollWidth){
                e.preventDefault();

            }

            if (!this.moved) {
                $.trigger(this, "scrollstart", [this.el]);
                $.trigger($.touchLayer, "scrollstart", [this.el]);
                this.el.addEventListener('touchend', this, false);
                this.moved = true;
            }

            var difY = newcY - this.cY;
            var difX = newcX-this.cX;

            //check for trigger
            if (this.refresh && (this.el.scrollTop) < 0) {
                this.showRefresh();
                //check for cancel
            } else if (this.refreshTriggered && this.refresh && (this.el.scrollTop > this.refreshHeight)) {
                this.refreshTriggered = false;
                if (this.refreshCancelCB) clearTimeout(this.refreshCancelCB);
                this.hideRefresh(false);
                $.trigger(this, 'refresh-cancel');
            }

            this.cY = newcY;
            this.cX = newcX;
        };
        nativeScroller.prototype.showRefresh = function () {
            if (!this.refreshTriggered) {
                this.refreshTriggered = true;
                $.trigger(this, 'refresh-trigger');
            }
        };
        nativeScroller.prototype.onTouchEnd = function (e) {

            var triggered = this.el.scrollTop <= -(this.refreshHeight);

            this.fireRefreshRelease(triggered, true);
            if (triggered&&this.refresh) {
                //lock in place
                this.refreshContainer.style.position = "relative";
                this.refreshContainer.style.top = "0px";
            }

            this.dY = this.cY = 0;
            this.el.removeEventListener('touchmove', this, false);
            this.el.removeEventListener('touchend', this, false);
            this.infiniteEndCheck = true;
            if (this.infinite && !this.infiniteTriggered && (Math.abs(this.el.scrollTop) >= (this.el.scrollHeight - this.el.clientHeight))) {
                this.infiniteTriggered = true;
                $.trigger(this, "infinite-scroll");
                this.infiniteEndCheck = true;
            }
            this.touchEndFired = true;
            //pollyfil for scroll end since webkit doesn't give any events during the "flick"
            var max = 200;
            var self = this;
            var currPos = {
                top: this.el.scrollTop,
                left: this.el.scrollLeft
            };
            var counter = 0;
            self.nativePolling = setInterval(function () {
                counter++;
                if (counter >= max) {
                    clearInterval(self.nativePolling);
                    return;
                }
                if (self.el.scrollTop != currPos.top || self.el.scrollLeft != currPos.left) {
                    clearInterval(self.nativePolling);
                    $.trigger($.touchLayer, 'scrollend', [self.el]); //notify touchLayer of this elements scrollend
                    $.trigger(self, "scrollend", [self.el]);
                }

            }, 20);
        };
        nativeScroller.prototype.hideRefresh = function (animate) {

            if (this.preventHideRefresh) return;

            var that = this;
            var endAnimationCb = function (canceled) {
                if (!canceled) { //not sure if this should be the correct logic....
                    that.el.style[$.feat.cssPrefix + "Transform"] = "none";
                    that.el.style[$.feat.cssPrefix + "TransitionProperty"] = "none";
                    that.el.scrollTop = 0;
                    that.logPos(that.el.scrollLeft, 0);
                }
                that.refreshContainer.style.top = "-60px";
                that.refreshContainer.style.position = "absolute";
                that.dY = that.cY = 0;
                $.trigger(that, "refresh-finish");
            };

            if (animate === false || !that.afEl.css3Animate) {
                endAnimationCb();
            } else {
                that.afEl.css3Animate({
                    y: (that.el.scrollTop - that.refreshHeight) + "px",
                    x: "0%",
                    time: HIDE_REFRESH_TIME + "ms",
                    complete: endAnimationCb
                });
            }
            this.refreshTriggered = false;
            //this.el.addEventListener('touchend', this, false);
        };
        nativeScroller.prototype.hideScrollbars = function () {};
        nativeScroller.prototype.scrollTo = function (pos, time) {
            this.logPos(pos.x, pos.y);
            pos.x *= -1;
            pos.y *= -1;
            return this._scrollTo(pos, time);
        };
        nativeScroller.prototype.scrollBy = function (pos, time) {
            pos.x += this.el.scrollLeft;
            pos.y += this.el.scrollTop;
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
            return this._scrollTo(pos, time);
        };
        nativeScroller.prototype.scrollToBottom = function (time) {
            //this.el.scrollTop = this.el.scrollHeight;
            this._scrollToBottom(time);
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
        };
        nativeScroller.prototype.onScroll = function (e) {
            if (this.infinite && this.touchEndFired) {
                this.touchEndFired = false;
                return;
            }
            if (this.scrollSkip) {
                this.scrollSkip = false;
                return;
            }

            if (this.infinite) {
                if (!this.infiniteTriggered && (Math.abs(this.el.scrollTop) >= (this.el.scrollHeight - this.el.clientHeight))) {
                    this.infiniteTriggered = true;
                    $.trigger(this, "infinite-scroll");
                    this.infiniteEndCheck = true;
                }
            }


            var that = this;
            if (this.infinite && this.infiniteEndCheck && this.infiniteTriggered) {

                this.infiniteEndCheck = false;
                $.trigger(that, "infinite-scroll-end");
            }
        };
        nativeScroller.prototype.logPos = function (x, y) {


            this.loggedPcentX = this.divide(x, (this.el.scrollWidth));
            this.loggedPcentY = this.divide(y, (this.el.scrollHeight));
            this.scrollLeft = x;
            this.scrollTop = y;

            if (isNaN(this.loggedPcentX))
                this.loggedPcentX = 0;
            if (isNaN(this.loggedPcentY))
                this.loggedPcentY = 0;

        };
        nativeScroller.prototype.adjustScroll = function () {
            this.adjustScrollOverflowProxy_();

            this.el.scrollLeft = this.loggedPcentX * (this.el.scrollWidth);
            this.el.scrollTop = this.loggedPcentY * (this.el.scrollHeight);
            this.logPos(this.el.scrollLeft, this.el.scrollTop);
        };



        //JS scroller
        jsScroller.prototype.defaultProperties = function () {

            this.boolScrollLock = false;
            this.currentScrollingObject = null;
            this.elementInfo = null;
            this.verticalScroll = true;
            this.horizontalScroll = false;
            this.scrollBars = true;
            this.vscrollBar = null;
            this.hscrollBar = null;
            this.hScrollCSS = "scrollBar";
            this.vScrollCSS = "scrollBar";
            this.firstEventInfo = null;
            this.moved = false;
            this.preventPullToRefresh = true;
            this.isScrolling = false;
            this.androidFormsMode = false;
            this.refreshSafeKeep = false;

            this.lastScrollbar = "";
            this.finishScrollingObject = null;
            this.container = null;
            this.scrollingFinishCB = null;
            this.loggedPcentY = 0;
            this.loggedPcentX = 0;

        };

        function createScrollBar(width, height) {
            var scrollDiv = document.createElement("div");
            scrollDiv.style.position = 'absolute';
            scrollDiv.style.width = width + "px";
            scrollDiv.style.height = height + "px";
            scrollDiv.style[$.feat.cssPrefix + 'BorderRadius'] = "2px";
            scrollDiv.style.borderRadius = "2px";
            scrollDiv.style.display="none";
            scrollDiv.className = 'scrollBar';
            scrollDiv.style.background = "black";
            return scrollDiv;
        }
        jsScroller.prototype.enable = function (firstExecution) {
            if (this.eventsActive) return;
            this.eventsActive = true;
            if (!firstExecution) this.adjustScroll();
            else
                this.scrollerMoveCSS({
                    x: 0,
                    y: 0
                }, 0);
            //add listeners
            this.container.addEventListener('touchstart', this, false);
            this.container.addEventListener('touchmove', this, false);
            this.container.addEventListener('touchend', this, false);

        };
        jsScroller.prototype.adjustScroll = function () {
            //set top/left
            var size = this.getViewportSize();
            this.scrollerMoveCSS({
                x: Math.round(this.loggedPcentX * (this.el.clientWidth - size.w)),
                y: Math.round(this.loggedPcentY * (this.el.clientHeight - size.h))
            }, 0);
        };
        jsScroller.prototype.disable = function () {
            if (!this.eventsActive) return;
            //log top/left
            var cssMatrix = this.getCSSMatrix(this.el);
            this.logPos((numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft)), (numOnly(cssMatrix.f) - numOnly(this.container.scrollTop)));
            //remove event listeners
            this.container.removeEventListener('touchstart', this, false);
            this.container.removeEventListener('touchmove', this, false);
            this.container.removeEventListener('touchend', this, false);
            this.eventsActive = false;
        };
        jsScroller.prototype.addPullToRefresh = function (el, leaveRefresh) {
            if (!leaveRefresh) this.refresh = true;
            if (this.refresh && this.refresh === true) {
                this.coreAddPullToRefresh(el);
                this.el.style.overflow = 'visible';
            }
        };
        jsScroller.prototype.hideScrollbars = function () {
            if (this.hscrollBar) {
                this.hscrollBar.style.display="none";
                this.hscrollBar.style[$.feat.cssPrefix + 'TransitionDuration'] = "0ms";
            }
            if (this.vscrollBar) {
                this.vscrollBar.style.display="none";
                this.vscrollBar.style[$.feat.cssPrefix + 'TransitionDuration'] = "0ms";
            }
        };

        jsScroller.prototype.getViewportSize = function () {
            var style = window.getComputedStyle(this.container);
            if (isNaN(numOnly(style.paddingTop))) alert((typeof style.paddingTop) + '::' + style.paddingTop + ':');
            return {
                h: (this.container.clientHeight > window.innerHeight ? window.innerHeight : this.container.clientHeight - numOnly(style.paddingTop) - numOnly(style.paddingBottom)),
                w: (this.container.clientWidth > window.innerWidth ? window.innerWidth : this.container.clientWidth - numOnly(style.paddingLeft) - numOnly(style.paddingRight))
            };
        };

        jsScroller.prototype.onTouchStart = function (event) {

            this.moved = false;
            this.currentScrollingObject = null;

            if (!this.container) return;
            if (this.refreshCancelCB) {
                clearTimeout(this.refreshCancelCB);
                this.refreshCancelCB = null;
            }
            if (this.scrollingFinishCB) {
                clearTimeout(this.scrollingFinishCB);
                this.scrollingFinishCB = null;
            }


            //disable if locked
            if (event.touches.length != 1 || this.boolScrollLock) return;

            // Allow interaction to legit calls, like select boxes, etc.
            if (event.touches[0].target && event.touches[0].target.type !== undefined) {
                var tagname = event.touches[0].target.tagName.toLowerCase();
                var tagtype=event.touches[0].target.type.toLowerCase();

                if (tagname == "select" ) // stuff we need to allow
                // access to legit calls
                    return;

            }

            //default variables
            var scrollInfo = {
                //current position
                top: 0,
                left: 0,
                //current movement
                speedY: 0,
                speedX: 0,
                absSpeedY: 0,
                absSpeedX: 0,
                deltaY: 0,
                deltaX: 0,
                absDeltaY: 0,
                absDeltaX: 0,
                y: 0,
                x: 0,
                duration: 0
            };

            //element info
            this.elementInfo = {};
            var size = this.getViewportSize();
            this.elementInfo.bottomMargin = size.h;
            this.elementInfo.maxTop = (this.el.clientHeight - this.elementInfo.bottomMargin);
            if (this.elementInfo.maxTop < 0) this.elementInfo.maxTop = 0;
            this.elementInfo.divHeight = this.el.clientHeight;
            this.elementInfo.rightMargin = size.w;
            this.elementInfo.maxLeft = (this.el.clientWidth - this.elementInfo.rightMargin);
            if (this.elementInfo.maxLeft < 0) this.elementInfo.maxLeft = 0;
            this.elementInfo.divWidth = this.el.clientWidth;
            this.elementInfo.hasVertScroll = this.verticalScroll || this.elementInfo.maxTop > 0;
            this.elementInfo.hasHorScroll = this.elementInfo.maxLeft > 0;
            this.elementInfo.requiresVScrollBar = this.vscrollBar && this.elementInfo.hasVertScroll;
            this.elementInfo.requiresHScrollBar = this.hscrollBar && this.elementInfo.hasHorScroll;

            //save event
            this.saveEventInfo(event);
            this.saveFirstEventInfo(event);

            //get the current top
            var cssMatrix = this.getCSSMatrix(this.el);
            scrollInfo.top = numOnly(cssMatrix.f) - numOnly(this.container.scrollTop);
            scrollInfo.left = numOnly(cssMatrix.e) - numOnly(this.container.scrollLeft);

            this.container.scrollTop = this.container.scrollLeft = 0;
            this.currentScrollingObject = this.el;

            //get refresh ready
            if (this.refresh && scrollInfo.top === 0) {
                this.refreshContainer.style.display = "block";
                this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
                this.refreshContainer.firstChild.style.top = (-this.refreshHeight) + 'px';
                this.refreshContainer.style.overflow = 'visible';
                this.preventPullToRefresh = false;
            } else if (scrollInfo.top < 0) {
                this.preventPullToRefresh = true;
                if (this.refresh) this.refreshContainer.style.overflow = 'hidden';
            }

            //set target
            scrollInfo.x = scrollInfo.left;
            scrollInfo.y = scrollInfo.top;

            //vertical scroll bar
            if (this.setVScrollBar(scrollInfo, 0, 0)) {
                if (this.container.clientWidth > window.innerWidth)
                    this.vscrollBar.style.right =  "0px";
                else
                    this.vscrollBar.style.right = "0px";
                this.vscrollBar.style[$.feat.cssPrefix + "Transition"] = '';
                // this.vscrollBar.style.opacity = 1;
            }

            //horizontal scroll
            if (this.setHScrollBar(scrollInfo, 0, 0)) {
                if (this.container.clientHeight > window.innerHeight)
                    this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height)) + "px";
                else
                    this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
                this.hscrollBar.style[$.feat.cssPrefix + "Transition"] = '';
                // this.hscrollBar.style.opacity = 1;
            }

            //save scrollInfo
            this.lastScrollInfo = scrollInfo;
            this.hasMoved = false;

            this.scrollerMoveCSS(this.lastScrollInfo, 0);
      

        };
        jsScroller.prototype.getCSSMatrix = function (el) {
            if (this.androidFormsMode) {
                //absolute mode
                var top = parseInt(el.style.marginTop,10);
                var left = parseInt(el.style.marginLeft,10);
                if (isNaN(top)) top = 0;
                if (isNaN(left)) left = 0;
                return {
                    f: top,
                    e: left
                };
            } else {
                //regular transform

                var obj = $.getCssMatrix(el);
                return obj;
            }
        };
        jsScroller.prototype.saveEventInfo = function (event) {
            this.lastEventInfo = {
                pageX: event.touches[0].pageX,
                pageY: event.touches[0].pageY,
                time: event.timeStamp
            };
        };
        jsScroller.prototype.saveFirstEventInfo = function (event) {
            this.firstEventInfo = {
                pageX: event.touches[0].pageX,
                pageY: event.touches[0].pageY,
                time: event.timeStamp
            };
        };
        jsScroller.prototype.setVScrollBar = function (scrollInfo, time, timingFunction) {

            if (!this.elementInfo.requiresVScrollBar) return false;
            var newHeight = (parseFloat(this.elementInfo.bottomMargin / this.elementInfo.divHeight) * this.elementInfo.bottomMargin) + "px";
            if(numOnly(newHeight)>this.elementInfo.bottomMargin)
                newHeight=this.elementInfo.bottomMargin+"px";
            if (newHeight != this.vscrollBar.style.height) this.vscrollBar.style.height = newHeight;

            var pos = (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)) - (((this.elementInfo.maxTop + scrollInfo.y) / this.elementInfo.maxTop) * (this.elementInfo.bottomMargin - numOnly(this.vscrollBar.style.height)));
            if (pos > this.elementInfo.bottomMargin) pos = this.elementInfo.bottomMargin;

            if (pos < 0) pos = 0;
            this.scrollbarMoveCSS(this.vscrollBar, {
                x: 0,
                y: pos
            }, time, timingFunction);
            return true;
        };
        jsScroller.prototype.setHScrollBar = function (scrollInfo, time, timingFunction) {
            if (!this.elementInfo.requiresHScrollBar) return false;
            var newWidth = (parseFloat(this.elementInfo.rightMargin / this.elementInfo.divWidth) * this.elementInfo.rightMargin) + "px";
            if (newWidth != this.hscrollBar.style.width) this.hscrollBar.style.width = newWidth;
            var pos = (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)) - (((this.elementInfo.maxLeft + scrollInfo.x) / this.elementInfo.maxLeft) * (this.elementInfo.rightMargin - numOnly(this.hscrollBar.style.width)));

            if (pos > this.elementInfo.rightMargin) pos = this.elementInfo.rightMargin;
            if (pos < 0) pos = 0;

            this.scrollbarMoveCSS(this.hscrollBar, {
                x: pos,
                y: 0
            }, time, timingFunction);
            return true;
        };

        jsScroller.prototype.onTouchMove = function (event) {


            if (this.currentScrollingObject === null) return;
            //event.preventDefault();
            var scrollInfo = this.calculateMovement(event);
            this.calculateTarget(scrollInfo);

            this.lastScrollInfo = scrollInfo;
            if (!this.moved) {
                $.trigger(this, "scrollstart");
                $.trigger($.touchLayer, "scrollstart", [this.el]);
                if (this.elementInfo.requiresVScrollBar) this.vscrollBar.style.display="block";
                if (this.elementInfo.requiresHScrollBar) this.hscrollBar.style.display="block";
            }
            this.moved = true;


            if (this.refresh && scrollInfo.top === 0) {
                this.refreshContainer.style.display = "block";
                this.refreshHeight = this.refreshContainer.firstChild.clientHeight;
                this.refreshContainer.firstChild.style.top = (-this.refreshHeight) + 'px';
                this.refreshContainer.style.overflow = 'visible';
                this.preventPullToRefresh = false;
            } else if (scrollInfo.top < 0) {
                this.preventPullToRefresh = true;
                if (this.refresh) this.refreshContainer.style.overflow = 'hidden';
            }


            this.saveEventInfo(event);
            if (this.isScrolling===false){ // && (this.lastScrollInfo.x != this.lastScrollInfo.left || this.lastScrollInfo.y != this.lastScrollInfo.top)) {
                this.isScrolling = true;
                if (this.onScrollStart) this.onScrollStart();
            }
            //proceed normally
            var cssMatrix = this.getCSSMatrix(this.el);
            this.lastScrollInfo.top = numOnly(cssMatrix.f);
            this.lastScrollInfo.left = numOnly(cssMatrix.e);

            this.recalculateDeltaY(this.lastScrollInfo);
            this.recalculateDeltaX(this.lastScrollInfo);

            //boundaries control
            this.checkYboundary(this.lastScrollInfo);
            if (this.elementInfo.hasHorScroll) this.checkXboundary(this.lastScrollInfo);


            //pull to refresh elastic

            var positiveOverflow = this.lastScrollInfo.y > 0 && this.lastScrollInfo.deltaY > 0;
            var negativeOverflow = this.lastScrollInfo.y < -this.elementInfo.maxTop && this.lastScrollInfo.deltaY < 0;
            if (positiveOverflow || negativeOverflow) {
                var overflow = positiveOverflow ? this.lastScrollInfo.y : -this.lastScrollInfo.y - this.elementInfo.maxTop;
                var pcent = (this.container.clientHeight - overflow) / this.container.clientHeight;
                if (pcent < 0.5) pcent = 0.5;
                //cur top, maxTop or 0?
                var baseTop = 0;
                if ((positiveOverflow && this.lastScrollInfo.top > 0) || (negativeOverflow && this.lastScrollInfo.top < -this.elementInfo.maxTop)) {
                    baseTop = this.lastScrollInfo.top;
                } else if (negativeOverflow) {
                    baseTop = -this.elementInfo.maxTop;
                }
                var changeY = this.lastScrollInfo.deltaY * pcent;
                var absChangeY = Math.abs(this.lastScrollInfo.deltaY * pcent);
                if (absChangeY < 1) changeY = positiveOverflow ? 1 : -1;
                this.lastScrollInfo.y = baseTop + changeY;
            }

            if(this.elementInfo.hasHorScroll){
                positiveOverflow = this.lastScrollInfo.x > 0 && this.lastScrollInfo.deltaX > 0;
                negativeOverflow = this.lastScrollInfo.x < -this.elementInfo.maxLeft && this.lastScrollInfo.deltaX < 0;
                if (positiveOverflow || negativeOverflow) {
                    var overflow = positiveOverflow ? this.lastScrollInfo.x : -this.lastScrollInfo.x - this.elementInfo.maxLeft;
                    var pcent = (this.container.clientWidth - overflow) / this.container.clientWidth;
                    if (pcent < 0.5) pcent = 0.5;
                //cur top, maxTop or 0?
                    var baseTop = 0;
                    if ((positiveOverflow && this.lastScrollInfo.left > 0) || (negativeOverflow && this.lastScrollInfo.left < -this.elementInfo.maxLeft)) {
                        baseTop = this.lastScrollInfo.left;
                    } else if (negativeOverflow) {
                        baseTop = -this.elementInfo.maxLeft;
                    }
                    var changeX = this.lastScrollInfo.deltaX * pcent;
                    var absChangeX = Math.abs(this.lastScrollInfo.deltaX * pcent);
                    if (absChangeX < 1) changeX = positiveOverflow ? 1 : -1;
                    this.lastScrollInfo.x = baseTop + changeX;
                }
            }
            if(this.lockBounce){
                if(this.lastScrollInfo.x>0)
                    this.lastScrollInfo.x=0;
                else if(this.lastScrollInfo.x*-1>this.elementInfo.maxLeft)
                    this.lastScrollInfo.x=this.elementInfo.maxLeft*-1;
                if(this.lastScrollInfo.y>0)
                    this.lastScrollInfo.y=0;
                else if(this.lastScrollInfo.y*-1>this.elementInfo.maxTop)
                    this.lastScrollInfo.y=this.elementInfo.maxTop*-1;
            }

            //move

            this.scrollerMoveCSS(this.lastScrollInfo, 0);
            this.setVScrollBar(this.lastScrollInfo, 0, 0);
            this.setHScrollBar(this.lastScrollInfo, 0, 0);

            //check refresh triggering
            if (this.refresh && !this.preventPullToRefresh) {
                if (!this.refreshTriggered && this.lastScrollInfo.top > this.refreshHeight) {
                    this.refreshTriggered = true;
                    $.trigger(this, 'refresh-trigger');
                } else if (this.refreshTriggered && this.lastScrollInfo.top < this.refreshHeight) {
                    this.refreshTriggered = false;
                    $.trigger(this, 'refresh-cancel');
                }
            }

            if (this.infinite && !this.infiniteTriggered) {
                if ((Math.abs(this.lastScrollInfo.top) >= (this.el.clientHeight - this.container.clientHeight))) {
                    this.infiniteTriggered = true;
                    $.trigger(this, "infinite-scroll");
                }
            }

        };

       

        jsScroller.prototype.calculateMovement = function (event, last) {
            //default variables
            var scrollInfo = {
                //current position
                top: 0,
                left: 0,
                //current movement
                speedY: 0,
                speedX: 0,
                absSpeedY: 0,
                absSpeedX: 0,
                deltaY: 0,
                deltaX: 0,
                absDeltaY: 0,
                absDeltaX: 0,
                y: 0,
                x: 0,
                duration: 0
            };

            var prevEventInfo = last ? this.firstEventInfo : this.lastEventInfo;
            var pageX = last ? event.pageX : event.touches[0].pageX;
            var pageY = last ? event.pageY : event.touches[0].pageY;
            var time = last ? event.time : event.timeStamp;

            scrollInfo.deltaY = this.elementInfo.hasVertScroll ? pageY - prevEventInfo.pageY : 0;
            scrollInfo.deltaX = this.elementInfo.hasHorScroll ? pageX - prevEventInfo.pageX : 0;
            scrollInfo.time = time;


            scrollInfo.duration = time - prevEventInfo.time;
            return scrollInfo;
        };

        jsScroller.prototype.calculateTarget = function (scrollInfo) {
            scrollInfo.y = this.lastScrollInfo.y + scrollInfo.deltaY;
            scrollInfo.x = this.lastScrollInfo.x + scrollInfo.deltaX;
        };
        jsScroller.prototype.checkYboundary = function (scrollInfo) {
            var minTop = this.container.clientHeight / 2;
            var maxTop = this.elementInfo.maxTop + minTop;
            //y boundaries
            if (scrollInfo.y > minTop) scrollInfo.y = minTop;
            else if (-scrollInfo.y > maxTop) scrollInfo.y = -maxTop;
            else return;
            this.recalculateDeltaY(scrollInfo);
        };
        jsScroller.prototype.checkXboundary = function (scrollInfo) {
            //x boundaries

            var minLeft=this.container.clientWidth/2;
            var maxLeft=this.elementInfo.maxLeft+minLeft;
            
            if (scrollInfo.x > minLeft) scrollInfo.x = minLeft;
            else if (-scrollInfo.x > maxLeft) scrollInfo.x = -maxLeft;
            else return;

            this.recalculateDeltaX(scrollInfo);
        };
        jsScroller.prototype.recalculateDeltaY = function (scrollInfo) {
            //recalculate delta
            var oldAbsDeltaY = Math.abs(scrollInfo.deltaY);
            scrollInfo.deltaY = scrollInfo.y - scrollInfo.top;
            newAbsDeltaY = Math.abs(scrollInfo.deltaY);
            //recalculate duration at same speed
            scrollInfo.duration = scrollInfo.duration * newAbsDeltaY / oldAbsDeltaY;

        };
        jsScroller.prototype.recalculateDeltaX = function (scrollInfo) {
            //recalculate delta
            var oldAbsDeltaX = Math.abs(scrollInfo.deltaX);
            scrollInfo.deltaX = scrollInfo.x - scrollInfo.left;
            newAbsDeltaX = Math.abs(scrollInfo.deltaX);
            //recalculate duration at same speed
            scrollInfo.duration = scrollInfo.duration * newAbsDeltaX / oldAbsDeltaX;

        };

        jsScroller.prototype.hideRefresh = function (animate) {
            var that = this;
            if (this.preventHideRefresh) return;
            this.scrollerMoveCSS({
                x: 0,
                y: 0,
                complete: function () {
                    $.trigger(that, "refresh-finish");
                }
            }, HIDE_REFRESH_TIME);
            this.refreshTriggered = false;
        };

        jsScroller.prototype.setMomentum = function (scrollInfo) {
            var deceleration = 0.0012;

            //calculate movement speed
            scrollInfo.speedY = this.divide(scrollInfo.deltaY, scrollInfo.duration);
            scrollInfo.speedX = this.divide(scrollInfo.deltaX, scrollInfo.duration);

            scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
            scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);

            scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
            scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);


            //set momentum
            if (scrollInfo.absDeltaY > 0) {
                scrollInfo.deltaY = (scrollInfo.deltaY < 0 ? -1 : 1) * (scrollInfo.absSpeedY * scrollInfo.absSpeedY) / (2 * deceleration);
                scrollInfo.absDeltaY = Math.abs(scrollInfo.deltaY);
                scrollInfo.duration = scrollInfo.absSpeedY / deceleration;
                scrollInfo.speedY = scrollInfo.deltaY / scrollInfo.duration;
                scrollInfo.absSpeedY = Math.abs(scrollInfo.speedY);
                if (scrollInfo.absSpeedY < deceleration * 100 || scrollInfo.absDeltaY < 5) scrollInfo.deltaY = scrollInfo.absDeltaY = scrollInfo.duration = scrollInfo.speedY = scrollInfo.absSpeedY = 0;
            } else if (scrollInfo.absDeltaX) {
                scrollInfo.deltaX = (scrollInfo.deltaX < 0 ? -1 : 1) * (scrollInfo.absSpeedX * scrollInfo.absSpeedX) / (2 * deceleration);
                scrollInfo.absDeltaX = Math.abs(scrollInfo.deltaX);
                scrollInfo.duration = scrollInfo.absSpeedX / deceleration;
                scrollInfo.speedX = scrollInfo.deltaX / scrollInfo.duration;
                scrollInfo.absSpeedX = Math.abs(scrollInfo.speedX);
                if (scrollInfo.absSpeedX < deceleration * 100 || scrollInfo.absDeltaX < 5) scrollInfo.deltaX = scrollInfo.absDeltaX = scrollInfo.duration = scrollInfo.speedX = scrollInfo.absSpeedX = 0;
            } else scrollInfo.duration = 0;
        };


        jsScroller.prototype.onTouchEnd = function (event) {


            if (this.currentScrollingObject === null || !this.moved) return;
            //event.preventDefault();
            this.finishScrollingObject = this.currentScrollingObject;
            this.currentScrollingObject = null;

            var scrollInfo = this.calculateMovement(this.lastEventInfo, true);

            if (!this.androidFormsMode) {
                this.setMomentum(scrollInfo);
            }
            this.calculateTarget(scrollInfo);

            //get the current top
            var cssMatrix = this.getCSSMatrix(this.el);
            scrollInfo.top = numOnly(cssMatrix.f);
            scrollInfo.left = numOnly(cssMatrix.e);

            //boundaries control
            this.checkYboundary(scrollInfo);

            if (this.elementInfo.hasHorScroll) this.checkXboundary(scrollInfo);


            var triggered = !this.preventPullToRefresh && (scrollInfo.top > this.refreshHeight || scrollInfo.y > this.refreshHeight);
            this.fireRefreshRelease(triggered, scrollInfo.top > 0);

            //refresh hang in
            if (this.refresh && triggered) {
                scrollInfo.y = this.refreshHeight;
                scrollInfo.duration = HIDE_REFRESH_TIME;
                //top boundary
            } else if (scrollInfo.y >= 0) {
                scrollInfo.y = 0;
                if (scrollInfo.top >= 0) scrollInfo.duration = HIDE_REFRESH_TIME;
                //lower boundary
            } else if (-scrollInfo.y > this.elementInfo.maxTop || this.elementInfo.maxTop === 0) {
                scrollInfo.y = -this.elementInfo.maxTop;
                if (-scrollInfo.top > this.elementInfo.maxTop) scrollInfo.duration = HIDE_REFRESH_TIME;
                //all others
            }
            ;
            if(this.elementInfo.hasHorScroll){
                if(scrollInfo.x>=0)
                {
                    scrollInfo.x=0;
                    if(scrollInfo.left>=0) scrollInfo.duration=HIDE_REFRESH_TIME;
                }
                else if(-scrollInfo.x>this.elementInfo.maxLeft||this.elementInfo.maxLeft===0){
                    scrollInfo.x=-this.elementInfo.maxLeft;
                    if(-scrollInfo.left>this.elementInfo.maxLeft) scrollInfo.duration=HIDE_REFRESH_TIME;
                }
            }

            if (this.androidFormsMode) scrollInfo.duration = 0;

            this.scrollerMoveCSS(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setVScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setHScrollBar(scrollInfo, scrollInfo.duration, "cubic-bezier(0.33,0.66,0.66,1)");
            this.setFinishCalback(scrollInfo.duration);
            if (this.infinite && !this.infiniteTriggered) {
                if ((Math.abs(scrollInfo.y) >= (this.el.clientHeight - this.container.clientHeight))) {
                    this.infiniteTriggered = true;
                    $.trigger(this, "infinite-scroll");
                }
            }
        };

        //finish callback
        jsScroller.prototype.setFinishCalback = function (duration) {
            var that = this;
            this.scrollingFinishCB = setTimeout(function () {
                that.hideScrollbars();
                $.trigger($.touchLayer, 'scrollend', [that.el]); //notify touchLayer of this elements scrollend
                $.trigger(that, "scrollend", [that.el]);
                that.isScrolling = false;
                that.elementInfo = null; //reset elementInfo when idle
                if (that.infinite) $.trigger(that, "infinite-scroll-end");
            }, duration);
        };

        //Android Forms Fix
        jsScroller.prototype.startFormsMode = function () {
            if (this.blockFormsFix) return;
            //get prev values
            var cssMatrix = this.getCSSMatrix(this.el);
            //toggle vars
            this.refreshSafeKeep = this.refresh;
            this.refresh = false;
            this.androidFormsMode = true;
            //set new css rules
            this.el.style[$.feat.cssPrefix + "Transform"] = "none";
            this.el.style[$.feat.cssPrefix + "Transition"] = "none";
            this.el.style[$.feat.cssPrefix + "Perspective"] = "none";

            //set position
            this.scrollerMoveCSS({
                x: numOnly(cssMatrix.e),
                y: numOnly(cssMatrix.f)
            }, 0);

            //container
            this.container.style[$.feat.cssPrefix + "Perspective"] = "none";
            this.container.style[$.feat.cssPrefix + "BackfaceVisibility"] = "visible";
            //scrollbars
            if (this.vscrollBar) {
                this.vscrollBar.style[$.feat.cssPrefix + "Transform"] = "none";
                this.vscrollBar.style[$.feat.cssPrefix + "Transition"] = "none";
                this.vscrollBar.style[$.feat.cssPrefix + "Perspective"] = "none";
                this.vscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "visible";
            }
            if (this.hscrollBar) {
                this.hscrollBar.style[$.feat.cssPrefix + "Transform"] = "none";
                this.hscrollBar.style[$.feat.cssPrefix + "Transition"] = "none";
                this.hscrollBar.style[$.feat.cssPrefix + "Perspective"] = "none";
                this.hscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "visible";
            }

        };
        jsScroller.prototype.stopFormsMode = function () {
            if (this.blockFormsFix) return;
            //get prev values
            var cssMatrix = this.getCSSMatrix(this.el);
            //toggle vars
            this.refresh = this.refreshSafeKeep;
            this.androidFormsMode = false;
            //set new css rules
            this.el.style[$.feat.cssPrefix + "Perspective"] = 1000;
            this.el.style.marginTop = 0;
            this.el.style.marginLeft = 0;
            this.el.style[$.feat.cssPrefix + "Transition"] = '0ms linear'; //reactivate transitions
            //set position
            this.scrollerMoveCSS({
                x: numOnly(cssMatrix.e),
                y: numOnly(cssMatrix.f)
            }, 0);
            //container
            this.container.style[$.feat.cssPrefix + "Perspective"] = 1000;
            this.container.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
            //scrollbars
            if (this.vscrollBar) {
                this.vscrollBar.style[$.feat.cssPrefix + "Perspective"] = 1000;
                this.vscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
            }
            if (this.hscrollBar) {
                this.hscrollBar.style[$.feat.cssPrefix + "Perspective"] = 1000;
                this.hscrollBar.style[$.feat.cssPrefix + "BackfaceVisibility"] = "hidden";
            }

        };



        jsScroller.prototype.scrollerMoveCSS = function (distanceToMove, time, timingFunction) {
            if (!time) time = 0;
            if (!timingFunction) timingFunction = "linear";
            time = numOnly(time);
            if (this.el && this.el.style) {

                //do not touch the DOM if disabled
                if (this.eventsActive) {
                    if (this.androidFormsMode) {
                        this.el.style.marginTop = Math.round(distanceToMove.y) + "px";
                        this.el.style.marginLeft = Math.round(distanceToMove.x) + "px";
                    } else {

                        this.el.style[$.feat.cssPrefix + "Transform"] = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
                        this.el.style[$.feat.cssPrefix + "TransitionDuration"] = time + "ms";
                        this.el.style[$.feat.cssPrefix + "TransitionTimingFunction"] = timingFunction;
                    }
                }
                // Position should be updated even when the scroller is disabled so we log the change
                this.logPos(distanceToMove.x, distanceToMove.y);
            }
        };
        jsScroller.prototype.logPos = function (x, y) {

            var size;
            if (!this.elementInfo) {
                size = this.getViewportSize();
            } else {
                size = {
                    h: this.elementInfo.bottomMargin,
                    w: this.elementInfo.rightMargin
                };
            }

            this.loggedPcentX = this.divide(x, (this.el.clientWidth - size.w));
            this.loggedPcentY = this.divide(y, (this.el.clientHeight - size.h));
            this.scrollTop = y;
            this.scrollLeft = x;
        };
        jsScroller.prototype.scrollbarMoveCSS = function (el, distanceToMove, time, timingFunction) {
            if (!time) time = 0;
            if (!timingFunction) timingFunction = "linear";

            if (el && el.style) {
                if (this.androidFormsMode) {
                    el.style.marginTop = Math.round(distanceToMove.y) + "px";
                    el.style.marginLeft = Math.round(distanceToMove.x) + "px";
                } else {
                    el.style[$.feat.cssPrefix + "Transform"] = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
                    el.style[$.feat.cssPrefix + "TransitionDuration"] = time + "ms";
                    el.style[$.feat.cssPrefix + "TransitionTimingFunction"] = timingFunction;
                }
            }
        };
        jsScroller.prototype.scrollTo = function (pos, time) {
            if (!time) time = 0;
            this.scrollerMoveCSS(pos, time);
        };
        jsScroller.prototype.scrollBy = function (pos, time) {
            var cssMatrix = this.getCSSMatrix(this.el);
            var startTop = numOnly(cssMatrix.f);
            var startLeft = numOnly(cssMatrix.e);
            this.scrollTo({
                y: startTop - pos.y,
                x: startLeft - pos.x
            }, time);
        };
        jsScroller.prototype.scrollToBottom = function (time) {
            this.scrollTo({
                y: -1 * (this.el.clientHeight - this.container.clientHeight),
                x: 0
            }, time);
        };
        jsScroller.prototype.scrollToTop = function (time) {
            this.scrollTo({
                x: 0,
                y: 0
            }, time);
        };
        return scroller;
    })();
})(af);