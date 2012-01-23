/**
 * $.alphaTable - a list table for jQ.Mobi apps
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
                containerDiv.style.cssText = "position:absolute;top:10px;left:290px;width:20px;font-size:8pt;font-weight:bold;color:#000;opacity:.5;border-radius:5px;text-align:center;z-index:9999;border:1px solid black;background:#666;padding-top:5px;padding-bottom:5px;";
                containerDiv.className = this.listCssClass;
                setCssProperties(containerDiv);
                containerDiv.addEventListener("touchend", function (event) {
                    that.isMoving = false;
                    that.clearLetterBox()
                }, false);
                //To allow updating as we "scroll" with our finger, we need to capture the position on the containerDiv element and calculate the Y coordinates.
                //On mobile devices, you can not do an "onmouseover" over multiple items and trigger events.
                containerDiv.addEventListener("touchstart", function (event) {

                    that.isMoving = true;
                    var pos = (event.touches[0].clientY - offset.y) / clientHeight;

                    var letter = Math.ceil(pos * 26) - 1;
                    if (letter < 0) letter = 0;
                    else if (letter > 25) letter = 25;
                    that.showLetter(arrAlphabet[letter]);
                    that.scrollToLetter(arrAlphabet[letter]);
                }, false);
                containerDiv.addEventListener("touchmove", function (event) {
                    if (!that.isMoving) return;
                    var pos = (event.touches[0].clientY - offset.y) / clientHeight;
                    var letter = Math.ceil(pos * 26) - 1;
                    if (letter < 0) letter = 0;
                    else if (letter > 25) letter = 25;
                    that.showLetter(arrAlphabet[letter]);
                    that.scrollToLetter(arrAlphabet[letter]);
                }, false);

                //Create the alphabet
                for (i = 0; i < arrAlphabet.length; i++) {
                    var tmpDiv = document.createElement("div");
                    tmpDiv.innerHTML = arrAlphabet[i];
                    containerDiv.appendChild(tmpDiv);
                }
                this.container.appendChild(containerDiv);

                var offset = findPos(containerDiv); //Need to calculate the offset so we can use the event.touches[0].clientY position to calculate the letter being pressed
                offset.y += numOnly(containerDiv.style.top)

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
                div.style.cssText = "-webkit-transform:translate3d(0,0,0);display:none;position:absolute;top:35%;left:35%;height:15%;width:15%;text-align:center;font-size:150%;color:blue;background:#666;z-index:999999;border:1px solid black;border-raidus:10px;";
                div.className = this.letterBoxCssClass;
                div.innerHTML = "";
                this.letterBox = div;
                this.container.appendChild(div);
                div = null;

            }
        };
        return alphaTable;
    })();

    // Helper function to get only
    if (!window.numOnly) {
        function numOnly(val) {
            if (isNaN(parseFloat(val))) val = val.replace(/[^0-9.-]/, "");
            if (val.length == 0) val = 0;
            return parseFloat(val);
        }
    }
    if (!window.findPos) {
        function findPos(obj) {
            var curleft = curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
            }
            return {
                x: curleft,
                y: curtop
            };
        }
    }
    /*
     * Function to get the css class texts into an array.  Users can specify the CSS class for the alphabet selection, but we need the properties set so JavaScript can access them.
     * Does not work wtih nested items, or items based off an id.
     */
    var cssClassess = {};
    (function () {

        for (var j = 0; j < document.styleSheets.length; j++) {
            var rules = document.styleSheets.item(j).cssRules;
            for (var i = 0; i < rules.length; i++) {
                var name = rules.item(i).selectorText;
                var text = rules.item(i).cssText.replace(name, "").replace("{", "").replace("}", "");
                if (name == undefined || (!name.length || name.length == 0)) continue;
                var names = name.split(",");
                var k = 0;
                do {
                    if (names[k].indexOf(".") == 0) names[k] = names[k].substr(1);
                    if (names[k].indexOf("#") == 0) names[k] = names[k].substr(1);
                    cssClassess[names[k]] = text;
                    k++;
                } while (names[k]);
            }
        }
    })();


    function setCssProperties(object) {
        if (cssClassess[object.className]) object.style.cssText = cssClassess[object.className];
    }
})(jq);