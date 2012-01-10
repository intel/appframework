/**
 * jq.web.carousel - a carousel library for html5 mobile apps
 * @copyright AppMobi 2011 - AppMobi

 * 
 */

(function($){
	$.fn["carousel"]=function(opts)
	{
		var tmp;
		for(var i=0;i<this.length;i++)
		{
			tmp = new carousel(this[i],opts);
		}
		return this.length==1?tmp:this;
	};

	var carousel= (function() {
		if(!window.WebKitCSSMatrix)
		   return;
		var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
		var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";

		var carousel = function(containerEl, opts) {
			if (typeof containerEl == "string" || containerEl instanceof String) {
				this.container = document.getElementById(containerEl);
			} else {
				this.container = containerEl;
			}
			if (!this.container) {
				alert("Error finding container for carousel " + containerEl);
				return;
			}
			if (this instanceof carousel) {
				for (j in opts) {
					this[j] = opts[j];
				}
			} else {

				return new carousel(containerEl, opts);
			}
			try {
				var that = this;
				this.pagingDiv = this["pagingDiv"] ? document
						.getElementById(this["pagingDiv"]) : null;

				if (this.container.style.width)
					this.myDivWidth = numOnly(this.container.style.width);
				else {
					alert("Please set the width on " + this.container.id
							+ " object to use the carousel script");
					return;
				}
				if (this.container.style.height)
					this.myDivHeight = numOnly(this.container.style.height);
				else {
					alert("Please set the height on " + this.container.id
							+ " object to use the carousel script");
					return;
				}
				// initial setup

				this.container.style.overflow = "hidden";
				if (this["vertical"])
					this["horizontal"] = false;
				var tmpHTML = this.container.innerHTML;
				this.container.innerHTML = "";
				var el = document.createElement("div");
				el.innerHTML = tmpHTML;
				this.container.appendChild(el);
				var childrenCounter=0;
				n=el.childNodes[0];
				for ( ; n; n = n.nextSibling ) 
				   if ( n.nodeType == 1)
					  childrenCounter++;
				this.childrenCount = childrenCounter;
				
				this.moveCSS3(el, {
					x : 0,
					y : 0
				});
				el.style.width = Math.ceil((this.childrenCount)
						* this.myDivWidth)
						+ "px";
				el.style.height = this.myDivHeight;
				// Create the paging dots
				if (this.pagingDiv) {
					for (i = 0; i < this.childrenCount; i++) {

						var pagingEl = document.createElement("div");
						pagingEl.id = this.container.id + "_" + i;
						pagingEl.pageId = i;
						if (i != 0)
							pagingEl.className = this.pagingCssName;
						else
							pagingEl.className = this.pagingCssNameSelected;
						pagingEl.onclick = function() {
							that.onMoveIndex(this.pageId);
						};
						var spacerEl = document.createElement("div");
						if (!this["vertical"]) {
							spacerEl.style.cssFloat = "left";
							spacerEl.style.width = "20px";
							spacerEl.innerHTML = "&nbsp";
						} else {
							spacerEl.style.height = "20px";
							spacerEl.style.display = "block";
							spacerEl.style.clear = "both";
							spacerEl.innerHTML = "<br>";
						}

						this.pagingDiv.appendChild(pagingEl);
						this.pagingDiv.appendChild(spacerEl);
						pagingEl=null;
						spacerEl=null;
					}
					if (this["vertical"]) {
						this.pagingDiv.style.height = (this.childrenCount) * 50
								+ "px";
						this.pagingDiv.style.width = "25px";
					} else {
						this.pagingDiv.style.width = (this.childrenCount) * 50
								+ "px";
						this.pagingDiv.style.height = "25px";
					}
				}

				el.addEventListener('touchmove', function(e) {
					that.touchMove(e);
				}, false);
				el.addEventListener('touchend', function(e) {
					that.touchEnd(e);
				}, false);
			/*	el.addEventListener('touchstart', function(e) {
					that.touchStart(e);
				}, false);*/
				this.el = el;
			} catch (e) {
				console.log("error adding carousel " + e);
			}
		};

		carousel.prototype = {
			startX : 0,
			startY : 0,
			dx : 0,
			dy : 0,
			currentIndex : 0,
			myDivWidth : 0,
			myDivHeight : 0,
			cssMoveStart : 0,
			childrenCount : 0,
			thisCarouselIndex : 0,
			vertical : false,
			horizontal : true,
			el : null,
			movingElement : false,
			container : null,
			pagingDiv : null,
			pagingCssName : "carousel_paging",
			pagingCssNameSelected : "carousel_paging_selected",
			// handle the moving function

			touchStart : function(e) {
				if (event.touches[0].target
							&& event.touches[0].target.type != undefined) {
						var tagname = event.touches[0].target.tagName.toLowerCase();
						if (tagname == "select" || tagname == "input"
								|| tagname == "button") // stuff we need to allow
							// access to
							return;
					}
				if (e.touches.length == 1) {

					this.movingElement = true;
					e.preventDefault();
					e.stopPropagation();
					if (this["vertical"]) {
						this.startY = e.touches[0].pageY;
						try{
						this.cssMoveStart = numOnly(new WebKitCSSMatrix(window
								.getComputedStyle(this.el, null).webkitTransform).f);
						}
						catch(ex1){this.cssMoveStart=0;}
					} else {
						this.startX = e.touches[0].pageX;
						try{
						this.cssMoveStart = numOnly(new WebKitCSSMatrix(window
								.getComputedStyle(this.el, null).webkitTransform).e);
						}
						catch(ex1){this.cssMoveStart=0;}
					}
				}
			},

			touchEnd : function(e) {
				if (!this.movingElement) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				try {
					var endPos = this["vertical"] ? numOnly(new WebKitCSSMatrix(window
							.getComputedStyle(this.el, null).webkitTransform).f)
							: numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el,
									null).webkitTransform).e);
					if (endPos > 0) {
						this.moveCSS3(this.el, {
							x : 0,
							y : 0
						}, "300");
					} else {
						var totalMoved = this["vertical"] ? ((this.dy % this.myDivHeight)
								/ this.myDivHeight * 100)
								* -1
								: ((this.dx % this.myDivWidth) / this.myDivWidth * 100)
										* -1; // get a percentage of movement.
						// Only need
						// to drag 30% to trigger an event
						var currInd = this.thisCarouselIndex;
						if (endPos < this.cssMoveStart && totalMoved > 30) {
							currInd++; // move right/down
						} else if ((endPos > this.cssMoveStart && totalMoved < 70)) {
							currInd--; // move left/up
						}
						if (currInd > (this.childrenCount - 1))
							currInd = this.childrenCount - 1;
						if (currInd < 0)
							currInd = 0;
						var movePos = {
							x : 0,
							y : 0
						};
						if (this["vertical"])
							movePos.y = (currInd * this.myDivHeight * -1);
						else
							movePos.x = (currInd * this.myDivWidth * -1);

						this.moveCSS3(this.el, movePos, "300");

						if (this.pagingDiv && this.carouselIndex != currInd) {
							document.getElementById(this.container.id + "_"
									+ this.thisCarouselIndex).className = this.pagingCssName;
							document.getElementById(this.container.id + "_"
									+ currInd).className = this.pagingCssNameSelected;
						}
						this.thisCarouselIndex = currInd;
					}
				} catch (e) {
					console.log(e);
				}
				this.dx = 0;
				this.movingElement = false;
				this.startX = 0;
				this.dy = 0;
				this.startY = 0;
			},

			touchMove : function(e) {

				if (!this.movingElement)
					this.touchStart(e);
				e.preventDefault();
				e.stopPropagation();
				if (e.touches.length > 1) {
					this.dx = 0;
					this.movingElement = false;
					this.startX = 0;
					this.dy = 0;
					this.startY = 0;
				}
				var movePos = {
					x : 0,
					y : 0
				};
				if (this["vertical"]) {
					this.dy = e.touches[0].pageY - this.startY;
					this.dy += this.cssMoveStart;
					movePos.y = this.dy;
				} else {
					this.dx = e.touches[0].pageX - this.startX;
					this.dx += this.cssMoveStart;
					movePos.x = this.dx;
				}

				var totalMoved = this["vertical"] ? ((this.dy % this.myDivHeight)
						/ this.myDivHeight * 100)
						* -1
						: ((this.dx % this.myDivWidth) / this.myDivWidth * 100)
								* -1; // get a percentage of movement.

				this.moveCSS3(this.el, movePos);
			},

			onMoveIndex : function OnMoveIndex(newInd) {
				try {
					document.getElementById(this.container.id + "_"
							+ this.thisCarouselIndex).className = this.pagingCssName;
					var ind = newInd;
					if (ind < 0)
						ind = 0;
					if (ind > this.childrenCount - 1)
						ind = this.childrenCount - 1;
					var movePos = {
						x : 0,
						y : 0
					};
					if (this["vertical"])
						movePos.y = (ind * this.myDivHeight * -1);
					else
						movePos.x = (ind * this.myDivWidth * -1);
					this.moveCSS3(this.el, movePos, "300");
					this.thisCarouselIndex = ind;
					if (this.pagingDiv) {
						document.getElementById(this.container.id + "_"
								+ this.thisCarouselIndex).className = this.pagingCssNameSelected;
					}
				} catch (e) {
					console.log("Error " + e);
				}
			},

			moveCSS3 : function(el, distanceToMove, time, timingFunction) {
				if (!time)
					time = 0;
				else
					time = parseInt(time);
				if (!timingFunction)
					timingFunction = "linear";

				el.style.webkitTransform = "translate" + translateOpen
						+ distanceToMove.x + "px," + distanceToMove.y + "px"
						+ translateClose;
				el.style.webkitTransitionDuration = time + "ms";
				el.style.webkitBackfaceVisiblity = "hidden";
				el.style.webkitTransformStyle = "preserve-3d";
				el.style.webkitTransitionTimingFunction = timingFunction;
			}

		};
		return carousel;
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