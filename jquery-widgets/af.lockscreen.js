//onShow = open
//cancelCallback = cancel
//doneCallback = done
//removed id property
// added this.lockscreen = $el;

(function($){
    "use strict";

    $.widget("afui.lockscreen",{
        options:{
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

        },
        visible:false,
        _create:function(){
        },
        _init:function(){
            return this;
        },
        widget:function(){
            return this.lockscreen;
        },
        show: function () {
            if(this.visible) return;
            var logo=this.options.logo;
            var container="<div class='content flexContainer'><div class='password'>"+logo+"<input maxlength=4 type='password' placeholder='****' disabled></div><div class='error'>Invalid Password</div></div>";
            container+="<div class='keyboard flexContainer'>"+this.options.renderKeyboard()+"</div>";
            var item=$("<div id='lockScreen'/>");
            item.html(container);
            if(this.options.roundKeyboard){
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
                    if(self.options.validatePassword(pass.val()))
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
            this.lockscreen.remove();
        }

    });
})(jQuery);
