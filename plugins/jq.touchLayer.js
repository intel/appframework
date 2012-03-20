//TouchLayer contributed by Carlos Ouro @ Badoo
//handles overlooking js scrolling and native scrolling, panning on titlebar and no delay on click
//It can be used independently in other apps but it is required by jqUi
(function() {
    $.touchLayer = function(el) {
        return new touchLayer(el);
    };
    
	//TouchLayer contributed by Carlos Ouro @ Badoo
	//handles overlooking panning on titlebar, bumps on native scrolling and no delay on click
	var touchLayer = function(el) {
        el.addEventListener('touchstart', this, false);
		var firstScroll = true;
		var that = this;
		document.addEventListener('scroll', function(e){
			if(e.target.isSameNode(document)) {
				if(!that.isPanning){
					if(!firstScroll){
						firstScroll = true;
						that.hideAddressBar();
					} else firstScroll=false;
				}
			}
		}, true);
		this.layer=el;
    }
    var prevClickField;
	
    touchLayer.prototype = {
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
		layer: null,
		panElementId: "pageTitle",
		scrollingEl: null,
		isScrolling: false,
		beenScrolling: false,
		currentMomentum: 0,
		startTime:0,
		previousStartedAtTop: false,
		previousStartedAtBottom:false,
		isScrollingVertical: false,
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
                case 'scroll':
                    this.onScroll(e);
                    break;
				
            }
        },
		hideAddressBar:function() {
	        if (jq.os.android) {
	            window.scrollTo(1, 1);
	            if (document.documentElement.scrollHeight < window.outerHeight / window.devicePixelRatio)
	                this.layer.style.height = (window.outerHeight / window.devicePixelRatio) + 'px';
	        } 
	        else {
	            document.documentElement.style.height = "5000px";
            
	            window.scrollTo(0, 1);
	            document.documentElement.style.height = window.innerHeight + "px";
	            this.layer.style.height = window.innerHeight + "px";
	        }
	    },
		
		
        onTouchStart: function(e) {
			
            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
            if (fixInputHandlers(e))
                return;
            if (prevClickField !== null && prevClickField !== undefined && jq.os.android) {
                prevClickField.blur(); //We need to blur any input fields on android
                prevClickField = null;
            }
			
            this.moved = false;
			this.isPanning = false;
			this.isScrolling = false;
			this.isScrollingVertical = false;
			this.checkDOMTree(e.target, this.layer);
			if(!this.isScrolling && !this.isPanning) {
				e.preventDefault();
			} else if(this.isScrollingVertical && !this.beenScrolling){
				this.demandVerticalScroll();
			}
			//force no touchmove on pan
			if(this.isPanning) document.removeEventListener('touchmove', this, false);
			else document.addEventListener('touchmove', this, false);
			
			document.addEventListener('touchend', this, false);
        },
		demandVerticalScroll:function(){
			//if at top or bottom adjust scroll
			var atTop = this.scrollingEl.scrollTop<=0;
			if(atTop){
				this.scrollingEl.scrollTop=1;
			} else {
				var scrollHeight = this.scrollingEl.scrollTop+this.scrollingEl.clientHeight;
				var atBottom = scrollHeight>=this.scrollingEl.scrollHeight;
				if(atBottom) {
					this.scrollingEl.scrollTop=this.scrollingEl.scrollHeight-this.scrollingEl.clientHeight-1;
				}
			}
		},
		onScroll:function(e){
			if(this.scrollingEl.scrollTop==0) e.preventDefault();
			//console.log("scroll "+(this.scrollingEl?this.scrollingEl.scrollTop:"null"));
			this.beenScrolling = false;
			this.previousStartedAtTop = false;
			this.previousStartedAtBottom = false;
		},
		//set rules here to ignore scrolling check on these elements
		ignoreScrolling:function(el){
			if(el['scrollWidth']===undefined || el['clientWidth']===undefined) return true;
			if(el['scrollHeight']===undefined || el['clientHeight']===undefined) return true;
			return false;
		},
		
		allowsVerticalScroll:function(el, styles){
			var overflowY = styles.overflowY;
			if(overflowY == 'scroll') return true;
			if(overflowY == 'auto' && el['scrollHeight'] > el['clientHeight'])
				return true;
			return false;
		},
		allowsHorizontalScroll:function(el, styles){
			var overflowX = styles.overflowY;
			if(overflowX == 'scroll') return true;
			if(overflowX == 'auto' && el['scrollWidth'] > el['clientWidth'])
				return true;
			return false;
		},
		
		
		//check if pan or native scroll is possible
		checkDOMTree : function(el, parentTarget){
			
			//check panning
			if(this.panElementId==el.id){
				this.isPanning = true;
				return;
			}
			//check native scroll
			if($.os.supportsNativeScroll){
				
				//prevent errors
				if(this.ignoreScrolling(el)) {
					return;
				}
			
				//check 
				var styles = window.getComputedStyle(el);
				if (this.allowsVerticalScroll(el, styles)){
					this.isScrollingVertical=true;
					this.scrollingEl = el;
					this.isScrolling = true;
					return;
				} else if(this.allowsHorizontalScroll(el, styles)){
					this.isScrollingVertical=false;
					this.scrollingEl = null;
					this.isScrolling = true;
				}
				
			}
			//check recursive up to top element
			var isTarget = el.isSameNode(parentTarget);
			if(!isTarget && el.parentNode) this.checkDOMTree(el.parentNode, parentTarget);
		},
		
        
        onTouchMove: function(e) {
			
			this.cY = e.touches[0].pageY - this.dY;
			this.cX = e.touches[0].pageX - this.dX;

			//console.log("touchmove "+(this.cY>0?"up":"down")+"!");
			if(!this.isScrolling){
				//legacy stuff for old browsers
	            e.preventDefault();
				this.moved = true;
				return;
				
			//otherwise it is a native scroll
			} else if(this.isScrollingVertical && this.isGoingToBump()){
				e.preventDefault();
			}
			
			//let's clear events for performance
            document.removeEventListener('touchmove', this, false);
			document.removeEventListener('touchend', this, false);
        },
		
		isGoingToBump:function(){
			
			//console.log("isScrollingVertical! "+this.scrollingEl.scrollTop);
			//if at top or bottom allow scroll
			var atTop = this.scrollingEl.scrollTop<=0;
			if(atTop){
				//console.log("through the top!");
				if(this.beenScrolling && !this.previousStartedAtTop) {
					this.previousStartedAtTop = false;
					this.beenScrolling = false;
					return true;
				} else {
					this.beenScrolling = true;
					this.previousStartedAtTop = true;
				}
			} else {
				var scrollHeight = this.scrollingEl.scrollTop+this.scrollingEl.clientHeight;
				var atBottom = scrollHeight>=this.scrollingEl.scrollHeight;
				if(atBottom) {
					if(this.beenScrolling && !this.previousStartedAtBottom) {
						this.previousStartedAtBottom = false;
						this.beenScrolling = false;
						return true;
					} else {
						this.beenScrolling = true;
						this.previousStartedAtBottom = true;
					}
				} else this.beenScrolling = true;
				this.scrollingEl.addEventListener('scroll', this, false);
			}
			return false;
		},
		
        
        onTouchEnd: function(e) {
			
			if(this.isPanning){
				//wait 2 secs and cancel
				var that = this;
				setTimeout(function(){
					if(that.isPanning) {
						that.hideAddressBar();
						that.isPanning = false;
					}
				}, 2000);
			}
			
			e.preventDefault();
			var itMoved = $.os.blackberry ? (Math.abs(this.cX) < 5 || Math.abs(this.cY) < 5) : this.moved;
            if (!itMoved) {
                var theTarget = e.target;
                if (theTarget.nodeType == 3)
                    theTarget = theTarget.parentNode;
            
                
                if (checkAnchorClick(theTarget,this.isScrolling))
                {
                    return false;
                }
               
				if(!this.isScrolling){
                	var theEvent = document.createEvent('MouseEvents');
                	theEvent.initEvent('click', true, true);
                	theTarget.dispatchEvent(theEvent);
				}
                if (theTarget && theTarget.type != undefined) {
                    var tagname = theTarget.tagName.toLowerCase();
                    if (tagname == "select" || (theTarget.type=="text"&&tagname == "input") ||  tagname == "textarea") {
                        theTarget.focus();
                    }
                }
            }
            prevClickField = null;
            this.dX = this.cX = this.cY = this.dY = 0;
            document.removeEventListener('touchmove', this, false);
            document.removeEventListener('touchend', this, false);
			
        }
        
    };
	
    
    function fixInputHandlers(e) {
        if (!jq.os.android)
            return;
        var theTarget = e.touches[0].target;
        if (theTarget && theTarget.type != undefined) {
            var tagname = theTarget.tagName.toLowerCase();
            var type=theTarget.type;
             if (tagname == "select" || tagname == "input" || tagname == "textarea")  { // stuff we need to allow
                //On Android 2.2+, the keyboard is broken when we apply -webkit-transform.  The hit box is moved and it no longer loses focus when you click out.
                //What the following does is moves the div up so the text is not covered by the keyboard.
                if (jq.os.android && (theTarget.type.toLowerCase() == "text" || theTarget.type.toLowerCase() == "textarea")) {
                    var prevClickField = theTarget;
                    var headerHeight = 0, 
                    containerHeight = 0;
                    if (jq(theTarget).closest("#content").length > 0) {
                        headerHeight = parseInt(jq("#header").css("height"));
                        containerHeight = parseInt(jq("#content").css("height")) / 2;
                        var theHeight = e.touches[0].clientY - headerHeight / 2;
                        if (theHeight > containerHeight && containerHeight > 0) {
                            var el = jq(theTarget).closest(".panel").get();
                            window.setTimeout(function() {
                                $.ui.scrollingDivs[el.id].scrollBy({x: 0,y: theHeight - containerHeight}, 0);
                            }, 1000);
                        }
                    } else if (jq(theTarget).closest("#jQui_modal").length > 0) {
                        
	                    headerHeight = 0;
	                    containerHeight = parseInt(jq("#modalContainer").css("height")) / 2;
	                    var theHeight = e.touches[0].clientY - headerHeight / 2;
                        
					    if (theHeight > containerHeight && containerHeight > 0) {
	                		window.setTimeout(function() {
	                			$.ui.scrollingDivs['modal'].scrollBy({x: 0,y: theHeight - containerHeight}, 0);
	                		}, 1000);
					    }
                    }
                }
                
                return true;
            }
        }
        return false;
    }
    
    function checkAnchorClick(theTarget,nativeScrolling) {
        var parent = false;
        if (theTarget.tagName.toLowerCase() != "a" && theTarget.parentNode)
            parent = true, theTarget = theTarget.parentNode; //let's try the parent so <a href="#foo"><img src="whatever.jpg"></a> will work
        if (theTarget.tagName.toLowerCase() == "a") {
            if (theTarget.href.toLowerCase().indexOf("javascript:") !== -1||theTarget.getAttribute("data-ignore")) {
                return false;
            }

            if (theTarget.onclick && !jq.os.desktop && !nativeScrolling){
                theTarget.onclick();
                //$(theTarget).trigger("click");
            }
            
            
            if (theTarget.hash.indexOf("#") === -1 && theTarget.target.length > 0) 
            {
                if (theTarget.href.toLowerCase().indexOf("javascript:") != 0) {
                    if (jq.ui.isAppMobi)
                        AppMobi.device.launchExternal(theTarget.href);
                    else if (!jq.os.desktop)
                        brokerClickEventMobile(theTarget);
                    else
                        window.open(theTarget);
                    return true;
                }
                return false;
            }
            if ((theTarget.href.indexOf("#") !== -1 && theTarget.hash.length == 0)||theTarget.href.length==0)
                return true;
            
            
            
            var mytransition = theTarget.getAttribute("data-transition");
            var resetHistory = theTarget.getAttribute("data-resetHistory");
            resetHistory = resetHistory && resetHistory.toLowerCase() == "true" ? true : false;
            var href = theTarget.hash.length > 0 ? theTarget.hash : theTarget.href;
            
            jq.ui.loadContent(href, theTarget.resetHistory, 0, mytransition, theTarget);
            return true;
        }
    }
    function brokerClickEventMobile(theTarget) {
        if (jq.os.desktop)
            return;
        var clickevent = document.createEvent('Event');
        clickevent.initEvent('click', true, false);
        theTarget.target = "_blank";
        theTarget.dispatchEvent(clickevent);
    }
})();




