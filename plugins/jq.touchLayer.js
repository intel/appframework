//TouchLayer contributed by Carlos Ouro @ Badoo
//un-authoritive layer between touches and actions on the DOM 
//(un-authoritive: listeners do not require useCapture)
//handles overlooking JS and native scrolling, panning, 
//no delay on click, edit mode focus, preventing defaults, resizing content, 
//enter/exit edit mode (keyboard on screen), prevent clicks on momentum, etc
//It can be used independently in other apps but it is required by jqUi
(function() {
	//singleton
    $.touchLayer = function(el) {
		$.touchLayer = new touchLayer(el);
		return $.touchLayer;
    };
	//configuration stuff
	var inputElements = ['input', 'select', 'textarea'];
	var autoBlurInputTypes = ['button', 'radio', 'checkbox', 'range'];
	var requiresJSFocus = $.os.ios;	//devices which require .focus() on dynamic click events
	var verySensitiveTouch = $.os.blackberry;	//devices which have a very sensitive touch and touchmove is easily fired even on simple taps
	var inputElementRequiresNativeTap = $.os.blackberry || ($.os.android && !$.os.chrome);	//devices which require the touchstart event to bleed through in order to actually fire the click on select elements
	var selectElementRequiresNativeTap = $.os.blackberry || ($.os.android && !$.os.chrome);	//devices which require the touchstart event to bleed through in order to actually fire the click on select elements
	var focusScrolls = $.os.ios;	//devices scrolling on focus instead of resizing
	var focusResizes = $.os.blackberry10;
	var requirePanning = $.os.ios;	//devices which require panning feature
    
	var touchLayer = function(el) {
		this.clearTouchVars();
        el.addEventListener('touchstart', this, false);
		el.addEventListener('touchmove', this, false);
		el.addEventListener('touchend', this, false);
		el.addEventListener('click', this, false);
		document.addEventListener('scroll', this, false);
		window.addEventListener("orientationchange", this, false);
	    window.addEventListener("resize", this, false);
		this.layer=el;
		//proxies
		this.scrollEndedProxy_ = $.proxy(this.scrollEnded, this);
		this.hideAddressBarProxy_ = $.proxy(this.hideAddressBar, this, []);
		this.exitExitProxy_ = $.proxy(this.exitExit, this, []);
		var that = this;
		this.scrollTimeoutExpireProxy_ = function(){
			that.scrollTimeoutHandle_=null;
			that.scrollTimeoutEl.addEventListener('scroll', that.scrollEndedProxy_, false);
		};
		//js scrollers
		$.bind(this,'scrollstart',function(el){that.fireEvent('UIEvents', 'scrollstart', el, false, false);});
		$.bind(this,'scrollend',function(el){that.fireEvent('UIEvents', 'scrollend', el, false, false);});
    }
	
    touchLayer.prototype = {
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
		layer: null,
		panElementId: "header",
		scrollingEl: null,
		isScrolling: false,
		isScrollingVertical: false,
		wasPanning:false,
		isPanning:false,
		allowDocumentScroll:false,
		requiresNativeTap: false,
		focusElement: null,
		isFocused:false,
		blockClicks:false,
		scrollTimeoutHandle_:null,
		scrollEndedProxy_:null,
		scrollTimeoutExpiredProxy_:null,
		hideAddressBarProxy_:null,
		exitExitProxy_:null,
		considerScrollMomentum_:false,
		scrollTimeoutEl:null,
		blockPossibleClick:false,
		
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
            }
        },
		hideAddressBar:function() {
			//this.log("hiding address bar");
	        if (jq.os.desktop||jq.os.chrome) {
	            this.layer.style.height="100%";
	        } else if (jq.os.android) {
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
		onOrientationChange:function(e){
			//this.log("onOrientationChange");
			if( $.trigger(this, "orientationchange", [e]) ){
				window.setTimeout(this.hideAddressBarProxy_, 250);
			}
		},
		onResize:function(e){
			//this.log("onResize");
			if( $.trigger(this, "resize", [e]) && !jq.os.ios ){
				window.setTimeout(this.hideAddressBarProxy_, 250);
			}
		},
		onClick:function(e){
			//handle forms
			var tag =  e.target && e.target.tagName != undefined ? e.target.tagName.toLowerCase() : '';
			
			//this.log("click on "+tag);
			
            if (inputElements.indexOf(tag)!==-1 && (!this.isFocused || !e.target.isSameNode(this.focusedElement))) {

				var type =  e.target && e.target.type != undefined ? e.target.type.toLowerCase() : '';
				var autoBlur = autoBlurInputTypes.indexOf(type)!==-1;
				
				//focus
				if(!autoBlur) {
					//remove previous blur event if this keeps focus
					if(this.isFocused){
						this.focusedElement.removeEventListener('blur', this, false);
					}
					this.focusedElement = e.target;
					this.focusedElement.addEventListener('blur', this, false);
					//android bug workaround for UI
					if(!this.isFocused) {
						//this.log("enter edit mode");
						$.trigger(this, 'enter-edit', [e.target]);
					}
					this.isFocused = true;
				} else {
					this.isFocused=false;
				}
				this.allowDocumentScroll = true;
				
				//fire focus action
				if(requiresJSFocus){
					e.target.focus();
				}
				
				//BB10 needs to be preventDefault on touchstart and thus need manual blur on click
            } else if($.os.blackberry10 && this.isFocused) {
				//this.log("forcing blur on bb10 ");
				this.focusedElement.blur();
			}
		},
		onBlur:function(e){
			//this.log("blurring");
			this.isFocused=false;
			//just in case...
			if(this.focusedElement) this.focusedElement.removeEventListener('blur', this, false);
			this.focusedElement = null;
			//android bug workaround for UI
			setTimeout(this.exitExitProxy_,250);
		},
		exitExit:function(){
			if(!this.isFocused) {
				//this.log("exit edit mode");
				$.trigger(this, 'exit-edit', [e.target]);
                    
                //hideAddressBar now for scrolls, next stack step for resizes
                if(focusScrolls) this.hideAddressBar();
                else if(focusResizes) setTimeout(this.hideAddressBarProxy_,250);
			}
		},
		onScroll:function(e){
			//this.log("document scroll detected "+document.body.scrollTop);
			if(!this.allowDocumentScroll && !this.isPanning && e.target.isSameNode(document)) {
				this.allowDocumentScroll = true;
				if(this.wasPanning){
					this.wasPanning = false;
					//give it a couple of seconds
					setTimeout(this.hideAddressBarProxy_, 2000);
				} else {
					//this.log("scroll forced page into place");
					this.hideAddressBar();
				}
			}
		},
		
        onTouchStart: function(e) {
			//setup initial touch position
            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
			this.lastTimestamp = e.timeStamp;
			
			
            
			//check dom if necessary
			if(requirePanning||$.feat.nativeTouchScroll) this.checkDOMTree(e.target, this.layer);
			//scrollend check
			if(this.isScrolling){
				//remove prev timeout
				if(this.scrollTimeoutHandle_!=null){
					clearTimeout(this.scrollTimeoutHandle_);
					//different element, trigger scrollend anyway
					if(this.scrollTimeoutEl != this.scrollingEl) this.scrollEnded(false);
					else this.blockPossibleClick=true;
					//check if event was already set
				} else if(this.scrollTimeoutEl){
					//trigger 
					this.scrollEnded(true);
					this.blockPossibleClick=true;
				}
				
			}
			
			
            // We allow forcing native tap in android devices (required in special cases)
            var forceNativeTap = (jq.os.android && e && e.target && e.target.getAttribute && e.target.getAttribute("data-touchlayer") == "ignore");
            
			//if on edit mode, allow all native touches 
			//(BB10 must still be prevented, always clicks even after move)
			if(forceNativeTap || (this.isFocused && !$.os.blackberry10)) {
				this.requiresNativeTap=true;
				this.allowDocumentScroll=true;
			
			//some stupid phones require a native tap in order for the native input elements to work
			} else if(inputElementRequiresNativeTap && e.target && e.target.tagName != undefined){
				var tag = e.target.tagName.toLowerCase();
				if(inputElements.indexOf(tag)!==-1) {
					//notify scrollers (android forms bug), except for selects
					if(tag!='select') $.trigger(this, 'pre-enter-edit', [e.target]);
					this.requiresNativeTap = true;
				}
			}
			
			//this.log("Touchstart: "+
			//	(this.isFocused?"focused ":"")+
			//	(this.isPanning?"panning ":"")+
			//	(this.requiresNativeTap?"nativeTap ":"")+
			//	(this.isScrolling?"scrolling ":"")+
			//	(this.allowDocumentScroll?"allowDocumentScroll ":"")
			//);
			
			//prevent default if possible
			if(!this.isScrolling && !this.isPanning && !this.requiresNativeTap) {
				e.preventDefault();
				//demand vertical scroll (don't let it pan the page)
			} else if(this.isScrollingVertical){
				this.demandVerticalScroll();
			}
        },
		demandVerticalScroll:function(){
			//if at top or bottom adjust scroll
			var atTop = this.scrollingEl.scrollTop<=0;
			if(atTop){
				//this.log("adjusting scrollTop to 1");
				this.scrollingEl.scrollTop=1;
			} else {
				var scrollHeight = this.scrollingEl.scrollTop+this.scrollingEl.clientHeight;
				var atBottom = scrollHeight>=this.scrollingEl.scrollHeight;
				if(atBottom) {
					//this.log("adjusting scrollTop to max-1");
					this.scrollingEl.scrollTop=this.scrollingEl.scrollHeight-this.scrollingEl.clientHeight-1;
				}
			}
		},
		//set rules here to ignore scrolling check on these elements
		//consider forcing user to use scroller object to assess these... might be causing bugs
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
			var overflowX = styles.overflowX;
			if(overflowX == 'scroll') return true;
			if(overflowX == 'auto' && el['scrollWidth'] > el['clientWidth'])
				return true;
			return false;
		},
		
		
		//check if pan or native scroll is possible
		checkDOMTree : function(el, parentTarget){
			
			//check panning
			//temporarily disabled for android - click vs panning issues
			if(requirePanning && this.panElementId==el.id){
				this.isPanning = true;
				return;
			}
			//check native scroll
			if($.feat.nativeTouchScroll){
				
				//prevent errors
				if(this.ignoreScrolling(el)) {
					return;
				}
			
				//check if vertical or hor scroll are allowed
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
		//scroll finish detectors
		scrollEnded : function(e){
			//this.log("scrollEnded");
			if(e) this.scrollTimeoutEl.removeEventListener('scroll', this.scrollEndedProxy_, false);
			this.fireEvent('UIEvents', 'scrollend', this.scrollTimeoutEl, false, false);
			this.scrollTimeoutEl=null;
		},
		
        
        onTouchMove: function(e) {
			//set it as moved
			var wasMoving = this.moved;
			this.moved = true;
			//very sensitive devices check
			if(verySensitiveTouch){
				this.cY = e.touches[0].pageY - this.dY;
				this.cX = e.touches[0].pageX - this.dX;
			}
			//panning check
			if(this.isPanning) {
				return;
			}
			//native scroll (for scrollend)
			if(this.isScrolling){
				if(!wasMoving) {
					//this.log("scrollstart");
					this.fireEvent('UIEvents', 'scrollstart', this.scrollingEl, false, false);
				}
				if(this.isScrollingVertical) {
					this.speedY = (this.lastY - e.touches[0].pageY)/(e.timeStamp-this.lastTimestamp);
					this.lastY = e.touches[0].pageY;
					this.lastTimestamp = e.timeStamp;
				}
			}
			//non-native scroll devices
			if(!this.isScrolling && (!$.os.blackberry10 || !this.requiresNativeTap)){
				//legacy stuff for old browsers
	            e.preventDefault();
				//this.log("TouchMove (preventDefault): "+
				//	(this.isFocused?"focused ":"")+
				//	(this.isPanning?"panning ":"")+
				//	(this.requiresNativeTap?"nativeTap ":"")+
				//	(this.isScrolling?"scrolling ":"")+
				//	(this.moved?"moved ":"")
				//);
				return;
			}
			
			//this.log("TouchMove: "+
			//	(this.isFocused?"focused ":"")+
			//	(this.isPanning?"panning ":"")+
			//	(this.requiresNativeTap?"nativeTap ":"")+
			//	(this.isScrolling?"scrolling ":"")+
			//	(this.moved?"moved ":"")
			//);
        },
        
        onTouchEnd: function(e) {
			//double check moved for sensitive devices
			var itMoved = this.moved;
			if(verySensitiveTouch){
				itMoved = itMoved && !(Math.abs(this.cX) < 10 && Math.abs(this.cY) < 10);
			}
			
			//panning action
			if(this.isPanning && itMoved){
				//wait 2 secs and cancel
				this.wasPanning = true;
				
			//a generated click
			} else if (!itMoved && !this.requiresNativeTap) {
				
				//NOTE: on android if touchstart is not preventDefault(), click will fire even if touchend is prevented
				//this is one of the reasons why scrolling and panning can not be nice and native like on iPhone
				e.preventDefault();
				
				//fire click
				if(!this.blockClicks && !this.blockPossibleClick){
	                var theTarget = e.target;
	                if (theTarget.nodeType == 3)
	                    theTarget = theTarget.parentNode;
				
					this.fireEvent('MouseEvents', 'click', theTarget, true, e.mouseToTouch);
				}
				
            } else if(itMoved){
				//setup scrollend stuff
				if(this.isScrolling){
					this.scrollTimeoutEl = this.scrollingEl;
					if(Math.abs(this.speedY)<0.01){
						//fire scrollend immediatly
						//this.log(" scrollend immediately "+this.speedY);
						this.scrollEnded(false);
					} else {
						//wait for scroll event
						//this.log($.debug.since()+" setting scroll timeout "+this.speedY);
						this.scrollTimeoutHandle_ = setTimeout(this.scrollTimeoutExpireProxy_,30)
					}
				}
				//trigger cancel-enter-edit on inputs
				if(this.requiresNativeTap){
            		if(!this.isFocused) $.trigger(this, 'cancel-enter-edit', [e.target]);
				}
            }
			
			
			
			//this.log("TouchEnd: "+
			//	(this.isFocused?"focused ":"")+
			//	(this.isPanning?"panning ":"")+
			//	(this.requiresNativeTap?"nativeTap ":"")+
			//	(this.isScrolling?"scrolling ":"")+
			//	(itMoved?"moved ":"")
			//);
			
			
			//clear up vars
			this.clearTouchVars();
        },
		
		clearTouchVars:function(){
			this.speedY = this.lastY = this.cY = this.cX = this.dX = this.dY = 0;
			this.allowDocumentScroll=false;
            this.moved = false;
			this.isPanning = false;
			this.isScrolling = false;
			this.isScrollingVertical = false;
			this.requiresNativeTap = false;
			this.blockPossibleClick = false;
		},
		
		fireEvent:function(eventType, eventName, target, bubbles, mouseToTouch){
			//this.log("Firing event "+eventName);
			//create the event and set the options
			var theEvent = document.createEvent(eventType);
			theEvent.initEvent(eventName, bubbles, true);
			theEvent.target = target;
			//jq.DesktopBrowsers flag
			if(mouseToTouch) theEvent.mouseToTouch = true;
			target.dispatchEvent(theEvent);
		}
		
		//log : function(str){
		//	$.debug.log(str);
		//}
		
    };
    
})();
