/**
 * Slide menu plugin for App Framework UI
 * @copyright Intel
 *  simply include this plugin to allow sliding of your app to reveal the left and right hand menus.
 */

 /* global af*/
 /* global numOnly*/
(function($) {
    "use strict";
    var startX, startY, dx, dy,
        checking = false,
        doMenu = true,
        showHide = false;
    $.ui.slideSideMenu = true;
    $.ui.fixedSideMenuWidth = 20000; //By default, we want it to always be revealed
    $.ui.slideMenuXThreshold=0;
    var isAside=false;
    var keepOpen=false;

    $.ui.ready(function() {

        if ($.os.ie) return; //ie has the menu at the bottom
        var afui=$("#afui").get(0);
        var elems = $("#content, #header, #navbar");
        var max = 0;
        var slideOver = max/3;
        var transTime = $.ui.transitionTime;
        var openState=0;
        var showHideThresh=false;
        var $menu = $.query("#menu");
        var $asideMenu = $.query("#aside_menu");
        var menuWidth = $menu.width();
        var asideWidth = $asideMenu.width();
        var inputElements = ["input", "select", "textarea"];
        var tracking=false;
        var hasMoved=false;
        afui.addEventListener("touchstart", function(e) {
            openState=0;
            if (!$.ui.isSideMenuEnabled() && !$.ui.isAsideMenuEnabled()) return true;
            if(e.touches.length>1) return;
            if(e.target.tagName.indexOf("input")!==-1) return;
            if($(e.target).closest("[data-ignore-slide]").length>0) return;
            var tagName=e.target.tagName.toLowerCase();

            if(tagName&&inputElements.indexOf(tagName) !== -1) return;

            tracking=true;
            menuWidth = $menu.width();
            asideWidth = $asideMenu.width();
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;

            checking = false;
            doMenu=false;
            keepOpen=false;
            isAside=false;
            if (window.innerWidth >= $.ui.fixedSideMenuWidth){
                doMenu = false;
                keepOpen=true;
            }
            else
                doMenu = true;

            var sidePos=$.ui.getSideMenuPosition();            
            if($.ui.slideMenuXThreshold!==0&&sidePos===0){
                if(e.touches[0].pageX>$.ui.slideMenuXThreshold&&window.innerWidth-e.touches[0].pageX>$.ui.slideMenuXThreshold){ 
                    doMenu=false;
                    tracking=false;
                    return;
                }
            }
            if(sidePos>0){
                openState=1;
                max = menuWidth;
            } else if(sidePos<0){
                openState=2;
                max = asideWidth;
            }
        },true);

        afui.addEventListener("touchmove", function(e) {

            if(e.touches.length>1||!tracking) return;
            if (!$.ui.isSideMenuEnabled() && !$.ui.isAsideMenuEnabled()) return true;
            if (!$.ui.slideSideMenu||keepOpen) return true;

            dx = e.touches[0].pageX;
            dy = e.touches[0].pageY;

            //splitview stuff  
            if(hasMoved){
                e.preventDefault();
                e.stopPropagation();
            }

            if($.ui.splitview&&window.innerWidth>=parseInt($.ui.handheldMinWidth,10)&& (dx > startX)&&openState===0) return true;
            if (!$.ui.isSideMenuEnabled() && (dx > startX) && openState===0) return true;
            if (!$.ui.isAsideMenuEnabled() && (dx < startX) && openState===0) return true;
            if (Math.abs(dy - startY) > Math.abs(dx - startX)) return true;

            if (!checking) {
                checking = true;
                doMenu=false;
                return true;
            }
            else
                doMenu=true;
            var thePlace = (dx - startX);
            if(openState===0){
                if(thePlace<0){
                    max = asideWidth;
                    $asideMenu.show();
                    if(!$.ui.splitview)
                        $menu.hide();
                } else {
                    max = menuWidth;
                    $menu.show();
                    $asideMenu.hide();
                }
            }

            if (Math.abs(thePlace) > max){
                return true;
            }

            e.preventDefault();
            e.stopPropagation();
            slideOver=max/3;
            showHideThresh=Math.abs(thePlace)<slideOver?showHide?showHide:false:2;

            if(openState===1) {
                thePlace+=max;
                showHideThresh=Math.abs(thePlace)<slideOver*2?showHide?showHide:false:2;
                if(thePlace>max)
                    thePlace=max;
            } else if(openState===2){
                thePlace=(-1*max)+thePlace;
                showHideThresh=Math.abs(thePlace)<slideOver*2?showHide?showHide:false:2;
                if(thePlace<(-1*max))
                    thePlace=-1*max;
            }
            else if(thePlace<0&&thePlace<(-1*max))
                thePlace=-1*max;

            if (!showHide) {
                transTime = (thePlace / max) * numOnly($.ui.transitionTime);
            } else {
                transTime = ((max - thePlace) / max) * numOnly($.ui.transitionTime);
            }
            transTime=Math.abs(transTime);
            if(thePlace<0){
                isAside=true;
            } else {
                isAside=false;
            }
            hasMoved=true;
            elems.cssTranslate(thePlace + "px,0");


        },true);
        afui.addEventListener("touchend", function() {
            if (!$.ui.isSideMenuEnabled() && !$.ui.isAsideMenuEnabled()) return true;
            if (doMenu && checking&&!keepOpen) {
                $.ui.toggleSideMenu(showHideThresh, function(){
                }, transTime,isAside);
            }
            hasMoved=false;
            checking = false;
            doMenu = false;
            keepOpen=false;
            tracking=false;
        },true);
    });
})(af);