//Touch events are from zepto/touch.js
(function($) {
    var touch = {}, touchTimeout;
    
    function parentIfText(node) {
        return 'tagName' in node ? node : node.parentNode;
    }
    
    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
        if (xDelta >= yDelta) {
            return (x1 - x2 > 0 ? 'Left' : 'Right');
        } else {
            return (y1 - y2 > 0 ? 'Up' : 'Down');
        }
    }
    
    var longTapDelay = 750;
    function longTap() {
        if (touch.last && (Date.now() - touch.last >= longTapDelay)) {
            touch.el.trigger('longTap');
            touch = {};
        }
    }
    $(document).ready(function() {
        $(document.body).bind('touchstart', function(e) {
            var now = Date.now(), delta = now - (touch.last || now);
            touch.el = $(parentIfText(e.touches[0].target));
            touchTimeout && clearTimeout(touchTimeout);
            touch.x1 = e.touches[0].pageX;
            touch.y1 = e.touches[0].pageY;
            if (delta > 0 && delta <= 250)
                touch.isDoubleTap = true;
            touch.last = now;
            setTimeout(longTap, longTapDelay);
            if (!touch.el.data("ignore-pressed"))
                touch.el.addClass("selected");
        }).bind('touchmove', function(e) {
            touch.x2 = e.touches[0].pageX;
            touch.y2 = e.touches[0].pageY;
        }).bind('touchend', function(e) {
            if (!touch.el)
                return;
            if (!touch.el.data("ignore-pressed"))
                touch.el.removeClass("selected");
            if (touch.isDoubleTap) {
                touch.el.trigger('doubleTap');
                touch = {};
            } else if (touch.x2 > 0 || touch.y2 > 0) {
                (Math.abs(touch.x1 - touch.x2) > 30 || Math.abs(touch.y1 - touch.y2) > 30) && 
                touch.el.trigger('swipe') && 
                touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)));
                touch.x1 = touch.x2 = touch.y1 = touch.y2 = touch.last = 0;
            } else if ('last' in touch) {
                touch.el.trigger('tap');
                
                touchTimeout = setTimeout(function() {
                    touchTimeout = null;
                    if (touch.el)
                        touch.el.trigger('singleTap');
                    touch = {};
                }, 250);
            }
        }).bind('touchcancel', function() {
            touch = {}
        });
    });
    
    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m) {
        $.fn[m] = function(callback) {
            return this.bind(m, callback)
        }
    });
})(jq);
