/**
 * jq.popup - a popup/alert library for html5 mobile apps
 * @copyright Indiepath 2011 - Tim Fisher
 * 
 */

/* EXAMPLE
  $('body').popup({
	    title:"Alert! Alert!",
	    message:"This is a test of the emergency alert system!! Don't PANIC!",
	    cancelText:"Cancel me", 
	    cancelCallback: function(){console.log("cancelled");},
	    doneText:"I'm done!",
	    doneCallback: function(){console.log("Done for!");},
	    cancelOnly:false,
        doneClass:'button',
        cancelClass:'button',
        onShow:function(){console.log('showing popup');}
        autoCloseDone:true //default is true will close the popup when done is clicked.
  });
 */
(function($) {
    
    $.fn.popup = function(opts) {
        return new popup(this[0], opts);
    };
    var queue = [];
    var popup = (function() {
        var popup = function(containerEl, opts) {
            
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
                if (typeof (opts) === "string" || typeof (opts) === "number")
                    opts = {message: opts,cancelOnly: "true",cancelText: "OK"};
                this.id = id = opts.id = opts.id || $.uuid(); //opts is passed by reference
                var self = this;
                this.title = opts.title || "Alert";
                this.message = opts.message || "";
                this.cancelText = opts.cancelText || "Cancel";
                this.cancelCallback = opts.cancelCallback || function() {
                };
                this.cancelClass = opts.cancelClass || "button";
                this.doneText = opts.doneText || "Done";
                this.doneCallback = opts.doneCallback || function(self) {
                	self.hide();
                };
                this.doneClass = opts.doneClass || "button";
                this.cancelOnly = opts.cancelOnly || false;
                this.onShow = opts.onShow || function(){};
                this.autoCloseDone=opts.autoCloseDone!==undefined?opts.autoCloseDone:true;
                
                queue.push(this);
                if (queue.length == 1)
                    this.show();
            } catch (e) {
                console.log("error adding popup " + e);
            }
        
        };
        
        popup.prototype = {
            id: null,
            title: null,
            message: null,
            cancelText: null,
            cancelCallback: null,
            cancelClass: null,
            doneText: null,
            doneCallback: null,
            doneClass: null,
            cancelOnly: false,
            onShow: null,
            autoCloseDone:true,
            show: function() {
                var self = this;
                var markup = '<div id="' + this.id + '" class="jqPopup hidden">\
	        				<header>' + this.title + '</header>\
	        				<div><div style="width:1px;height:1px;-webkit-transform:translate3d(0,0,0);float:right"></div>' + this.message + '</div>\
	        				<footer>\
	        					<a href="javascript:;" class="'+this.cancelClass+'" id="cancel">' + this.cancelText + '</a>\
	        					<a href="javascript:;" class="'+this.doneClass+'" id="action">' + this.doneText + '</a>\
	        				</footer>\
	        			</div></div>';
                $(this.container).append($(markup));
                
                if (this.cancelOnly) {
                    $("#" + this.id).find('A#action').hide();
                    $("#" + this.id).find('A#cancel').addClass('center');
                }
                $("#" + this.id).find('A').each(function() {
                    var button = $(this);
                    button.bind('click', function(e) {
                        if (button.attr('id') == 'cancel') {
                            self.cancelCallback.call(self.cancelCallback, self);
                            self.hide();
                        } else {
                            self.doneCallback.call(self.doneCallback, self);
                            if(self.autoCloseDone)
                                self.hide();
                        }
                        e.preventDefault();
                     });
                });
                self.positionPopup();
                $.blockUI(0.5);
                $('#' + self.id).removeClass('hidden');
                $('#' + self.id).bind("orientationchange", function() {
                    self.positionPopup();
                });
                
                this.onShow(this);
                
            },
            
            hide: function() {
                var self = this;
                $('#' + self.id).addClass('hidden');
                $.unblockUI();
                setTimeout(function() {
                    self.remove();
                }, 250);
            },
            
            remove: function() {
                var self = this;
                $('#' + self.id + ' BUTTON#action').unbind('click');
                $('#' + self.id + ' BUTTON#cancel').unbind('click');
                $('#' + self.id).unbind("orientationchange").remove();
                queue.splice(0, 1);
                if (queue.length > 0)
                    queue[0].show();
            },
            
            positionPopup: function() {
                var popup = $('#' + this.id);
                popup.css("top", ((window.innerHeight / 2.5) + window.pageYOffset) - (popup[0].clientHeight / 2) + "px");
                popup.css("left", (window.innerWidth / 2) - (popup[0].clientWidth / 2) + "px");
            }
        };
        
        return popup;
    })();
    var uiBlocked = false;
    $.blockUI = function(opacity) {
        if (uiBlocked)
            return;
        opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
        $('BODY').prepend($("<div id='mask'" + opacity + "></div>"));
        $('BODY DIV#mask').bind("touchstart", function(e) {
            e.preventDefault();
        });
        $('BODY DIV#mask').bind("touchmove", function(e) {
            e.preventDefault();
        });
        uiBlocked = true
    };
    
    $.unblockUI = function() {
        uiBlocked = false;
        $('BODY DIV#mask').unbind("touchstart");
        $('BODY DIV#mask').unbind("touchmove");
        $("BODY DIV#mask").remove();
    };
    /**
     * Here we override the window.alert function due to iOS eating touch events on native alerts
     */
    window.alert = function(text) {
        $(document.body).popup(text.toString());
    }
    window.confirm = function(text) {
        throw "Due to iOS eating touch events from native confirms, please use our popup plugin instead";
    }
})(jq);