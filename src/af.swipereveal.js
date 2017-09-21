/**
 * af.swipereveal
 * @copyright Intel 2014
 *
 */
(function($){
    "use strict";

    //Register the handler for opening
    var target;
    var pos=0;
    var end;
    var width;
    $.afui.swipeThreshold=0.3;
    $(document).on("swipeStartLeft",".swipe-reveal",function(e,touch,originalE){

        originalE.preventDefault();
        target=$(e.target).closest(".swipe-content");
        pos=touch.x2;
        width=target.closest(".swipe-reveal").find(".swipe-hidden").width();
        if($.getCssMatrix(e.target).e!==0)
            return ;

        target.bind("touchmove",tracker);
        target.one("touchend",function(){
            target.unbind("touchmove",tracker);
            if(Math.abs(end)/width<$.afui.swipeThreshold)
            {
                width=0;
            }
            target.transition().keep().end(function(){
                width=null;
                target=null;
            }).run("translate3d("+(-width)+"px,0px,0)","100ms");
        });
    });

    $(document).on("swipeStartRight",".swipe-reveal",function(e,touch,originalE){
        originalE.preventDefault();
        target=$(e.target).closest(".swipe-content");

        width=target.closest(".swipe-reveal").find(".swipe-hidden").width();
        if ($(e.target).parents(".swipe-content").length===0) {
            if($.getCssMatrix(e.target).e===0)
                return ;
        }
        pos=touch.x2+width;
        target.bind("touchmove",tracker);
        target.one("touchend",function(){
            target.unbind("touchmove",tracker);
            if((1-Math.abs(end)/width)>$.afui.swipeThreshold)
            {
                width=0;
            }
            target.transition().keep().end(function(){
                width=null;
                target=null;
            }).run("translate3d("+(-width)+"px,0px,0)","100ms");
        });
    });


    var tracker=function(e){
        var to=-(pos-(e.touches[0].pageX));
        if((to)<-width)
            to="-"+width;
        else if(to>0)
            to=0;
        end=to;

        target.cssTranslate(to+"px,0");
    };

})(jQuery);