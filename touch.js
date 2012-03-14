redirectMouseToTouch = function(type, originalEvent) 
{

    //stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
    // originalEvent.stopPropagation();
    if (originalEvent.target.tagName.toUpperCase().indexOf("SELECT") == -1 && 
    originalEvent.target.tagName.toUpperCase().indexOf("TEXTAREA") == -1 && 
    originalEvent.target.tagName.toUpperCase().indexOf("INPUT") == -1)  //SELECT, TEXTAREA & INPUT
    {
        //if(type != 'touchstart')
        //originalEvent.stopPropagation();//originalEvent.preventDefault();
        //else
        //originalEvent.preventDefault();
        originalEvent.stopPropagation();
    }
    
    var touchevt = document.createEvent("Event");
    touchevt.initEvent(type, true, true);
    touchevt.touches = new Array();
    touchevt.touches[0] = new Object();
    touchevt.touches[0].pageX = originalEvent.pageX;
    touchevt.touches[0].pageY = originalEvent.pageY;
    touchevt.touches[0].target = originalEvent.target;
    touchevt.changedTouches = touchevt.touches; //for jqtouch
    touchevt.targetTouches = touchevt.touches; //for jqtouch
    touchevt.target = originalEvent.target;
    originalEvent.target.dispatchEvent(touchevt);
    return touchevt;
}

emulateTouchEvents = function() 
{
    var ee = document;

    document.mouseMoving = false;
    
    
    document.addEventListener("mousedown", function(e) 
    {
        try 
        {
            this.mouseMoving = true;
            var touchevt = redirectMouseToTouch("touchstart", e);
            if (document.ontouchstart)
                document.ontouchstart(touchevt);
            if(e.target.ontouchstart)
                e.target.ontouchstart(e);
            
        } catch (e) {
        }
    });

    //ee[x].onmouseup=function(e)
    document.addEventListener("mouseup", function(e) 
    {
        try 
        {
            this.mouseMoving = false;

            var touchevt = redirectMouseToTouch("touchend", e);
            if (document.ontouchend)
                document.ontouchend(touchevt);
            if(e.target.ontouchend)
                e.target.ontouchend(e);
        } 
        catch (e) {
        }
    });
    //ee[x].onmousemove=function(e)
    document.addEventListener("mousemove", function(e) 
    {
        try 
        {
            if (!this.mouseMoving)
                return
            var touchevt = redirectMouseToTouch("touchmove", e);
            if (document.ontouchmove)
                document.ontouchmove(touchevt);
            if(e.target.ontouchmove)
                e.target.ontouchmove(e);
        } 
        catch (e) {
        }
    });
// }
}
emulateTouchEvents();
window.addEventListener("resize",function(){
var touchevt = document.createEvent("Event");
 touchevt.initEvent("orientationchange", true, true);
    document.dispatchEvent(touchevt);
},false);