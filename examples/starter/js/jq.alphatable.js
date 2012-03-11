/**
 * $.alphaTable - a list table for jqMobi apps
 * 
 * @copyright AppMobi 2011 - AppMobi
 * 
 */ (function ($) {
    $.fn["alphatable"] = function (scroller, opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new alphaTable(this[i], scroller, opts);

        }
        return this.length == 1 ? tmp : this;
    };

    var alphaTable = (function () {
        if (!window.WebKitCSSMatrix) return;
        var translateOpen = 'm11' in new WebKitCSSMatrix() ? "3d(" : "(";
        var translateClose = 'm11' in new WebKitCSSMatrix() ? ",0)" : ")";
        var alphaTable = function (el, scroller, opts) {

                if (typeof el == "string") el = document.getElementById(el);
                this.container = el.parentNode;
                if (!this.container) {
                    alert("Error finding container for alphaTable " + el);
                    return;
                }
                if (this instanceof alphaTable) {
                    for (j in opts) {
                        this[j] = opts[j];
                    }
                } else {
                    return new alphaTable(el, scroller, opts);
                }
                if (!scroller || typeof (scroller) != "object") {
                    return alert("Error: Please include an jq.web.scroll object to use this");
                }
                this.scroller = scroller;

                this.el = el;
                this.setupIndex();
                this.setupLetterBox();
            };

        alphaTable.prototype = {
            listCssClass: "",
            letterBox: null,
            isMoving: false,
            prefix: "",
            scrollToLetter: function (letter) {
                var el = document.getElementById(this.prefix + letter);
                if (el) {
                    var yPos = -el.offsetTop;
                    this.scroller.scrollTo({
                        x: 0,
                        y: yPos
                    });
                }
            },
            setupIndex: function () {
                var arrAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
                var that = this;
                var containerDiv = document.createElement("div");
                containerDiv.id = "indexDIV_" + this.el.id;
                containerDiv.style.cssText = "position:absolute;top:0px;right:20px;width:20px;font-size:6pt;font-weight:bold;color:#000;opacity:.5;border-radius:5px;text-align:center;z-index:9999;border:1px solid black;background:#666;padding-top:5px;padding-bottom:5px;";
                containerDiv.className = this.listCssClass;                
                containerDiv.addEventListener("touchend", function (event) {
                    that.isMoving = false;
                    that.clearLetterBox()
                }, false);
                //To allow updating as we "scroll" with our finger, we need to capture the position on the containerDiv element and calculate the Y coordinates.
                //On mobile devices, you can not do an "onmouseover" over multiple items and trigger events.
                containerDiv.addEventListener("touchstart", function (event) {
                    if(event.touches[0].target==this) return;
                    that.isMoving = true;
                    
                    var letter = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    if(!letter||!letter.getAttribute("alphatable-item")||letter.getAttribute("alphatable-item").length==0)
                       return;
                    that.showLetter(letter.innerHTML);
                    that.scrollToLetter(letter.innerHTML);
                    event.preventDefault();
                }, false);
                containerDiv.addEventListener("touchmove", function (event) {
                    var letter = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                    if(!letter||!letter.getAttribute("alphatable-item")||letter.getAttribute("alphatable-item").length==0)
                       return;
                    if (!that.isMoving) return;
                    that.showLetter(letter.innerHTML);
                    that.scrollToLetter(letter.innerHTML);
                    event.preventDefault();
                }, false);

                //Create the alphabet
                for (i = 0; i < arrAlphabet.length; i++) {
                    var tmpDiv = document.createElement("div");
                    tmpDiv.innerHTML = arrAlphabet[i];
                    tmpDiv.setAttribute("alphatable-item","true");
                    containerDiv.appendChild(tmpDiv);
                }
                this.container.appendChild(containerDiv);

                var clientHeight = numOnly(containerDiv.clientHeight) - numOnly(containerDiv.style.top) - numOnly(containerDiv.style.paddingTop);
                this.scroller.scrollTo({
                    x: 0,
                    y: 0
                }); //There's a bug with webkit and css3.  The letterbox would not show until -webkit-transform as applied.
                containerDiv = null;

            },
            showLetter: function (letter) {
                var that = this;
                this.letterBox.style.display = "block";
                if (this.letterBox.innerHTML != letter) {
                    that.letterBox.innerHTML = letter
                }

            },
            clearLetterBox: function () {
                this.letterBox.style.display = "none";
                this.letterBox.innerHTML = "";
            },
            setupLetterBox: function () {
                var div = document.createElement("div");
                div.style.cssText = "-webkit-transform:translate3d(0,0,0);display:none;position:absolute;top:35%;left:35%;height:2em;width:15%;line-height:2em;text-align:center;font-size:2em;color:blue;background:#666;z-index:999999;border:1px solid black;border-raidus:10px;";
                div.className = this.letterBoxCssClass;
                div.innerHTML = "";
                this.letterBox = div;
                this.container.appendChild(div);
                div = null;

            }
        };
        return alphaTable;
    })();
})(jq);