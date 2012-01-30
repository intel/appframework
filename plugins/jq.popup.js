/**
 * jq.popup - a popup/alert library for html5 mobile apps
 * @copyright Indiepath 2011 - Tim Fisher
 * 
 */

/* EXAMPLE
 * $('body').popup({
	    title:"Alert! Alert!",
	    message:"This is a test of the emergency alert system!! Don't PANIC!",
	    cancelText:"Cancel me", 
	    cancelCallback: function(){console.log("cancelled");},
	    doneText:"I'm done!",
	    doneCallback: function(){console.log("Done for!");},
	    cancelOnly:false
 * });
 */
(function ($) {

	$.fn.popup = function (opts) {
        return new popup(this[0], opts);
    };

    var popup = (function () {

    	var popup = function (containerEl, opts) {
             
	        if (typeof containerEl === "string" || containerEl instanceof String) {
	            this.container = document.getElementById(containerEl);
	        } else {
	            this.container = containerEl;
	        }
	        if (!this.container) {
	            alert("Error finding container for popup " + containerEl);
	            return;
	        }
	        
	        try {
	        	id = opts.id	= opts.id || $.uuid(); //opts is passed by reference
	        	var self			= this;
	        	var title 			= opts.title || "Alert";
	        	var message 		= opts.message || "Default";
	        	var cancelText 		= opts.cancelText || "Cancel";
	        	var cancelCallback 	= opts.cancelCallback || function(){};
	        	var doneText 		= opts.doneText || "Done";
	        	var doneCallback 	= opts.doneCallback || function(){};
	        	var cancelOnly		= opts.cancelOnly || false;
	        	
	        	var markup = '\
	        			<div id="'+id+'" class="jqPopup hidden">\
	        				<header>'+title+'</header>\
	        				<div>'+message+'</div>\
	        				<footer>\
	        					<button class="button" id="cancel">'+cancelText+'</button>\
	        					<button class="button" id="action">'+doneText+'</button>\
	        				</footer>\
	        			</div>';
	        				
	        	popupEl = $(containerEl).append($.makeHTML(markup));
	        	
	        	if (cancelOnly){
	        		popupEl.find('BUTTON#action').hide();
	        		popupEl.find('BUTTON#cancel').addClass('center');
	        	}
	
	        	popupEl.find('BUTTON').each(function(){
	        		var button = $(this);
	        		button.bind('click', function(e){
	        			if (button.attr('id') == 'cancel'){
	        				cancelCallback.call(cancelCallback, this);
	        			} else {
	        				doneCallback.call(doneCallback, this);
	        			}
	        			// Close popup
	        			e.preventDefault();
	        			self.hide();
	        		});
	        	});
	        	this.show();
	        } catch (e) {
	        	console.log("error adding popup " + e);
	        }
	      
    	};
    	
    	popup.prototype = {
    		show : function(){
    			var self = this;
    			this.positionPopup();
    			$.blockUI(0.5);
    			$('#'+id).removeClass('hidden');
    			$('#'+id).bind("orientationchange", function() {
    	    		self.positionPopup();
    	    	});
    		},
    		
    		hide : function(){
    			var self = this;
    			$('#'+id).addClass('hidden');
    	    	$.unblockUI();
    	    	setTimeout(function(){
    	    		self.remove();
    	    	}, 250);
    		},
    		
    		remove : function(){
    			$('#'+id+' BUTTON.button').each(function(){
    	    		var button = $(this);
    	    		button.unbind('click');
    	    	});
    	    	$('#'+id).unbind("orientationchange").remove();
    		},
    		
    		positionPopup : function(){
    			var popup = $('#'+id);
    	    	popup.css("top", ((window.innerHeight /2) + window.pageYOffset) - (popup[0].clientHeight /2) + "px");
    	    	popup.css("left", (window.innerWidth / 2) - (popup[0].clientWidth / 2) + "px");
    		}
    	};
    	
    	return popup;
    })();
       
    $.uuid = function () {
	    var S4 = function () {
	        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	    }
	    return (S4()+S4()+"_"+S4()+"_"+S4()+"_"+S4()+"_"+S4()+S4()+S4());
	};
	
	$.makeHTML = function ( HTMLString ) {
		var nodes 		= [];
		var temp 		= document.createElement("div");
		temp.innerHTML 	= HTMLString;
		var i 			= 0;
		var len 		= temp.childNodes.length;
		while (i < len) {
			nodes[i] = temp.childNodes[i];
			i++;
		}
		return nodes;
	};
    
    $.blockUI = function ( opacity ) {
		opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
		$('BODY').prepend($.makeHTML("<div id='mask'" + opacity + "></div>"));
		$('BODY DIV#mask').bind("touchmove", function(e) {
			e.preventDefault();
		});
	};
	
	$.unblockUI = function ( ) {
		$('BODY DIV#mask').unbind("touchmove");
		$("BODY DIV#mask").remove();
	};
    
})(jq);