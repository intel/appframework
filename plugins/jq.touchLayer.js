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
		this.ignoreNextScroll = true;
		var that = this;
		document.addEventListener('scroll', function(e){
			if(!that.allowDocumentScroll && e.target.isSameNode(document)) {
				if(!that.isPanning){
					if(!that.ignoreNextScroll){
						that.ignoreNextScroll = true;
						that.hideAddressBar();
					} else that.ignoreNextScroll=false;
				}
			}
		}, true);
		this.layer=el;
    }
    var prevClickField;
	
    touchLayer.prototype = {
		allowDocumentScroll:false,
        dX: 0,
        dY: 0,
        cX: 0,
        cY: 0,
		layer: null,
		panElementId: "header",
		scrollingEl: null,
		isScrolling: false,
		currentMomentum: 0,
		startTime:0,
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
			var id = e.target.id;

            this.dX = e.touches[0].pageX;
            this.dY = e.touches[0].pageY;
			
            if (this.fixInputHandlers(e)) {
				this.debugVars("touchstart: stopped at fixInputHandlers");
                return;
			} else {
				this.allowDocumentScroll=false;
			}
				
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
			} else if(this.isScrollingVertical && !this.demandVerticalScroll()){
				this.debugVars("touchstart: stopped at demandVerticalScroll");
				e.preventDefault();
				return;
			}
			this.debugVars("touchstart");
			document.addEventListener('touchmove', this, false);
			document.addEventListener('touchend', this, false);
        },
		debugVars:function(start){
			return;	//comment to test
			console.log($.debug.since()+start);
			console.log(
				(this.moved?"move ":"") +
				(this.isPanning?"panning ":"") +
				(this.isScrolling?"scrolling ":"") +
				(this.scrollingEl?"scrolltop "+this.scrollingEl.scrollTop+" ":"")
			);
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
			return true;
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
			if($.os.supportsNativeTouchScroll){
				
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
				this.debugVars("touchmove: panning");
				return;
			}

			if(!this.isScrolling){
				//legacy stuff for old browsers
	            e.preventDefault();
				this.moved = true;
				this.debugVars("touchmove: not scrolling");
				return;
			}
			
			//otherwise it is a native scroll
			this.debugVars("touchmove");
			
			//let's clear events for performance
            document.removeEventListener('touchmove', this, false);
			document.removeEventListener('touchend', this, false);
        },
		
        
        onTouchEnd: function(e) {
			
			var itMoved = $.os.blackberry ? (Math.abs(this.cX) < 5 || Math.abs(this.cY) < 5) : this.moved;
			
			if(this.isPanning && itMoved){
				//wait 2 secs and cancel
				var that = this;
				setTimeout(function(){
					that.hideAddressBar();
				}, 2000);
			}
			
			if(!this.isScrolling) e.preventDefault();
			
            if (!itMoved) {
                var theTarget = e.target;
                if (theTarget.nodeType == 3)
                    theTarget = theTarget.parentNode;
               
				//SIMULATES A REAL CLICK EVENT ON TARGET
				//create click event and let it bubble normally
            	var theEvent = document.createEvent('MouseEvents');
            	theEvent.initEvent('click', true, true);
				theEvent.target = e.target;
				//jq.DesktopBrowsers flag
				if(e.mouseToTouch) theEvent.mouseToTouch = true;
					
				//Setup to act when event finishes bubbling
				var callbackEvent=function(clickEvent){
					checkAnchorClick(clickEvent);
					document.removeEventListener('click', callbackEvent, false);
				}
				document.addEventListener('click', callbackEvent, false);
				var oldPrevent = theEvent.preventDefault;
				//cancel both the click event and our callback
				theEvent.preventDefault = function(){
					document.removeEventListener('click', callbackEvent, false);
					oldPrevent.call(theEvent);
				}
				
				//TODO: Known loophole
				// If .stopPropagation() but no .preventDefault() we cannot prevent the click event on the element and replace with our own...
            	theTarget.dispatchEvent(theEvent);
				
				
                if (theTarget && theTarget.type != undefined) {
                    var tagname = theTarget.tagName.toLowerCase();
                    if (tagname == "select" || (tagname == "input" && (theTarget.type=="text"||theTarget.type=="password")) ||  tagname == "textarea") {
                        this.allowDocumentScroll = true;
						theTarget.focus();
                    }
                }
            }
			this.debugVars("touchend");
			
			this.isPanning = false;
			this.isScrolling = false;
            prevClickField = null;
            this.dX = this.cX = this.cY = this.dY = 0;
            document.removeEventListener('touchmove', this, false);
            document.removeEventListener('touchend', this, false);
			
        },
		
		fixInputHandlers:function(e) {
	        if (!jq.os.android)
	            return;
	        var theTarget = e.touches[0].target;
	        if (theTarget && theTarget.type != undefined) {
	            var tagname = theTarget.tagName.toLowerCase();
	            var type=theTarget.type;
	             if (tagname == "select" || tagname == "input" || tagname == "textarea")  { // stuff we need to allow
	                //On Android 2.2+, the keyboard is broken when we apply -webkit-transform.  The hit box is moved and it no longer loses focus when you click out.
	                //What the following does is moves the div up so the text is not covered by the keyboard.
	                if (jq.os.android && (theTarget.type.toLowerCase() == "password" || theTarget.type.toLowerCase() == "text" || theTarget.type.toLowerCase() == "textarea")) {
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
	    },
		
		
    };
	
	//debug
	//touchLayer = $.debug.type(touchLayer, 'touchLayer');
    
    function checkAnchorClick(e) {
		theTarget = e.target;
		
        var parent = false;
		//this technique fails when considerable content exists inside anchor, should be recursive ?
        if (theTarget.tagName.toLowerCase() != "a" && theTarget.parentNode)
            parent = true, theTarget = theTarget.parentNode; //let's try the parent so <a href="#foo"><img src="whatever.jpg"></a> will work
			
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
            if ((theTarget.href.indexOf("#") !== -1 && theTarget.hash.length == 0)||theTarget.href.length==0)
                return;
            
            
			//internal links
			e.preventDefault();
            var mytransition = theTarget.getAttribute("data-transition");
            var resetHistory = theTarget.getAttribute("data-resetHistory");
            resetHistory = resetHistory && resetHistory.toLowerCase() == "true" ? true : false;
            var href = theTarget.hash.length > 0 ? theTarget.hash : theTarget.href;
            jq.ui.loadContent(href, resetHistory, 0, mytransition, theTarget);
        }
    }
})();
