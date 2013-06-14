/**
 * af.8tiles - Provides a WP8 theme and handles showing the menu
 * Copyright 2012 - Intel
 */;
(function($) {
	"use strict";

	if (!$) {
		throw "This plugin requires jqUi";
	}

	function wire8Tiles() {
		$.ui.isWin8 = true;
		if (!$.os.ie) return;

		$.ui.ready(function() {

			if ($.ui.slideSideMenu) $.ui.slideSideMenu = false;
			//we need to make sure the menu button shows up in the bottom navbar
			$.query("#afui #navbar footer").append("<a id='metroMenu' onclick='$.ui.toggleSideMenu()'>•••</a>");
			var tmpAnchors = $.query("#afui #navbar").find("a");
			if (tmpAnchors.length > 0) {
				tmpAnchors.data("ignore-pressed", "true").data("resetHistory", "true");
				var width = parseFloat(100 / tmpAnchors.length);
				tmpAnchors.css("width", width + "%");
			}
			var oldUpdate = $.ui.updateNavbarElements;
			$.ui.updateNavbarElements = function() {
				oldUpdate.apply($.ui, arguments);
				if ($.query("#afui #navbar #metroMenu").length == 1) return;
				$.query("#afui #navbar footer").append("<a id='metroMenu' onclick='$.ui.toggleSideMenu()'>•••</a>");
			};

			var oldToggle = $.ui.toggleSideMenu;
			$.ui.isSideMenuOn = function() {

				var menu = parseInt($.getCssMatrix($("#navbar")).f) < 0 ? true : false;
				return this.isSideMenuEnabled() && menu;
			};
			$.ui.toggleSideMenu = function(force, callback) {
				if (!this.isSideMenuEnabled() || this.togglingSideMenu) return;
				this.togglingSideMenu = true;
				var that = this;
				var menu = $.query("#menu");
				var els = $.query("#navbar");
				var open = this.isSideMenuOn();

				if (force === 2 || (!open && ((force !== undefined && force !== false) || force === undefined))) {
					menu.show();

					that.css3animate(els, {
						y: "-150px",
						time: $.ui.transitionTime,
						complete: function(canceled) {
							that.togglingSideMenu = false;

							if (callback) callback(true);

						}
					});
					that.css3animate(menu, {
						y: "0px",
						time: $.ui.transitionTime
					});

				} else if (force === undefined || (force !== undefined && force === false)) {

					that.css3animate(els, {
						y: "0",
						time: $.ui.transitionTime,
						complete: function(canceled) {


							that.togglingSideMenu = false;
							if (callback) callback(true);
							menu.hide();
						}
					});
					that.css3animate(menu, {
						y: "150px",
						time: $.ui.transitionTime
					});
				}
			};
		});
	}

	if (!$.ui) {
		$(document).ready(function() {
			wire8Tiles();
		});
	} else {
		wire8Tiles();
	}
})(af);