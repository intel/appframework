

 

(function ($) {
    "use strict";
    $.fn.toast = function (opts) {
        return new Toast(this[0], opts);
    };
    var Toast = (function () {
        var Toast = function (containerEl, opts) {

            if (typeof containerEl === "string" || containerEl instanceof String) {
                this.container = document.getElementById(containerEl);
            } else {
                this.container = containerEl;
            }
            if (!this.container) {
                window.alert("Error finding container for toast " + containerEl);
                return;
            }
            if (typeof (opts) === "string" || typeof (opts) === "number") {
                opts = {
                    message: opts
                };
            }
            this.addCssClass = opts.addCssClass ? opts.addCssClass : "";
            this.message = opts.message || "";
            this.delay=opts.delay||this.delay;
            this.position=opts.position||"";
            this.addCssClass+=" "+this.position;
            this.type=opts.type||"";
            //Check if the container exists
            this.container=$(this.container);
            if(this.container.find(".afToastContainer").length===0)
            {
                this.container.append("<div class='afToastContainer'></div>");
            }
            this.container=this.container.find(".afToastContainer");
            this.container.removeClass("tr br tl bl tc bc").addClass(this.addCssClass);
            if(opts.autoClose===false)
                this.autoClose=false;
            this.show();
        };

        Toast.prototype = {
            addCssClass: null,
            message: null,
            delay:5000,
            el:null,
            container:null,
            timer:null,
            autoClose:true,
            show: function () {
                var self = this;
                var markup = "<div  class='afToast "+this.type+"'>"+
                            "<div>" + this.message + "</div>"+
                            "</div>";
                this.el=$(markup).get(0);
                this.container.append(this.el);
                var $el=$(this.el);
                var height=this.el.clientHeight;
                $el.addClass("hidden");
                setTimeout(function(){
                    $el.css("height",height);
                    $el.removeClass("hidden");
                },20);
                if(this.autoClose){
                    this.timer=setTimeout(function(){
                        self.hide();
                    },this.delay);
                }
                $el.bind("click",function(){
                    self.hide();
                });
            },

            hide: function () {
                var self = this;
                clearTimeout(this.timer);
                $(this.el).unbind("click").addClass("hidden");
                $(this.el).css("height","0px");
                if(!$.os.ie&&!$.os.android){
                    setTimeout(function () {
                        self.remove();
                    }, 300);
                }
                else
                    self.remove();
            },

            remove: function () {
                var $el = $(this.el);
                $el.remove();
            }
        };
        return Toast;
    })();


    $.afui.toast=function(opts){
        $(document.body).toast(opts);
    };

    $.afui.registerDataDirective("[data-toast]",function(item){
        var $item=$(item);
        var message=$item.attr("data-message")||"";
        if(message.length===0) return;
        var position=$item.attr("data-position")||"tr";
        var type=$item.attr("data-type");
        var autoClose=$item.attr("data-auto-close")==="false"?false:true;
        var delay=$item.attr("data-delay")||0;
        var opts={
            message:message,
            position:position,
            delay:delay,
            autoClose:autoClose,
            type:type
        };
        $(document.body).toast(opts);
    });

})(jQuery);
