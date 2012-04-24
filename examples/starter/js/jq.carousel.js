/**
 * jq.web.carousel - a carousel library for html5 mobile apps
 * @copyright AppMobi 2011 - AppMobi
 * 
 */
(function($) {
    var cache = [];
    $.fn.carousel = function(opts) {
        if (opts === undefined && this.length > 0) 
        {
            return cache[this[0].id] ? cache[this[0].id] : null;
        }
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new carousel(this[i], opts);
            if (this[i].id)
                cache[this[i].id] = tmp;
        }
        return this.length === 1 ? tmp : this;
    };
    
    var carousel = (function() {
        if (!window.WebKitCSSMatrix) {
            return;
        }
        var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
        var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";
        
        var carousel = function(containerEl, opts) {
            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                alert("Error finding container for carousel " + containerEl);
                return;
            }
            if (this instanceof carousel) {
                for (var j in opts) {
                    if (opts.hasOwnProperty(j)) {
                        this[j] = opts[j];
                    }
                }
            } else {
                
                return new carousel(containerEl, opts);
            }
            try {
                var that = this;
                this.pagingDiv = this.pagingDiv ? document.getElementById(this.pagingDiv) : null;


                // initial setup
                this.container.style.overflow = "hidden";
                this.container.style['-webkit-box-orient'] = "vertical";
                this.container.style['display'] = "-webkit-box";
                this.container.style['-webkit-box-orient'] = "vertical";
                if (this.vertical) {
                    this.horizontal = false;
                }
                var tmpHTML = this.container.innerHTML;
                this.container.innerHTML = "";
                var el = document.createElement("div");
                el.innerHTML = tmpHTML;
                if (this.horizontal) {
                    el.style.display = "-webkit-box";
                    el.style['-webkit-box-flex'] = 1;
                } 
                else {
                    el.style.display = "block";
                }
                this.container.appendChild(el);
                this.el = el;
                this.refreshItems();
                el.addEventListener('touchmove', function(e) {
                    that.touchMove(e);
                }, false);
                el.addEventListener('touchend', function(e) {
                    that.touchEnd(e);
                }, false);
                el.addEventListener('touchstart', function(e) {
                    that.touchStart(e);
                }, false);
                var that = this;
                window.addEventListener("orientationchange", function() {
                    that.onMoveIndex(that.carouselIndex,0);
                }, false);
            
            } catch (e) {
                console.log("error adding carousel " + e);
            }
        };
        
        carousel.prototype = {
            startX: 0,
            startY: 0,
            dx: 0,
            dy: 0,
            myDivWidth: 0,
            myDivHeight: 0,
            cssMoveStart: 0,
            childrenCount: 0,
            carouselIndex: 0,
            vertical: false,
            horizontal: true,
            el: null,
            movingElement: false,
            container: null,
            pagingDiv: null,
            pagingCssName: "carousel_paging",
            pagingCssNameSelected: "carousel_paging_selected",
            pagingFunction: null,
            lockMove:false,
            // handle the moving function
            touchStart: function(e) {
                this.myDivWidth = numOnly(this.container.clientWidth);
                this.myDivHeight = numOnly(this.container.clientHeight);
                this.lockMove=false;
                if (event.touches[0].target && event.touches[0].target.type !== undefined) {
                    var tagname = event.touches[0].target.tagName.toLowerCase();
                    if (tagname === "select" || tagname === "input" || tagname === "button")  // stuff we need to allow
                    {
                        return;
                    }
                }
                if (e.touches.length === 1) {
                    
                    this.movingElement = true;
                    this.startY = e.touches[0].pageY;
                    this.startX = e.touches[0].pageX;
                    //e.preventDefault();
                    //e.stopPropagation();
                    if (this.vertical) {
                        try {
                            this.cssMoveStart = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el, null).webkitTransform).f);
                        } catch (ex1) {
                            this.cssMoveStart = 0;
                        }
                    } else {
                        try {
                            this.cssMoveStart = numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el, null).webkitTransform).e);
                        } catch (ex1) {
                            this.cssMoveStart = 0;
                        }
                    }
                }
            },
            touchMove: function(e) {
                // e.preventDefault();
                // e.stopPropagation();
                if(!this.movingElement)
                   return;
                if (e.touches.length > 1) {
                    return this.touchEnd(e);
                }
                
                var rawDelta = {
                    x: e.touches[0].pageX - this.startX,
                    y: e.touches[0].pageY - this.startY
                };
                
                if (this.vertical) {
                    var movePos = { x: 0, y: 0 };
                    this.dy = e.touches[0].pageY - this.startY;
                    this.dy += this.cssMoveStart;
                    movePos.y = this.dy;
                    e.preventDefault();
                        e.stopPropagation();
                } else {
                    if (!this.lockMove&&isHorizontalSwipe(rawDelta.x, rawDelta.y)) {
                         
                        var movePos = {x: 0,y: 0};
                        this.dx = e.touches[0].pageX - this.startX;
                        this.dx += this.cssMoveStart;
                        e.preventDefault();
                        e.stopPropagation();
                        movePos.x = this.dx;
                    }
                    else
                       return this.lockMove=true;
                }
                
                var totalMoved = this.vertical ? ((this.dy % this.myDivHeight) / this.myDivHeight * 100) * -1 : ((this.dx % this.myDivWidth) / this.myDivWidth * 100) * -1; // get a percentage of movement.
                if(movePos)
                    this.moveCSS3(this.el, movePos);
            },
            touchEnd: function(e) {
                if (!this.movingElement) {
                    return;
                }
                // e.preventDefault();
                // e.stopPropagation();
                var runFinal = false;
                try {
                    var endPos = this.vertical ? numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el, null).webkitTransform).f) : numOnly(new WebKitCSSMatrix(window.getComputedStyle(this.el, null).webkitTransform).e);
                    if (endPos > 0) {
                        this.moveCSS3(this.el, {
                            x: 0,
                            y: 0
                        }, "300");
                    } else {
                        var totalMoved = this.vertical ? ((this.dy % this.myDivHeight) / this.myDivHeight * 100) * -1 : ((this.dx % this.myDivWidth) / this.myDivWidth * 100) * -1; // get a percentage of movement.
                        // Only need
                        // to drag 3% to trigger an event
                        var currInd = this.carouselIndex;
                        if (endPos < this.cssMoveStart && totalMoved > 3) {
                            currInd++; // move right/down
                        } else if ((endPos > this.cssMoveStart && totalMoved < 97)) {
                            currInd--; // move left/up
                        }
                        if (currInd > (this.childrenCount - 1)) {
                            currInd = this.childrenCount - 1;
                        }
                        if (currInd < 0) {
                            currInd = 0;
                        }
                        var movePos = {
                            x: 0,
                            y: 0
                        };
                        if (this.vertical) {
                            movePos.y = (currInd * this.myDivHeight * -1);
                        } 
                        else {
                            movePos.x = (currInd * this.myDivWidth * -1);
                        }
                        
                        this.moveCSS3(this.el, movePos, "150");
                        
                        if (this.pagingDiv && this.carouselIndex !== currInd) {
                            document.getElementById(this.container.id + "_" + this.carouselIndex).className = this.pagingCssName;
                            document.getElementById(this.container.id + "_" + currInd).className = this.pagingCssNameSelected;
                        }
                        if (this.carouselIndex != currInd)
                            runFinal = true;
                        this.carouselIndex = currInd;
                    }
                } catch (e) {
                    console.log(e);
                }
                this.dx = 0;
                this.movingElement = false;
                this.startX = 0;
                this.dy = 0;
                this.startY = 0;
                if (runFinal && this.pagingFunction && typeof this.pagingFunction == "function")
                    this.pagingFunction(this.carouselIndex);
            },
            onMoveIndex: function(newInd,transitionTime) {
                
                this.myDivWidth = numOnly(this.container.clientWidth);
                this.myDivHeight = numOnly(this.container.clientHeight);
                var runFinal = false;
                try {
                    
                    document.getElementById(this.container.id + "_" + this.carouselIndex).className = this.pagingCssName;
                    var newTime = Math.abs(newInd - this.carouselIndex);
                    
                    var ind = newInd;
                    if (ind < 0)
                        ind = 0;
                    if (ind > this.childrenCount - 1) {
                        ind = this.childrenCount - 1;
                    }
                    var movePos = {
                        x: 0,
                        y: 0
                    };
                    if (this.vertical) {
                        movePos.y = (ind * this.myDivHeight * -1);
                    } 
                    else {
                        movePos.x = (ind * this.myDivWidth * -1);
                    }
                    
                    var time =transitionTime?transitionTime: 50 + parseInt((newTime * 20));
                    this.moveCSS3(this.el, movePos, time);
                    if (this.carouselIndex != ind)
                        runFinal = true;
                    this.carouselIndex = ind;
                    if (this.pagingDiv) {
                        
                        document.getElementById(this.container.id + "_" + this.carouselIndex).className = this.pagingCssNameSelected;
                    }
                } catch (e) {
                    console.log("Error " + e);
                }
                if (runFinal && this.pagingFunction && typeof this.pagingFunction == "function")
                    this.pagingFunction(currInd);
            },
            
            moveCSS3: function(el, distanceToMove, time, timingFunction) {
                if (!time)
                    time = 0;
                else
                    time = parseInt(time);
                if (!timingFunction)
                    timingFunction = "linear";
                
                el.style.webkitTransform = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
                el.style.webkitTransitionDuration = time + "ms";
                el.style.webkitBackfaceVisiblity = "hidden";
                el.style.webkitTransformStyle = "preserve-3d";
                el.style.webkitTransitionTimingFunction = timingFunction;
            },
            
            addItem: function(el) {
                if (el && el.nodeType) {
                    
                    this.container.childNodes[0].appendChild(el);
                    this.refreshItems();
                }
            },
            refreshItems: function() {
                var childrenCounter = 0;
                var that = this;
                var el = this.el;
                n = el.childNodes[0];
                var widthParam;
                var heightParam = "100%";
                var elems = [];
                for (; n; n = n.nextSibling) {
                    if (n.nodeType === 1) {
                        elems.push(n);
                        childrenCounter++;
                    }
                }
                var param = (100 / childrenCounter) + "%";
                this.childrenCount = childrenCounter;
                widthParam = parseFloat(100 / this.childrenCount) + "%";
                for (var i = 0; i < elems.length; i++) {
                    if (this.horizontal) {
                        elems[i].style.width = widthParam;
                        elems[i].style.height = "100%";
                    } 
                    else {
                        elems[i].style.height = widthParam;
                        elems[i].style.width = "100%";
                        elems[i].style.display = "block";
                    }
                }
                this.moveCSS3(el, {
                    x: 0,
                    y: 0
                });
                if (this.horizontal) {
                    el.style.width = Math.ceil((this.childrenCount) * 100) + "%";
                    el.style.height = "100%";
                    el.style['min-height'] = "100%"
                } 
                else {
                    el.style.width = "100%";
                    el.style.height = Math.ceil((this.childrenCount) * 100) + "%";
                    el.style['min-height'] = Math.ceil((this.childrenCount) * 100) + "%";
                }
                // Create the paging dots
                if (this.pagingDiv) {
                    this.pagingDiv.innerHTML = ""
                    for (i = 0; i < this.childrenCount; i++) {
                        
                        var pagingEl = document.createElement("div");
                        pagingEl.id = this.container.id + "_" + i;
                        pagingEl.pageId = i;
                        if (i !== 0) {
                            pagingEl.className = this.pagingCssName;
                        } 
                        else {
                            pagingEl.className = this.pagingCssNameSelected;
                        }
                        pagingEl.onclick = function() {
                            that.onMoveIndex(this.pageId);
                        };
                        var spacerEl = document.createElement("div");
                     
                        spacerEl.style.width = "20px";
                        if(this.horizontal){
                            spacerEl.style.cssFloat = "left";
                            spacerEl.innerHTML = "&nbsp;";
                        }
                        else{
                           spacerEl.innerHTML="&nbsp;";
                           spacerEl.style.display="block";
                        }
                        
                        this.pagingDiv.appendChild(pagingEl);
                        if (i + 1 < (this.childrenCount))
                            this.pagingDiv.appendChild(spacerEl);
                        pagingEl = null;
                        spacerEl = null;
                    }
                    this.pagingDiv.style.width = (this.childrenCount) * 50 + "px";
                    this.pagingDiv.style.height = "25px";
                }
                this.onMoveIndex(this.carouselIndex);
            
            }
        
        };
        return carousel;
    })();
    
    function isHorizontalSwipe(xAxis, yAxis) {
                var X = xAxis;
                var Y = yAxis;
                var Z = Math.round(Math.sqrt(Math.pow(X,2)+Math.pow(Y,2))); //the distance - rounded - in pixels
                var r = Math.atan2(Y,X); //angle in radians 
                var swipeAngle = Math.round(r*180/Math.PI); //angle in degrees
                if ( swipeAngle < 0 ) { swipeAngle =  360 - Math.abs(swipeAngle); } // for negative degree values
                if (((swipeAngle <= 215) && (swipeAngle >= 155)) || ((swipeAngle <= 45) && (swipeAngle >= 0)) || ((swipeAngle <= 360) && (swipeAngle >= 315))) // horizontal angles with threshold
                {return true; }
                else {return false}
    }
    
})(jq);