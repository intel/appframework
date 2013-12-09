/**
 * Slide menu plugin for App Framework UI
 * @copyright Intel
 *
 */
 ;
(function($) {
    var startX, startY, dx, dy,
        checking = false,
        doMenu = true,
        showHide = false;
    $.ui.slideSideMenu = true;
    $.ui.fixedSideMenuWidth = 20000;
    var isAside=false;
    var keepOpen=false;

    $.ui.ready(function() {
        
        if ($.os.ie) return; //ie has the menu at the bottom
        

        var elems = $("#content, #header, #navbar");
        var max = 0;
        var slideOver = max/3;
        var transTime = $.ui.transitionTime;
        var openState=0;
        var showHideThresh=false;
        var $cnt=$.query("#content");
        $("#afui").bind("touchstart", function(e) {
            openState=0;
            if(!$cnt.hasClass("hasMenu")) return;
            if(e.touches.length>1) return;
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;

            checking = false;
            doMenu=false;
            keepOpen=false;
            isAside=false;
            if (window.innerWidth >= $.ui.fixedSideMenuWidth)
                doMenu = false,keepOpen=true;
            else
                doMenu = true;
            max = parseInt($("#menu").width());
            slideOver=max/3;
            var sidePos=$.ui.getSideMenuPosition();
            if(sidePos>0)
                openState=1;
            else if(sidePos<0)
                openState=2;
        });
        
        $("#afui").bind("touchmove", function(e) {
            if(!$cnt.hasClass("hasMenu")) return;
            if(e.touches.length>1) return;
            if (!$.ui.isSideMenuEnabled()) return true;
            if (!$.ui.slideSideMenu||keepOpen) return true;

            dx = e.touches[0].pageX;
            dy = e.touches[0].pageY;

            if (Math.abs(dy - startY) > Math.abs(dx - startX)) return true;  
            
            if (!checking) {
                checking = true;
                doMenu=false;
                return true;
            }
            else 
                doMenu=true;

            var thePlace = (dx - startX);
            if(openState==0){
                if(thePlace<0){
                    $("#aside_menu").show();
                    $("#menu").hide();
                } else {
                    $("#menu").show();
                    $("#aside_menu").hide();
                }
            }


            if (Math.abs(thePlace) > max) return true;
           // showHide = dx - startX > 0 ? 2 : false;
            

            showHideThresh=Math.abs(thePlace)<slideOver?showHide?showHide:false:2;
            
            
            if(openState==1) {            
                thePlace+=max;
                showHideThresh=Math.abs(thePlace)<slideOver*2?showHide?showHide:false:2;
                if(thePlace>max)
                    thePlace=max;
            }
            else if(openState==2){
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
            elems.cssTranslate(thePlace + "px,0");
            e.preventDefault();
            e.stopPropagation();        
        });
        $("#afui").bind("touchend", function(e) {
            if(!$cnt.hasClass("hasMenu")) return;

            if (doMenu && checking&&!keepOpen) {
                $.ui.toggleSideMenu(showHideThresh, function(){
                }, transTime,isAside);                
            }
            checking = false;
            doMenu = false;
            keepOpen=false;
        });
    });
})(af);
