/**
 * jq.scroller - a scrolling library for jQ.Mobi apps
 * Copyright 2011 - AppMobi 
 */

(function($){
	$.fn["scroller"]=function(opts)
	{
		var tmp;
		for(var i=0;i<this.length;i++)
		{
			tmp = new scroller(this[i],opts);
		}
		return this.length==1?tmp:this;
	};
	var scroller = (function() {
		if(!window.WebKitCSSMatrix)
		   return;
		var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
		var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";
		var touchStarted=false;

		var scroller = function(elID, opts) {
			
			if (typeof elID == "string" || elID instanceof String) {
				this.el = document.getElementById(elID);
			} else {
				this.el = elID;
			}
			if (!this.el) {
				alert("Could not find element for scroller " + elID);
				return;
			}

			if (this instanceof scroller) {
				for (j in opts) {
					this[j] = opts[j];
				}
			} else {
				return new scroller(elID, opts);
			}
			try {
				this.container = this.el.parentNode;
				var that = this;
				this.initEvents();
				var windowHeight = window.innerHeight;
				var windowWidth = window.innerWidth;
									
				
				if (this["verticalScroll"] && this["verticalScroll"] == true
						&& this["scrollBars"] == true) {
					var scrollDiv = createScrollBar(5,20);
					scrollDiv.style.top = "0px";
					if(this.vScrollCSS)
						scrollDiv.className=this.vScrollCSS;
					scrollDiv.style.opacity="0";
					this.container.appendChild(scrollDiv);
					this.vscrollBar = scrollDiv;
					scrollDiv=null;
				}
				if (this["horizontalScroll"] && this["horizontalScroll"] == true
						&& this["scrollBars"] == true) {
					var scrollDiv = createScrollBar(20,5);
					scrollDiv.style.bottom = "0px";
					
					if(this.hScrollCSS)
						scrollDiv.className=this.hScrollCSS;
					scrollDiv.style.opacity="0";
					this.container.appendChild(scrollDiv);
					this.hscrollBar = scrollDiv;
					scrollDiv=null;
				}
				this.initScrollbars();
			} catch (e) {
				alert("error adding scroller" + e);
			}
			
		};

		function createScrollBar(width, height) {
			var scrollDiv = document.createElement("div");
			scrollDiv.style.position = 'absolute';
			scrollDiv.style.width = width + "px";
			scrollDiv.style.height = height + "px";
			scrollDiv.style.webkitBorderRadius = "2px";
			scrollDiv.style.opacity=0;
			scrollDiv.className = 'scrollBar';
			scrollDiv.style.background="black";
			return scrollDiv;
		}

		scroller.prototype = {
			lockX : 0,
			lockY : 0,
			boolScrollLock : false,
			currentScrollingObject : null,
			bottomMargin : 0,
			maxTop : 0,
			startTop : 0,
			verticalScroll : true,
			horizontalScroll : false,
			scrollBars : true,
			vscrollBar : null,
			hscrollBar : null,
			hScrollCSS: "scrollBar",
			vScrollCSS: "scrollBar",
			divHeight : 0,
			lastScrollbar : "",
			timeMoved : 0,
			vdistanceMoved : 0,
			hdistanceMoved : 0,
			prevTime : 0,
			finishScrollingObject : null,
			container : null,
			// horizontal scrolling
			maxLeft : 0,
			startLeft : 0,
			rightMargin : 0,
			divWidth : 0,
			refresh:false,
			refreshFunction:null,
			decelerating:false,
			listeners:{start:"",move:"",end:""},
			initEvents:function(){
			var that=this;
			this.el.addEventListener('touchmove', this.listeners.start=function(e) {
					that.touchMove(e);
				}, false);
				this.el.addEventListener('touchstart', this.listeners.move=function(e) {
					that.touchStart(e);
				}, false);
				this.el.addEventListener('touchend', this.listeners.end=function(e) {
					that.touchEnd(e);
				}, false);	
			},
			removeEvents:function(){

				this.el.removeEventListener('touchmove', this.listeners.start,false);
				this.el.removeEventListener('touchstart', this.listeners.move,false);
				this.el.removeEventListener('touchend', this.listeners.end,false);	
			},
			initScrollbars:function(){
				var windowHeight = window.innerHeight;
				var windowWidth = window.innerWidth;
				
				var container = this.container;		
				
				var eleScrolling=this.el;
				this.bottomMargin = container.clientHeight > window.innerHeight ? window.innerHeight
							: container.clientHeight;
				this.maxTop = eleScrolling.clientHeight - this.bottomMargin;
				this.divHeight = eleScrolling.clientHeight;
				this.rightMargin = container.clientWidth > window.innerWidth ? window.innerWidth
							: container.clientWidth;
				this.maxLeft = eleScrolling.clientWidth - this.rightMargin;
				this.divWidth = eleScrolling.clientWidth;								
				
				if (this["verticalScroll"] && this["verticalScroll"] == true
						&& this["scrollBars"] == true) {
					if (this.container.clientWidth > window.innerWidth)
						this.vscrollBar.style.left = (window.innerWidth - numOnly(this.vscrollBar.style.width)*3)+ "px";
					else
						this.vscrollBar.style.right = "0px";
					this.vscrollBar.style.height = (parseFloat(this.bottomMargin/ this.divHeight) * this.bottomMargin)+ "px";
					
					if(this.el.clientHeight<=this.container.clientHeight)
					   this.vscrollBar.style.opacity=0;
				}
				if (this["horizontalScroll"] && this["horizontalScroll"] == true
						&& this["scrollBars"] == true) {
					if (this.container.clientHeight > window.innerHeight)
						this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height))+ "px";
					else
						this.hscrollBar.style.bottom = this.hscrollBar.style.height;
					this.hscrollBar.style.width = (parseFloat(this.rightMargin/ this.divWidth) * this.rightMargin)+ "px";
					
					if(this.el.clientWidth<=this.container.clientWidth)
					   this.hscrollBar.style.opacity=0;
				}
			},
			// handle the moving function
			touchMove : function(event) {
				try {
					//if(!touchStarted){
						//touchStarted=true;
						//this.touchStart(event);
					//}

					if (this.currentScrollingObject != null) {
						event.preventDefault();
						var scrollPoints = {
							x : 0,
							y : 0
						};
						var scrollbarPoints = {
							x : 0,
							y : 0
						};
						var newTop = 0, prevTop = 0, newLeft = 0, prevLeft = 0;
						if (this.verticalScroll) {
							var deltaY = this.lockY - event.touches[0].pageY;
							deltaY = -deltaY;
							var newTop = this.startTop + deltaY;
							var top = -newTop;
							try{
							var prevTop = numOnly(new WebKitCSSMatrix(window
									.getComputedStyle(this.el).webkitTransform).f);
							}
							catch(prevTopE){var prevTop=0;}
							scrollPoints.y = newTop;
						}
						if (this.horizontalScroll) {
							var deltaX = this.lockX - event.touches[0].pageX;
							deltaX = -deltaX;
							var newLeft = this.startLeft + deltaX;
							var left = newLeft;
							try{
							var prevLeft = -numOnly((new WebKitCSSMatrix(window
									.getComputedStyle(this.el).webkitTransform).e));
							}
							catch(prevLeftE){var prevLeft=0;}
							scrollPoints.x = left;

						}
						this.scrollerMoveCSS(this.currentScrollingObject,
								scrollPoints, 0);

						if (this.vscrollBar) {
							// We must calculate the position. Since we don't allow
							// the page to scroll to the full content height, we use
							// maxTop as height to work with.

							var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height))
									- (((this.maxTop + newTop) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
							this.scrollerMoveCSS(this.vscrollBar, {
								x : 0,
								y : pos
							}, 0);
						}
						if (this.hscrollBar) {
							// We must calculate the position. Since we don't allow
							// the page to scroll to the full content height, we use
							// maxTop as height to work with.
							var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width))
									- (((this.maxLeft + newLeft) / this.maxLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
							this.scrollerMoveCSS(this.hscrollBar, {
								x : pos,
								y : 0
							}, 0);
						}

						if (this.prevTime) {
							var tmpDistanceY = Math.abs(prevTop) - Math.abs(newTop);
							var tmpDistanceX = Math.abs(prevLeft)
									- Math.abs(newLeft);
							var tmpTime = event.timeStamp - this.prevTime;
							if (tmpTime < 1000) { // movement is under a second,
								// keep adding the differences
								this.timeMoved += tmpTime;
								this.vdistanceMoved += tmpDistanceY;
								this.hdistanceMoved += tmpDistanceX;
							} else { // We haven't moved in a second, lets reset
								// the variables
								this.timeMoved = 0;
								this.vdistanceMoved = 0;
								this.hdistanceMoved = 0;
							}
						}
						this.prevTime = event.timeStamp;
					}
				} catch (e) {
					alert("error in scrollMove: " + e);
				}
			},

			touchStart : function(event) {
				
				var container = this.container;
				var eleScrolling = this.el;
				if (!container)
					return;
				touchStarted=true
				try {
					// Allow interaction to legit calls, like select boxes, etc.
					if (event.touches[0].target
							&& event.touches[0].target.type != undefined) {
						var tagname = event.touches[0].target.tagName.toLowerCase();
						if (tagname == "select" || tagname == "input"
								|| tagname == "button") // stuff we need to allow
							// access to
							return;
					}
					//Add the pull to refresh text.  Not optimal but keeps from others overwriting the content and worrying about italics
					
				if(this["refresh"]&&this["refresh"]==true&&document.getElementById(this.el.id+"_pulldown")==null){
					//add the refresh div
					var text="<div id='"+this.el.id+"_pulldown' class='jqscroll_refresh' style='border-radius:.6em;border: 1px solid #2A2A2A;background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0,#666666),color-stop(1,#222222));background:#222222;margin:0px;height:60px;top:0px;left:5px;right:10px;position:absolute;-webkit-transform: translate3d(0, -65px, 0);top:0,left:0,right:0;text-align:center;line-height:60px;color:white;'>Pull to Refresh</div>";
					this.el.innerHTML=text+this.el.innerHTML;
				}
					
					this.timeMoved = 0;
					this.vdistanceMoved = 0;
					this.hdistanceMoved = 0;
					this.prevTime = null;
					this.finishScrollingObject = null;
					this.bottomMargin = container.clientHeight > window.innerHeight ? window.innerHeight
							: container.clientHeight;
					this.maxTop = eleScrolling.clientHeight - this.bottomMargin;
					this.divHeight = eleScrolling.clientHeight;
					this.rightMargin = container.clientWidth > window.innerWidth ? window.innerWidth
							: container.clientWidth;
					this.maxLeft = eleScrolling.clientWidth - this.rightMargin;
					this.divWidth = eleScrolling.clientWidth;

					if (this.maxTop < 0)
						return;

					if (event.touches.length == 1 && this.boolScrollLock == false) {
						try {
							this.startTop = numOnly(new WebKitCSSMatrix(window
									.getComputedStyle(eleScrolling).webkitTransform).f);
							this.startLeft = numOnly(new WebKitCSSMatrix(window
									.getComputedStyle(eleScrolling).webkitTransform).e);
						} catch (e) {
							this.startTop = 0;
							this.startLeft = 0;
							console.log("error scroller touchstart " + e);
						}
						this.lockX = event.touches[0].pageX;
						this.lockY = event.touches[0].pageY;
						this.currentScrollingObject = eleScrolling;
						this.scrollerMoveCSS(eleScrolling,{x:this.startLeft,y:this.startTop},0);
						if (this.vscrollBar) {
							this.vscrollBar.style.height = (parseFloat(this.bottomMargin
									/ this.divHeight) * this.bottomMargin)
									+ "px";
							var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height))
									- (((this.maxTop + this.startTop) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
							this.scrollerMoveCSS(this.vscrollBar, {x : 0,y : pos}, 0);
							

							if (this.container.clientWidth > window.innerWidth)
								this.vscrollBar.style.left = (window.innerWidth - numOnly(this.vscrollBar.style.width)*3)
										+ "px";
							else
								this.vscrollBar.style.right = "0px";
							this.vscrollBar.webkitTransition='';
							this.vscrollBar.style.opacity = 1;
						}

						if (this.hscrollBar) {
							this.hscrollBar.style.width = (parseFloat(this.rightMargin
									/ this.divWidth) * this.rightMargin)
									+ "px";
							var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width))
									- (((this.maxTop + this.startLeft) / this.maxtLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
							this.scrollerMoveCSS(this.hscrollBar, {	x : pos,y : 0}, 0);
							if (this.container.clientHeight > window.innerHeight)
								this.hscrollBar.style.top = (window.innerHeight - numOnly(this.hscrollBar.style.height))
										+ "px";
							else
								this.hscrollBar.style.bottom = numOnly(this.hscrollBar.style.height);
							this.vscrollBar.webkitTransition='';
							
							this.hscrollBar.style.opacity = 1;
						}
					    
						//event.preventDefault();
						// get the scrollbar
					}
				} catch (e) {
					alert("error in scrollStart: " + e);
				}
			},

			// touchend callback. Set the current scrolling object and scrollbar to
			// null
			touchEnd : function(event) {
				if (this.currentScrollingObject != null) {
					event.preventDefault();
					event.stopPropagation();
					this.finishScrollingObject = this.currentScrollingObject;
					this.currentScrollingObject = null;
					var scrollPoints = {
						x : 0,
						y : 0
					};
					var time=300;
					if (this.verticalScroll) {
						var myDistance = -this.vdistanceMoved;
						var dist = myDistance;
						var time = this.timeMoved;
						
						
						var velocity = dist/time;
						var acceleration = velocity < 0 ? 0.0005 : -0.0005;
						var displacement = - (velocity * velocity) / (2 * acceleration);
						time = - velocity / acceleration*.65;
						

						var move = numOnly(new WebKitCSSMatrix(window
								.getComputedStyle(this.el).webkitTransform).f);
						var moveY=move;
						if (move < 0)
							move = move - displacement;

						if (move > 0)
							move = 0;

						if (move < (-this.maxTop))
							move = -this.maxTop;
						scrollPoints.y = move;
					}
					if (this.horizontalScroll) {
						var myDistance = -this.hdistanceMoved;
						var dist = myDistance;
						var time = this.timeMoved;
						var velocity = dist/time;
						var acceleration = velocity < 0 ? 0.0005 : -0.0005;
						var displacement = - (velocity * velocity) / (2 * acceleration);
						time = - velocity / acceleration*.65;
						

						var move = (new WebKitCSSMatrix(window
								.getComputedStyle(this.el).webkitTransform).e);

						if (move < 0)
							move = move - displacement;

						if (move > 0)
							move = 0;

						if (move < (-this.maxLeft))
							move = -this.maxLeft;
						scrollPoints.x = move;
					}
					var that=this;
					if(this["refresh"]&&moveY>60){
						if(this["refreshFunction"])
						{
							this.refreshFunction.call();
						}
					}
					if(time<300)
					   time=300
					this.scrollerMoveCSS(this.finishScrollingObject, scrollPoints,
							time, "cubic-bezier(0.33,0.66,0.66,1)");
					if (this.vscrollBar) {
						var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height))
								- (((this.maxTop + scrollPoints.y) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
						if (pos > this.bottomMargin)
							pos = this.bottomMargin;
						if (pos < 0)
							pos = 0;
						this.scrollerMoveCSS(this.vscrollBar, {
							x : 0,
							y : pos
						}, time, "cubic-bezier(0.33,0.66,0.66,1)");
						this.vscrollBar.style.opacity = '0';
						
					}
					if (this.hscrollBar) {
						var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width))
								- (((this.maxLeft + scrollPoints.x) / this.maxLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
						if (pos > this.rightMargin)
							pos = this.rightMargin;
						if (pos < 0)
							pos = 0;
						this.scrollerMoveCSS(this.hscrollBar, {
							x : pos,
							y : 0
						}, time, "cubic-bezier(0.33,0.66,0.66,1)");
						this.hscrollBar.style.opacity = '0';
					}
				}
				this.hdistanceMoved = 0;
				this.vdistanceMoved = 0;
				touchStarted=false;
			},

			scrollerMoveCSS : function(el, distanceToMove, time, timingFunction) {
				if (!time)
					time = 0;
				if (!timingFunction)
					timingFunction = "linear";

				el.style.webkitTransform = "translate" + translateOpen
						+ distanceToMove.x + "px," + distanceToMove.y + "px"
						+ translateClose;
				el.style.webkitTransitionDuration = time + "ms";
				el.style.webkitBackfaceVisiblity = "hidden";
				el.style.webkitTransitionTimingFunction = timingFunction;
			},

			scrollTo : function(pos,time) {
				if(!time)
				  time=0;
				this.scrollerMoveCSS(this.el, pos, time);
				if (this.vscrollBar) {
				var pos = (this.bottomMargin - numOnly(this.vscrollBar.style.height))
								- (((this.maxTop + pos.y) / this.maxTop) * (this.bottomMargin - numOnly(this.vscrollBar.style.height)));
						if (pos > this.bottomMargin)
							pos = this.bottomMargin;
						if (pos < 0)
							pos = 0;
						this.scrollerMoveCSS(this.vscrollBar, {
							x : 0,
							y : pos
						}, time, "ease-out");
						this.vscrollBar.style.opacity = '0';
						
					}
					if (this.hscrollBar) {
						var pos = (this.rightMargin - numOnly(this.hscrollBar.style.width))
								- (((this.maxLeft + pos.x) / this.maxLeft) * (this.rightMargin - numOnly(this.hscrollBar.style.width)));
						if (pos > this.rightMargin)
							pos = this.rightMargin;
						if (pos < 0)
							pos = 0;
						this.scrollerMoveCSS(this.hscrollBar, {
							x : pos,
							y : 0
						}, time, "ease-out");
						this.hscrollBar.style.opacity = '0';
					}
			}
		};
		return scroller;
	})();

	// Helper function to get only
	if (!window.numOnly) {
		function numOnly(val) {
			if (isNaN(parseFloat(val)))
				val = val.replace(/[^0-9.-]/, "");

			return parseFloat(val);
		}
	}
})(jq);