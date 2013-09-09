/**
 * Slide menu plugin for App Framework UI
 * @copyright Intel
 *
 */;
(function($) {
    var startX, startY, dx, dy, blocking = false,
        checking = false,
        doMenu = true,
        showHide = false;
    $.ui.slideSideMenu = true;
    $.ui.fixedSideMenuWidth = 768;
    var keepOpen=false;
    $.ui.ready(function() {
        //  $("head").append("<style>#afui #menu {display:block !important}</style>");
        if ($.os.ie) return; //ie has the menu at the bottom
        // return;
        var elems = $("#content, #header, #navbar");
        var $menu = $("#menu");
        var max = $("#menu").width();
        var slideOver = max/3;
        var menuState;
        var transTime = $.ui.transitionTime;

        window.addEventListener("resize", function(e) {
            max = $("#menu").width();
        });

        $("#afui").bind("touchstart", function(e) {
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;

            checking = false;
            doMenu=false;
            keepOpen=false;
            if (window.innerWidth >= $.ui.fixedSideMenuWidth)
                doMenu = false,keepOpen=true;
            else
                doMenu = true;
            max = $("#menu").width();
            menuState = $menu.css("display") == "block";
        });
        $("#afui").bind("touchmove", function(e) {

            
            if (!$.ui.slideSideMenu||keepOpen) return true;
            if (!checking) {
                checking = true;
                doMenu=false;
                return true;
            }
            else 
                doMenu=true;
             if(!doMenu) return;

            dx = e.touches[0].pageX;
            dy = e.touches[0].pageY;
            if (!menuState && dx < startX) return;
            else if (menuState && dx > startX) return;
            if (Math.abs(dy - startY) > Math.abs(dx - startX)) {
                doMenu = false;
                return true;
            }            
            
            if (dx > max) return true;
            
            showHide = dx - startX > 0 ? 2 : false;
            var thePlace = Math.abs(dx - startX);

            if (!showHide) {
                thePlace = max - thePlace;
                transTime = (thePlace / max) * numOnly($.ui.transitionTime);
            } else {
                transTime = ((max - thePlace) / max) * numOnly($.ui.transitionTime);
            }

            elems.cssTranslate(thePlace + "px,0");
            e.preventDefault();
            e.stopPropagation();
            
            if( Math.abs(dx-startX) < slideOver){
                showHide = showHide ? false : 2;
            }

        });
        $("#afui").bind("touchend", function(e) {
            
            if (doMenu && checking&&!keepOpen) {
                $.ui.toggleSideMenu(showHide, null, transTime);
            }
            checking = false;
            doMenu = false;
            keepOpen=false;
        });
    });
})(af);
