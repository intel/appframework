
/**
 * af.splashscreen 
 * @copyright Intel 2014 
 * 
 */
(function($){
    "use strict";
    $.afui.ready(function(){
        //delay to hide the splashscreen
        setTimeout(function(){
            $("#splashscreen").remove();
        },250);
    });
})(jQuery);