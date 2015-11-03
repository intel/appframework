/**
 * af.lockscreen - a lockscreen for html5 mobile apps
 * Copyright 2015 - Intel
 */
 
/** global FastClick **/

/** jshint camelcase:false **/


(function($){
    "use strict";

    $.fn.lockScreen = function(opts) {
        var tmp;
        for (var i = 0; i < this.length; i++) {
            tmp = new LockScreen(this[i], opts);
        }
        return this.length === 1 ? tmp : this;
    };

    var LockScreen = function (containerEl, opts) {
        if (typeof(opts) === "object") {
            for (var j in opts) {
                this[j] = opts[j];
            }
        }
    };
    LockScreen.prototype= {
        logo:"<div class='icon database big'></div>",
        roundKeyboard:false,
        validatePassword:function(){},
        renderKeyboard:function(){
            var html="";
            for(var i=0;i<8;i=i+3){
                html+="<div class='row'>";
                for(var j=1;j<=3;j++){
                    var num=i+j;
                    html+="<div data-key='"+num+"'>"+num+"</div>";
                }
                html+="</div>";
            }
            html+="<div class='row'><div data-key='' class='grey blank'>&nbsp;</div><div data-key='0'>0</div><div data-key='delete' class='grey'><=</div></div>";
            return html;
        },
        show: function () {
            if(this.visible) return;
            var logo=this.logo;
            var container="<div class='content flexContainer'><div class='password'>"+logo+"<input maxlength=4 type='password' placeholder='****' disabled></div><div class='error'>Invalid Password</div></div>";
            container+="<div class='keyboard flexContainer'>"+this.renderKeyboard()+"</div>";
            var item=$("<div id='lockScreen'/>");
            item.html(container);
            if(this.roundKeyboard){
                item.addClass("round");
                item.find("input[type='password']").attr("placeholder",("◌◌◌◌"));
            }
            this.lockscreen=item;
            $(document.body).append(item);
            var pass=$("#lockScreen input[type='password']");
            var self=this;
            $(item).on("click",function(evt){
                var target=$(evt.target);
                if(target.length===0) return;
                var key=target.attr("data-key");
                if(!key) return;
                if(key==="delete"){
                    pass.val(pass.val().substring(0,pass.val().length-1));
                    return;
                }
                var len=pass.val().length;

                if(len<4)
                    pass.val(pass.val()+key);
                if(pass.val().length===4){
                    if(self.validatePassword(pass.val()))
                        self.hide();
                    else {
                        self.lockscreen.find(".error").css("visibility","visible");
                        setTimeout(function(){
                            self.lockscreen.find(".error").css("visibility","hidden");
                            pass.val("");
                        },1000);
                    }
                }
            });
            $(item).on("touchstart",function(evt){
                $(evt.target).addClass("touched");
            }).on("touchend",function(evt){
                $(evt.target).removeClass("touched");
            });
        },
        hide:function(){
            if(this.lockscreen)
                this.lockscreen.remove();
        }
    };
})(jQuery);
