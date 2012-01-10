/**
 * $().swipe - a library to detect swipe events for jQ.Mobi apps
 * Copyright 2011 - AppMobi 
 * Executes a callback function and passes in the direction return
 * @string (left,right,up,down)
 */

(function($){
	$.fn["swipe"]=function(opts)
	{
		var tmp;
		for(var i=0;i<this.length;i++)
		{
			tmp = new swipeListener(this[i],opts);
		}
		return this.length==1?tmp:this;
	};
	var swipeListener = (function() {
		var swipeListener = function(elID, opts) {
			var that = this;
			if(typeof(elID)=="string")
				this.el = document.getElementById(elID);
			else
				this.el=elID
			if (!this.el) {
				alert("Error adding swipe listener for " + elID);
				return;
			}
			this.el.addEventListener('touchmove', function(e) {
				that.touchMove(e);
			}, false);
			this.el.addEventListener('touchend', function(e) {
				that.touchEnd(e);
			}, false);
			for (j in opts) {
				this[j] = opts[j];
			}
		};

		swipeListener.prototype = {
			startX : 0,
			startY : 0,
			movingX : 0,
			movingY : 0,
			vthreshold : 50,
			hthreshold : 50,
			movingElement : false,
			swipeDirection : {
				up : false,
				down : false,
				left : false,
				right : false
			},
			callBack : null,

			cancel : function() {
				this.startX = 0;
				this.startY = 0;
				this.movingX = 0;
				this.movingY = 0;
				this.movingElement = false;
				this.swipeDirection = {
				up : false,
				down : false,
				left : false,
				right : false
				};
			},
			touchStart : function(event) {
				if (event.touches[0].target
						&& event.touches[0].target.type != undefined) {
					return;
				}
				if (event.touches.length == 1) {
					this.movingElement = true;
					this.startX = event.touches[0].pageX;
					this.startY = event.touches[0].pageY;
					event.preventDefault();
				}
			},
			touchMove : function(event) {
			   if(this.movingElement==false)
				  this.touchStart(event);
				event.preventDefault();
				if (event.touches.length > 1 || !this.movingElement) {
					this.cancel();
					return;
				}
				this.movingX = event.touches[0].pageX - this.startX;
				this.movingY = event.touches[0].pageY - this.startY;
			},
			touchEnd : function(event) {
				if (!this.movingElement)
					return;
				event.preventDefault();
				var swiped = false;
				if (Math.abs(this.movingX) > this.hthreshold) {
					this.swipeDirection.right = this.movingX > 0;
					this.swipeDirection.left = this.movingX < 0;
					swiped = true;
				}
				if (Math.abs(this.movingY) > this.vthreshold) {
					this.swipeDirection.up = this.movingY < 0;
					this.swipeDirection.down = this.movingY > 0;
					swiped = true;
				}
				if (swiped && typeof (this.callBack == "function"))
					this.callBack(this.swipeDirection);

				this.cancel();
			}
		};
		return swipeListener;
	})();

	// Helper function to get only
	if (!window.numOnly) {
		function numOnly(val) {
			if (isNaN(parseFloat(val)))
				val = val.replace(/[^0-9.-]/, "");

			return parseFloat(val);
		}
	}
})(jq);