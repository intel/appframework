//onShow = open
//cancelCallback = cancel
//doneCallback = done
//removed id property
// added this.popup = $el;

(function($){
    "use strict";
    var queue=[];
    $.widget("afui.popup",{
        options:{
            addCssClass: "",
            title: "Alert",
            message: "",
            cancelText: "Cancel",
            cancel: null,
            cancelClass: "",
            doneText: "",
            done:null,
            doneClass: "",
            cancelOnly: false,
            open:null,
            autoCloseDone: true,
            suppressTitle: false
        },
        _create:function(){
        },
        _init:function(){
            queue.push(this);
            if (queue.length === 1)
                this.show();
        },
        widget:function(){
            return this.popup;
        },
        show: function () {
            var markup = "<div class='afPopup hidden "+ this.options.addCssClass + "'>"+
                        "<header>" + this.options.title + "</header>"+
                        "<div>" + this.options.message + "</div>"+
                        "<footer>"+
                             "<a href='javascript:;' class='" + this.options.cancelClass + "' id='cancel'>" + this.options.cancelText + "</a>"+
                             "<a href='javascript:;' class='" + this.options.doneClass + "' id='action'>" + this.options.doneText + "</a>"+
                             "<div style='clear:both'></div>"+
                        "</footer>"+
                        "</div>";

            var $el=$(markup);
            this.element.append($el);
            this.popup=$el;
            this._on($el,{close:"hide"});

            if (this.options.cancelOnly) {
                $el.find("A#action").hide();
                $el.find("A#cancel").addClass("center");
            }

            //@TODO Change to event
            this._on($el,{"click a":function(event){
                var button = $(event.target);
                console.log(button);
                if (button.attr("id") === "cancel") {
                    this._trigger("cancel",event);
                    //this.options.cancelCallback.call(this.options.cancelCallback, this);
                    this.hide();
                } else {
                    this._trigger("done",event);
                    //this.options.doneCallback.call(this.options.doneCallback, this);
                    if (this.options.autoCloseDone)
                        this.hide();
                }
                event.preventDefault();
            }});

            this.positionPopup();
            $.blockUI(0.5);

            this._on({orientationchange:"positionPopup"});

            //force header/footer showing to fix CSS style bugs
            this.popup.find("header,footer").show();
            this._delay(function(){
                this.popup.removeClass("hidden").addClass("show");
                //this.options.onShow(this);
                this._trigger("open");
            },50);
        },

        hide: function () {
            this.popup.addClass("hidden");
            $.unblockUI();
            if(1==1){//!$.os.ie&&!$.os.android){
                this._delay("remove",250);
            }
            else
                this.remove();
        },

        remove: function () {
            this._off(this.element,"orientationchange");
            this.popup.remove();
            queue.splice(0, 1);
            if (queue.length > 0)
                queue[0].show();
        },

        positionPopup: function () {
            this.popup.css({
                "top":((window.innerHeight / 2.5) + window.pageYOffset) - (this.popup[0].clientHeight / 2),
                "left":(window.innerWidth / 2) - (this.popup[0].clientWidth / 2)
            });
        }
    });
    var uiBlocked = false;
    $.blockUI = function (opacity) {
        if (uiBlocked)
            return;
        opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
        $("BODY").prepend($("<div id='mask'" + opacity + "></div>"));
        $("BODY DIV#mask").bind("touchstart", function (e) {
            e.preventDefault();
        });
        $("BODY DIV#mask").bind("touchmove", function (e) {
            e.preventDefault();
        });
        uiBlocked = true;
    };

    $.unblockUI = function () {
        uiBlocked = false;
        $("BODY DIV#mask").unbind("touchstart");
        $("BODY DIV#mask").unbind("touchmove");
        $("BODY DIV#mask").remove();
    };
    $.afui.registerDataDirective("[data-alert]",function(item){
        var $item=$(item);
        var message=$item.attr("data-message");
        if(message.length===0) return;
        $(document.body).popup({message:message,cancelOnly:true});
    });

    $.afui.popup=function(opts){
        return $(document.body).popup(opts);
    };
})(jQuery);
