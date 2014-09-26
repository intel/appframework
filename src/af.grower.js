/** 
 * This plugin creates a "grow" transition using scaling and transforms
 * @author Ian Maffett
 * @copyright 2014 Intel
 */


(function($){
    "use strict";


    $.afui.registerDataDirective("[data-grower]",function(item,e){
        var $el=$(item).closest("[data-grower]");
        var items=$el.offset();
        var view=$el.closest(".view");
        var toPanel=e.target.hash||$el.attr("data-grower");
        view.css("zIndex","1");
        var growView=$(toPanel).closest(".view");

        var scaleX=($el.width()/window.innerWidth);
        var scaleY=($el.height()/window.innerHeight);

        var transProps={
            left:items.left,
            top:items.top,
            x:scaleX,
            y:scaleY
        };
        $(toPanel).trigger("panelgrowstart",[$el.get(0)]);
        growView.addClass("active").css("zIndex","10");
        growView.vendorCss("TransformOrigin","0 0");
        growView.data("growTransProps",transProps);
        growView.vendorCss("TransitionDuration","0");
        growView.vendorCss("Transform","translate3d("+items.left+"px,"+items.top+"px,0) scale("+scaleX+","+scaleY+")");
        growView.data("growTarget",$el.closest(".panel"));
        growView.data("growFrom",$(toPanel).attr("id"));
        $.afui.loadContent(toPanel,view,false,"stretch");
        $(toPanel).one("panelload",function(){
            growView.vendorCss("Transform","");
            $(toPanel).trigger("panelgrowcomplete",[$el.get(0)]);
        });
    });

    $.afui.registerDataDirective("[data-grower-back]",function(item){

        var growView=$(item).closest(".view");
        var fromPanel=$("#"+growView.data("growFrom"));
        fromPanel.trigger("panelgrowendstart");
        var trans=growView.data("growTransProps");
        var toPanel="#"+growView.data("growTarget").prop("id");
        $(toPanel).closest(".view").addClass("active");
        growView.addClass("animation-active");

        growView.transition().end(function(){
            growView.removeClass("active");
            fromPanel.trigger("panelgrowendstart");
            $.afui.loadContent(toPanel,false,false,"none");
        }).run("translate3d("+trans.left+"px,"+trans.top+"px,0) scale("+trans.x+","+trans.y+")","300ms");
    });
})(jQuery);