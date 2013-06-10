/**
 * jq.web.carousel - a carousel library for html5 mobile apps
 * @copyright 2011 - Intel
 *
 */
(function($) {
    var cache = [];
    var objId=function(obj){
        if(!obj.jqmCarouselId) obj.jqmCarouselId=$.uuid();
        return obj.jqmCarouselId;
    }
    $.fn.carousel = function(opts) {
        var tmp, id;
        for (var i = 0; i < this.length; i++) {
            //cache system
            id = objId(this[i]);
            if(!cache[id]){
                tmp = new carousel(this[i], opts);
                cache[id] = tmp;
            } else {
                tmp = cache[id];
            }
        }
        return this.length == 1 ? tmp : this;
    };

    var carousel = (function() {
        var translateOpen =$.feat.cssTransformStart;
        var translateClose = $.feat.cssTransformEnd;

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


                var that = this;
                jq(this.container).bind('destroy', function(e){
                    var id = that.container.jqmCarouselId;
                    //window event need to be cleaned up manually, remaining binds are automatically killed in the dom cleanup process
                   window.removeEventListener("orientationchange", that.orientationHandler, false);
                   if(cache[id]) delete cache[id];
                   e.stopPropagation();
                });

                this.pagingDiv = this.pagingDiv ? document.getElementById(this.pagingDiv) : null;


                // initial setup
                this.container.style.overflow = "hidden";
                if (this.vertical) {
                    this.horizontal = false;
                }

                var el = document.createElement("div");
                this.container.appendChild(el);
                var $el=$(el);
                var $container=$(this.container);
                var data = Array.prototype.slice.call(this.container.childNodes);
                while(data.length>0)
                {
                    var myEl=data.splice(0,1);
                    myEl=$container.find(myEl)
                    if(myEl.get()==el)
                       continue;
                    $el.append(myEl.get());
                }
                if (this.horizontal) {
                    el.style.display = "block";
                    el.style['float']="left";
                }
                else {
                    el.style.display = "block";
                }

                this.el = el;
                this.refreshItems();
                var jqEl = jq(el);
                jqEl.bind('touchmove', function(e) {that.touchMove(e);});
                jqEl.bind('touchend', function(e) {that.touchEnd(e);});
                jqEl.bind('touchstart', function(e) {that.touchStart(e);});
                this.orientationHandler = function() {that.onMoveIndex(that.carouselIndex,0);};
                window.addEventListener("orientationchange", this.orientationHandler, false);

        };

        carousel.prototype = {
            startX: 0,
            startY: 0,
            dx: 0,
            dy: 0,
            glue: false,
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
            okToMove: false,

            // handle the moving function
            touchStart: function(e) {
                this.okToMove = false;
                this.myDivWidth = numOnly(this.container.clientWidth);
                this.myDivHeight = numOnly(this.container.clientHeight);
                this.lockMove=false;
                if (e.touches[0].target && e.touches[0].target.type !== undefined) {
                    var tagname = e.touches[0].target.tagName.toLowerCase();
                    if (tagname === "select" || tagname === "input" || tagname === "button")  // stuff we need to allow
                    {
                        return;
                    }
                }
                if (e.touches.length === 1) {

                    this.movingElement = true;
                    this.startY = e.touches[0].pageY;
                    this.startX = e.touches[0].pageX;
                    var cssMatrix=$.getCssMatrix(this.el);

                    if (this.vertical) {
                        try {
                            this.cssMoveStart = numOnly(cssMatrix.f);
                        } catch (ex1) {
                            this.cssMoveStart = 0;
                        }
                    } else {
                        try {
                            this.cssMoveStart = numOnly(cssMatrix.e);
                        } catch (ex1) {
                            this.cssMoveStart = 0;
                        }
                    }
                }
            },
            touchMove: function(e) {
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
                    //e.stopPropagation();
                } else {
                    if ((!this.lockMove&&isHorizontalSwipe(rawDelta.x, rawDelta.y))||Math.abs(this.dx)>5) {
                        var movePos = {x: 0,y: 0};
                        this.dx = e.touches[0].pageX - this.startX;
                        this.dx += this.cssMoveStart;
                        e.preventDefault();
                      //  e.stopPropagation();
                        movePos.x = this.dx;
                    }
                    else
                       return this.lockMove=true;
                }

                var totalMoved = this.vertical ? ((this.dy % this.myDivHeight) / this.myDivHeight * 100) * -1 : ((this.dx % this.myDivWidth) / this.myDivWidth * 100) * -1; // get a percentage of movement.

                if (!this.okToMove) {
                    oldStateOkToMove= this.okToMove;
                    this.okToMove = this.glue ? Math.abs(totalMoved) > this.glue  && Math.abs(totalMoved) < (100 - this.glue) : true;
                    if (this.okToMove && !oldStateOkToMove) {
                    	$.trigger(this,"movestart",[this.el]);
                    }
                }

                if  (this.okToMove && movePos)
                   this.moveCSS3(this.el, movePos);

            },
            touchEnd: function(e) {
                if (!this.movingElement) {
                    return;
                }
                $.trigger(this,"movestop",[this.el]);
                // e.preventDefault();
                // e.stopPropagation();
                var runFinal = false;
                try {
                    var cssMatrix=$.getCssMatrix(this.el);
                    var endPos = this.vertical ? numOnly(cssMatrix.f) : numOnly(cssMatrix.e);

                    if (1==2&&endPos > 0) {
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
                        var toMove=currInd;
                        //Checks for infinite - moves to placeholders
                        if (currInd > (this.childrenCount - 1)) {
                            currInd = 0;
                            toMove=this.childrenCount;
                        }
                        if (currInd < 0) {
                            currInd = this.childrenCount-1;
                            toMove=-1;
                        }
                        var movePos = {
                            x: 0,
                            y: 0
                        };
                        if (this.vertical) {
                            movePos.y = (toMove * this.myDivHeight * -1);
                        }
                        else {
                            movePos.x = (toMove * this.myDivWidth * -1);
                        }

                        this.moveCSS3(this.el, movePos, "150");

                        if (this.pagingDiv && this.carouselIndex !== currInd) {
                            document.getElementById(this.container.id + "_" + this.carouselIndex).className = this.pagingCssName;
                            document.getElementById(this.container.id + "_" + currInd).className = this.pagingCssNameSelected;
                        }
                        if (this.carouselIndex != currInd)
                            runFinal = true;
                        this.carouselIndex = currInd;

                        //This is for the infinite ends - will move to the correct position after animation
                        if(toMove!=currInd){
                            var that=this;
                            window.setTimeout(function(){
                                that.onMoveIndex(currInd,"1ms");
                            },155);
                        }
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

                    if(document.getElementById(this.container.id + "_" + this.carouselIndex))
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
                        var tmpEl = document.getElementById(this.container.id + "_" + this.carouselIndex);
                        if(tmpEl) tmpEl.className = this.pagingCssNameSelected;
                    }

                if (runFinal && this.pagingFunction && typeof this.pagingFunction == "function")
                    this.pagingFunction(ind);
            },

            moveCSS3: function(el, distanceToMove, time, timingFunction) {
                if (!time)
                    time = 0;
                else
                    time = parseInt(time);
                if (!timingFunction)
                    timingFunction = "linear";
                el.style[$.feat.cssPrefix+"Transform"] = "translate" + translateOpen + distanceToMove.x + "px," + distanceToMove.y + "px" + translateClose;
                el.style[$.feat.cssPrefix+"TransitionDuration"] = time + "ms";
                el.style[$.feat.cssPrefix+"BackfaceVisibility"] = "hidden";
                el.style[$.feat.cssPrefix+"TransformStyle"] = "preserve-3d";
                el.style[$.feat.cssPrefix+"TransitionTimingFunction"] = timingFunction;
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
                $(el).find(".prevBuffer").remove();
                $(el).find(".nextBuffer").remove();
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
                //Let's put the buffers at the start/end

                var prep=$(elems[elems.length-1]).clone().get(0);
                prep.className="prevBuffer";
                $(el).prepend(prep);
                var tmp=$(elems[0]).clone().get(0);
                tmp.className="nextBuffer";
                $(el).append(tmp);
                elems.push(tmp);
                elems.unshift(prep);

                var param = (100 / childrenCounter) + "%";
                this.childrenCount = childrenCounter;
                widthParam = parseFloat(100 / childrenCounter) + "%";

                for (var i = 0; i < elems.length; i++) {
                    if (this.horizontal) {
                        elems[i].style.width = widthParam;
                        elems[i].style.height = "100%";
                        elems[i].style['float']="left";
                    }
                    else {
                        elems[i].style.height = widthParam;
                        elems[i].style.width = "100%";
                        elems[i].style.display = "block";
                    }
                }
                //Clone the first and put it at the end
                tmp.style.position="absolute";
                prep.style.position="absolute";

                this.moveCSS3(el, {
                    x: 0,
                    y: 0
                });
                if (this.horizontal) {
                    el.style.width = Math.ceil((this.childrenCount) * 100) + "%";
                    el.style.height = "100%";
                    el.style['min-height'] = "100%"
                    prep.style.left="-"+widthParam;
                    tmp.style.left="100%";
                }
                else {
                    el.style.width = "100%";
                    el.style.height = Math.ceil((this.childrenCount) * 100) + "%";
                    el.style['min-height'] = Math.ceil((this.childrenCount) * 100) + "%";
                    prep.style.top="-"+widthParam;
                    tmp.style.top="100%";
                }
                // Create the paging dots
                if (this.pagingDiv) {
                    this.pagingDiv.innerHTML = ""
                    for (i = 0; i < this.childrenCount; i++) {

                        var pagingEl = document.createElement("div");
                        pagingEl.id = this.container.id + "_" + i;
                        pagingEl.pageId = i;
                        if (i !== this.carouselIndex) {
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
                            spacerEl.style.display = "inline-block";
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
                    if(this.horizontal){
                        this.pagingDiv.style.width = (this.childrenCount) * 50 + "px";
                        this.pagingDiv.style.height = "25px";
                    }
                    else {
                        this.pagingDiv.style.height = (this.childrenCount) * 50 + "px";
                        this.pagingDiv.style.width = "25px";
                    }
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
