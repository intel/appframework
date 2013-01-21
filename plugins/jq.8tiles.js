
;(function($){
	"use strict";

	if(!$){
		throw "This plugin requires jqUi";
	}

	function wire8Tiles(){
		$.ui.ready(function(){
				
				//we need to make sure the menu button shows up in the bottom navbar
				$("#jQUi #navbar").append("<div id='metroMenu' onclick='$.ui.toggleSideMenu()'>•••</div>");
				var oldUpdate=$.ui.updateNavbarElements;
				$.ui.updateNavbarElements=function(){
					oldUpdate.apply($.ui,arguments);
					$("#jQUi #navbar").append("<div id='metroMenu' onclick='$.ui.toggleSideMenu()'>•••</div>");
				};
		});
	}

	if(!$.ui){
		$(document).ready(function(){
			wire8Tiles();
		});
	}
	else{
		wire8Tiles();
	}
})(jq);