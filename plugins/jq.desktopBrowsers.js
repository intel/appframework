(function ($) {
	
	var preventAll = function(e) 
    {
        e.preventDefault();
		e.stopPropagation();
    }
	
	var redirectMouseToTouch = function(type, originalEvent) 
	{

	    //stop propagation, and remove default behavior for everything but INPUT, TEXTAREA & SELECT fields
	    if (originalEvent.target.tagName.toUpperCase().indexOf("SELECT") == -1 && 
	    originalEvent.target.tagName.toUpperCase().indexOf("TEXTAREA") == -1 && 
	    originalEvent.target.tagName.toUpperCase().indexOf("INPUT") == -1)  //SELECT, TEXTAREA & INPUT
	    {
	        preventAll(originalEvent);
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
		touchevt.mouseToTouch = true;
	    return touchevt;
	}
	
	var preventClick, removePreventClick;
	preventClick = function(e) 
    {
		if(!e.mouseToTouch){
	        preventAll(e);
			removePreventClick();
		}
    }
	
	removePreventClick=function(){
		document.removeEventListener("click", preventClick, true);
	};
	
    var mouseDown = false,
		mouseMoving = false,
		lastTarget = null;

    document.addEventListener("mousedown", function(e) 
    {
		mouseDown = true;
		mouseMoving = false;
		lastTarget = e.target;
        redirectMouseToTouch("touchstart", e);
    }, true);

    document.addEventListener("mouseup", function(e) 
    {
        redirectMouseToTouch("touchend", e);
		if(!mouseMoving){
		    document.addEventListener("click", preventClick, true);
		}
		mouseDown = false;
		mouseMoving = false;
    }, true);

    document.addEventListener("mousemove", function(e) 
    {
        if (!mouseDown)
            return;
		mouseMoving = true;
        redirectMouseToTouch("touchmove", e);
    }, true);
		
    document.addEventListener("mouseout", function(e) 
    {
		if(mouseDown){
		    e = e ? e : window.event;
		    var from = e.relatedTarget || e.toElement;
		    if (!from || from.nodeName == "HTML") {
				var touchevt = document.createEvent("Event");
			 	touchevt.initEvent("mouseup", true, true);
		        touchevt.target = lastTarget;
				lastTarget.dispatchEvent(touchevt);
		    }
		}
    }, true);
		
		
	//prevent all mouse events which dont exist on touch devices
    document.addEventListener("drag", preventAll, true);
	document.addEventListener("dragstart", preventAll, true);
	document.addEventListener("dragenter", preventAll, true);
	document.addEventListener("dragover", preventAll, true);
	document.addEventListener("dragleave", preventAll, true);
	document.addEventListener("dragend", preventAll, true);
	document.addEventListener("drop", preventAll, true);
	document.addEventListener("selectstart", preventAll, true);
	
	
	window.addEventListener("resize",function(){
		var touchevt = document.createEvent("Event");
	 	touchevt.initEvent("orientationchange", true, true);
	    document.dispatchEvent(touchevt);
	},false);
	
	$.touchEvents={
		allowClick:removePreventClick
	}
})(jq)
