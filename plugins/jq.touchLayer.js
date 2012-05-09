//TouchLayer contributed by Carlos Ouro @ Badoo
//handles overlooking JS and native scrolling, panning, 
//no delay on click, edit mode focus, preventing defaults, resizing content, etc
//It can be used independently in other apps but it is required by jqUi
(function() {
    $.touchLayer = function(el) {
		return new touchLayer(el);
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
    
	//TouchLayer contributed by Carlos Ouro @ Badoo
	//handles overlooking panning on titlebar, bumps on native scrolling and no delay on click
	var touchLayer = function(el) {
        el.addEventListener('touchstart', this, false);
		el.addEventListener('click', this, false);
		this.ignoreNextScroll = true;	//there will be one scroll fired in the load process .hideAddressBar()
		document.addEventListener('scroll', this, true);
		this.layer=el;
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
		ignoreNextScroll:false,
		allowDocumentScroll:false,
		requiresNativeTap: false,
		focusElement: null,
		isFocused:false,
		
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
            }
        },
		hideAddressBar:function() {
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
		onClick:function(e){
			//handle forms
			var tag =  e.target && e.target.tagName != undefined ? e.target.tagName.toLowerCase() : '';
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
					if(!this.isFocused && this.onEnterEdit) this.onEnterEdit(e.target);
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
            } else if($.os.blackberry10 && this.isFocused) this.focusedElement.blur();
		},
		onBlur:function(e){
			this.isFocused=false;
			//just in case...
			if(this.focusedElement) this.focusedElement.removeEventListener('blur', this, false);
			this.focusedElement = null;
			//android bug workaround for UI
			var that = this;
			if(this.onExitEdit) {
				setTimeout(function(){
					if(!that.isFocused) {
						that.onExitEdit(e.target);
					}
				},250);
			}
			//hideAddressBar now for scrolls, next stack step for resizes
			if(focusScrolls) this.hideAddressBar();
			else if(focusResizes) setTimeout(function(){that.hideAddressBar();},250);
		},
		onScroll:function(e){
			if(!this.allowDocumentScroll && !this.isPanning && e.target.isSameNode(document)) {
				if(!this.ignoreNextScroll){
					this.ignoreNextScroll = true;
					if(this.wasPanning){
						this.wasPanning = false;
						//give it a couple of seconds
						var that = this;
						setTimeout(function(){
							that.hideAddressBar();
						}, 2000);
					} else {
						this.hideAddressBar();
					}
				} else this.ignoreNextScroll=false;
			}
		},
		
        onTouchStart: function(e) {
			var id = e.target.id;

            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
			
			this.allowDocumentScroll=false;
			
            this.moved = false;
			this.isPanning = false;
			this.isScrolling = false;
			this.isScrollingVertical = false;
			this.requiresNativeTap = false;
			
			this.checkDOMTree(e.target, this.layer);
			
			//if on edit mode, allow all native touches 
			//(BB10 must still be prevented, always clicks even after move)
			if(this.isFocused && !$.os.blackberry10) {
				this.requiresNativeTap=true;
				//some stupid phones require a native tap in order for the native input elements to work
			} else if(inputElementRequiresNativeTap && e.target && e.target.tagName != undefined){
				if(inputElements.indexOf(e.target.tagName.toLowerCase())!==-1) {
					if(this.onPreEnterEdit) {
						this.onPreEnterEdit(e.target);
					}
					this.requiresNativeTap = true;
				}
			}

			if(!this.isScrolling && !this.isPanning && !this.requiresNativeTap) {
				e.preventDefault();
			} else if(this.isScrollingVertical){
				this.demandVerticalScroll();
			}
			document.addEventListener('touchmove', this, false);
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
			
			if(this.isPanning) {
				this.moved = true;
				document.removeEventListener('touchmove', this, false);
				return;
			}

			if(!this.isScrolling && (!$.os.blackberry10 || !this.requiresNativeTap)){
				//legacy stuff for old browsers
	            e.preventDefault();
				this.moved = true;
				return;
			}
			
			//otherwise it is a native scroll
			//let's clear events for performance
            document.removeEventListener('touchmove', this, false);
			document.removeEventListener('touchend', this, false);
        },
		
        
        onTouchEnd: function(e) {
			var itMoved = this.moved;
			
			if(verySensitiveTouch){
				itMoved = itMoved && !(Math.abs(this.cX) < 10 && Math.abs(this.cY) < 10);
			}
						
			var that = this;
			
			if(this.isPanning && itMoved){
				//wait 2 secs and cancel
				this.wasPanning = true;
			}
			
            if (!itMoved && !this.requiresNativeTap) {
				
				//NOTE: on android if touchstart is not preventDefault(), click will fire even if touchend is prevented
				//this is one of the reasons why scrolling and panning can not be nice and native like on iPhone
				e.preventDefault();
					
                var theTarget = e.target;
                if (theTarget.nodeType == 3)
                    theTarget = theTarget.parentNode;
				
				//fire the click event
				this.fireEvent('MouseEvents', 'click', theTarget, true, e.mouseToTouch);
				
            } else if(itMoved && this.requiresNativeTap){
            	if(this.onCancelEnterEdit) this.onCancelEnterEdit(e.target);
            }
			
			this.requiresNativeTap = false;
			this.isPanning = false;
			this.isScrolling = false;
            this.dX = this.cX = this.cY = this.dY = 0;
            document.removeEventListener('touchmove', this, false);
            document.removeEventListener('touchend', this, false);
			
        },
		
		fireEvent:function(eventType, eventName, target, bubbles, mouseToTouch){
			//create the event and set the options
			var theEvent = document.createEvent(eventType);
			theEvent.initEvent(eventName, bubbles, true);
			theEvent.target = target;
			//jq.DesktopBrowsers flag
			if(mouseToTouch) theEvent.mouseToTouch = true;
			target.dispatchEvent(theEvent);
		}
		
    };
	
	//debug
	//touchLayer = $.debug.type(touchLayer, 'touchLayer');
    
    
})();
