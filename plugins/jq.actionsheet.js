/**
 * jq.web.actionsheet - a actionsheet for html5 mobile apps
 * Copyright 2012 - AppMobi 
 */
(function($) {
    $.fn["actionsheet"] = function(opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new actionsheet(this[i], opts);
        }
        return this.length == 1 ? tmp : this;
    };
    var actionsheet = (function() {
        var actionsheet = function(elID, opts) {
            if (typeof elID == "string" || elID instanceof String) {
                this.el = document.getElementById(elID);
            } else {
                this.el = elID;
            }
            if (!this.el) {
                alert("Could not find element for actionsheet " + elID);
                return;
            }
            
            if (this instanceof actionsheet) {
                if(typeof(opts)=="object"){
                for (j in opts) {
                    this[j] = opts[j];
                }
                }
            } else {
                return new actionsheet(elID, opts);
            }
            
            try {
                var that = this;
                var markStart = '<div id="jq_actionsheet"><div style="width:100%">';
                var markEnd = '</div></div>';
                var markup;
                if (typeof opts == "string") {
                    markup = $(markStart + opts +"<a href='javascript:;' class='cancel'>Cancel</a>"+markEnd);
                } else if (typeof opts == "object") {
                    markup = $(markStart + markEnd);
                    var container = $(markup.children().get());
                    opts.push({text:"Cancel",cssClasses:"cancel"});
                    for (var i = 0; i < opts.length; i++) {
                        var item = $('<a href="javascript:;" >' + (opts[i].text || "TEXT NOT ENTERED") + '</a>');
                        item[0].onclick = (opts[i].handler || function() {});
                        if (opts[i].cssClasses && opts[i].cssClasses.length > 0)
                            item.addClass(opts[i].cssClasses);
                        container.append(item);
                    }
                }
                $(elID).find("#jq_actionsheet").remove();
                $(elID).find("#jq_action_mask").remove();
                actionsheetEl = $(elID).append(markup);
                
                markup.get().style[$.feat.cssPrefix+'Transition']="all 0ms";
                markup.css($.feat.cssPrefix+"Transform",  "translate"+$.feat.cssTransformStart+"0,0"+$.feat.cssTransformEnd);
                markup.css("top",window.innerHeight+"px");
                this.el.style.overflow = "hidden";
                markup.on("click", "a",function(){that.hideSheet()});
                this.activeSheet=markup;
                $(elID).append('<div id="jq_action_mask" style="position:absolute;top:0px;left:0px;right:0px;bottom:0px;z-index:9998;background:rgba(0,0,0,.4)"/>');
                setTimeout(function(){
                    markup.get().style[$.feat.cssPrefix+'Transition']="all 300ms";
                    markup.css($.feat.cssPrefix+"Transform", "translate"+ $.feat.cssTransformStart+"0,"+(-(markup.height()))+"px"+$.feat.cssTransformEnd);
                 },10);
            } catch (e) {
                alert("error adding actionsheet" + e);
            }
        };
        actionsheet.prototype = {
            activeSheet:null,
            hideSheet: function() {
                var that=this;
                this.activeSheet.off("click","a",function(){that.hideSheet()});
                $(this.el).find("#jq_action_mask").remove();
                this.activeSheet.get().style[$.feat.cssPrefix+'Transition']="all 0ms";
                var markup = this.activeSheet;
                var theEl = this.el;
                setTimeout(function(){
                    
                	markup.get().style[$.feat.cssPrefix+'Transition']="all 300ms";

                	markup.css($.feat.cssPrefix+"Transform", "translate"+$.feat.cssTransformStart+"0,0px"+$.feat.cssTransformEnd);
                	setTimeout(function(){
		                markup.remove();
		                markup=null;
		                theEl.style.overflow = "none";
	                },500);
                },10);            
            }
        };
        return actionsheet;
    })();
})(jq);
