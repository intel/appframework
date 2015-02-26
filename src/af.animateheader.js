/**
 * af.animateheader
 * @copyright Intel 2014
 *
 */

(function($){
    "use strict";
    //animate the headers on transtion
    var oldTitle=$.afui.setTitle;
    $.afui.animateHeader=function(what){
        if(what!==false){
            $.afui.setTitle=function(item,view,back,newView){

                var title;
                if(typeof(item)==="string"){
                    title=item;
                }
                else if($(item).attr("data-title"))
                    title=$(item).attr("data-title");
                else if($(item).attr("title"))
                    title=$(item).attr("title");

                if(!title||title.length===0) return;

                var header=$(this.activeDiv).closest(".view").children("header").eq(0);
                var cssClass=back?"header-unload":"header-load";

                var old=header.find("h1").eq(0).html();

                //update the current header h1 so we keep the DOM node for events, etc
                header.find("h1").eq(0).html(title).removeClass("header-unload header-load");
                if(newView) return;
                header.find("h1").animation().run(cssClass+"-to");

                //append a second for animation
                var second=$("<h1>"+old+"</h1>");
                header.append(second);
                second.animation().end(function(){
                    $(this).remove();
                }).run(cssClass);
            };
        }
        else{
            $.afui.setTitle=oldTitle;
        }
    };

})(jQuery);