/**
 * copyright: 2011 Intel
 * description:  This script will replace all drop downs with friendly select controls.  Users can still interact
 * with the old drop down box as normal with javascript, and this will be reflected
 */

 /* global af*/
 /* global numOnly*/
(function($) {
    /*jshint camelcase: false,
    validthis:true
    */
    "use strict";
    function updateOption(prop, oldValue, newValue) {
        if (newValue === true) {
            if (!this.getAttribute("multiple"))
                $.selectBox.updateMaskValue(this.parentNode.id, this.text, this.value);
            this.parentNode.value = this.value;
        }
        return newValue;
    }

    function updateIndex(prop, oldValue, newValue) {
        if (this.options[newValue]) {
            if (!this.getAttribute("multiple"))
                $.selectBox.updateMaskValue(this.linker, this.options[newValue].value, this.options[newValue].text);
            this.value = this.options[newValue].value;
        }
        return newValue;
    }

    function destroy(e) {
        var el = e.target;
        $(el.linker).remove();
        delete el.linker;
        e.stopPropagation();
    }
    $.selectBox = {
        scroller: null,
        currLinker: null,
        getOldSelects: function(elID) {
            if (!$.os.android || $.os.androidICS) return;
            if (!$.fn.scroller) {
                window.alert("This library requires af.scroller");
                return;
            }
            var container = elID && document.getElementById(elID) ? document.getElementById(elID) : document;
            if (!container) {
                window.alert("Could not find container element for af.selectBox " + elID);
                return;
            }
            var sels = container.getElementsByTagName("select");
            var that = this;
            for (var i = 0; i < sels.length; i++) {

                var el = sels[i];
                el.style.display = "none";
                var fixer = $.create("div", {
                    className: "afFakeSelect"
                });
                fixer.get(0).linker = sels[i];
                el.linker = fixer.get(0);
                fixer.insertAfter(sels[i]);

                el.watch("selectedIndex", updateIndex);
                for (var j = 0; j < el.options.length; j++) {
                    el.options[j].watch("selected", updateOption);
                    if (el.options[j].selected)
                        fixer.html(el.options[j].text);
                }
                $(el).one("destroy", destroy);
            }
            that.createHtml();
        },
        updateDropdown: function(el) {
            if (!el) return;
            for (var j = 0; j < el.options.length; j++) {
                if (el.options[j].selected) el.linker.innerHTML = el.options[j].text;
            }
            el = null;
        },
        initDropDown: function(el) {

            if (el.disabled) return;
            if (!el || !el.options || el.options.length === 0) return;
            var foundInd = 0;
            var $scr = $("#afSelectBoxfix");
            $scr.html("<ul></ul>");
            var $list = $scr.find("ul");
            for (var j = 0; j < el.options.length; j++) {
                el.options[j].watch("selected", updateOption);
                var checked = (el.options[j].selected) ? "selected" : "";
                if (checked) foundInd = j + 1;
                var row = $.create("li", {
                    html: el.options[j].text,
                    className: checked
                });
                row.data("ind", j);
                $list.append(row);
            }
            $("#afModalMask").show();
            try {
                if (foundInd > 0 && el.getAttribute("multiple") !== "multiple") {
                    var scrollToPos = 0;
                    var scrollThreshold = numOnly($list.find("li").computedStyle("height"));
                    var theHeight = numOnly($("#afSelectBoxContainer").computedStyle("height"));
                    if (foundInd * scrollThreshold >= theHeight) scrollToPos = (foundInd - 1) * -scrollThreshold;
                    this.scroller.scrollTo({
                        x: 0,
                        y: scrollToPos
                    });
                }
            } catch (e) {
                console.log("error init dropdown" + e);
            }

            var selClose = $("#afSelectClose").css("display") === "block" ? numOnly($("#afSelectClose").height()) : 0;
            $("#afSelectWrapper").height((numOnly($("#afSelectBoxContainer").height()) - selClose) + "px");

        },
        updateMaskValue: function(linker, value, val2) {

            $(linker).html(val2);
        },
        setDropDownValue: function(el, value) {

            if (!el) return;
            var $el = $(el);

            value = parseInt(value, 10);
            if(isNaN(value)) return;
            if (!el.getAttribute("multiple")) {
                el.selectedIndex = value;
                $el.find("option").prop("selected", false);
                $el.find("option:nth-child(" + (value + 1) + ")").prop("selected", true);
                this.scroller.scrollTo({
                    x: 0,
                    y: 0
                });
                this.hideDropDown();
            } else {
                //multi select

                // var myEl = $el.find("option:nth-child(" + (value + 1) + ")").get(0);
                var myList = $("#afSelectBoxfix li:nth-child(" + (value + 1) + ")");
                if (myList.hasClass("selected")) {
                    myList.removeClass("selected");
                    //  myEl.selected = false;
                } else {
                    myList.addClass("selected");
                    //  myEl.selected = true;
                }
            }
            $(el).trigger("change");
            el = null;
        },
        hideDropDown: function() {
            $("#afModalMask").hide();
            $("#afSelectBoxfix").html("");
        },
        createHtml: function() {
            var that = this;
            if (document.getElementById("afSelectBoxfix")) {
                return;
            }
            $(document).ready(function() {
                $(document).on("click", ".afFakeSelect", function() {
                    if (this.linker.disabled)
                        return;
                    that.currLinker = this;

                    if (this.linker.getAttribute("multiple") === "multiple")
                        $("#afSelectClose").show();
                    else
                        $("#afSelectClose").hide();
                    that.initDropDown(this.linker);

                });
                var container = $.create("div", {
                    id: "afSelectBoxContainer"
                });
                var modalDiv = $.create("div", {
                    id: "afSelectBoxfix"
                });
                var modalWrapper = $.create("div", {
                    id: "afSelectWrapper"
                });
                modalWrapper.css("position", "relative");
                modalWrapper.append(modalDiv);
                var closeDiv = $.create("div", {
                    id: "afSelectClose",
                    html: "<a id='afSelectDone'>Done</a> <a id='afSelectCancel'>Cancel</a>"
                });

                var modalMask = $.create("div", {
                    id:"afModalMask"
                });

                var $afui = $("#afui");
                container.prepend(closeDiv).append(modalWrapper);
                modalMask.append(container);
                if ($afui.length > 0) $afui.append(modalMask);
                else document.body.appendChild(modalMask.get(0));
                that.scroller = $.query("#afSelectBoxfix").scroller({
                    scroller: false,
                    verticalScroll: true,
                    vScrollCSS: "afselectscrollBarV",
                    hasParent:true
                });

                $("#afModalMask").on("click",function(e){
                    var $e=$(e.target);
                    if($e.closest("#afSelectBoxContainer").length === 0)
                        that.hideDropDown();
                });

                $("#afSelectBoxfix").on("click", "li", function(e) {
                    var $el = $(e.target);
                    that.setDropDownValue(that.currLinker.linker, $el.data("ind"));
                });
                $("#afSelectBoxContainer").on("click", "a", function(e) {
                    if (e.target.id === "afSelectCancel")
                        return that.hideDropDown();
                    var $sel = $(that.currLinker.linker);
                    $sel.find("option").prop("selected", false);

                    $("#afSelectBoxfix li").each(function() {
                        var $el = $(this);
                        if ($el.hasClass("selected")) {
                            var ind = parseInt($el.data("ind"), 10);
                            $sel.find("option:nth-child(" + (ind + 1) + ")").prop("selected", true);
                            that.currLinker.innerHTML = $el.html();
                        }
                    });

                    that.hideDropDown();
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });

            });
        }
    };

    //The following is based off Eli Grey's shim
    //https://gist.github.com/384583
    //We use HTMLElement to not cause problems with other objects
    if (!HTMLElement.prototype.watch) {
        HTMLElement.prototype.watch = function(prop, handler) {
            var oldval = this[prop],
                newval = oldval,
                getter = function() {
                    return newval;
                },
                setter = function(val) {
                    oldval = newval;
                    newval = handler.call(this, prop, oldval, val);
                    return newval;
                };
            if (delete this[prop]) { // can't watch constants
                if (HTMLElement.defineProperty) { // ECMAScript 5
                    HTMLElement.defineProperty(this, prop, {
                        get: getter,
                        set: setter,
                        enumerable: false,
                        configurable: true
                    });
                } else if (HTMLElement.prototype.__defineGetter__ && HTMLElement.prototype.__defineSetter__) { // legacy
                    HTMLElement.prototype.__defineGetter__.call(this, prop, getter);
                    HTMLElement.prototype.__defineSetter__.call(this, prop, setter);
                }
            }
        };
    }
    if (!HTMLElement.prototype.unwatch) {
        HTMLElement.prototype.unwatch = function(prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        };
    }
})(af);
