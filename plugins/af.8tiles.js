/**
 * af.8tiles - Provides a WP8 theme and handles showing the menu
 * Copyright 2012 - Intel
 * This plugin is meant to be used inside App Framework UI
 */
 /* global af*/

(function($) {
    "use strict";

    if (!$) {
        throw "This plugin requires AFUi";
    }
    function wire8Tiles() {
        $.ui.isWin8 = true;
        if (!$.os.ie) return;
        if (!$.ui.isSideMenuEnabled()) return;

        $.ui.ready(function() {
            if($.ui.tilesLoaded) return;
            $.ui.tilesLoaded=true;
            if(window.innerWidth>$.ui.handheldMinWidth) return true;

            if ($.ui.slideSideMenu) $.ui.slideSideMenu = false;
            //we need to make sure the menu button shows up in the bottom navbar
            $.query("#afui #navbar footer").append("<a id='metroMenu' onclick='$.ui.toggleSideMenu()'>•••</a>");
            var tmpAnchors = $.query("#afui #navbar").find("a").not(".button");
            if (tmpAnchors.length > 0) {
                tmpAnchors.data("ignore-pressed", "true").data("resetHistory", "true");
                var width = parseFloat(100 / tmpAnchors.length);
                tmpAnchors.css("width", width + "%");
            }
            var oldUpdate = $.ui.updateNavbarElements;
            $.ui.updateNavbarElements = function() {
                oldUpdate.apply($.ui, arguments);
                if ($.query("#afui #navbar #metroMenu").length === 1) return;
                $.query("#afui #navbar footer").append("<a id='metroMenu' onclick='$.ui.toggleSideMenu()'>•••</a>");
            };
            $.ui.isSideMenuOn = function() {

                var menu = parseInt($.getCssMatrix($("#navbar")).f,10) < 0 ? true : false;
                return this.isSideMenuEnabled() && menu;
            };
            $.ui.toggleRightSideMenu=function(force,callback,time) {
                if ((!this.isAsideMenuEnabled()) || this.togglingAsideMenu) return;
                var aside=true;
                if(!aside&&!this.isSideMenuEnabled()) return;
                if(!aside&&$.ui.splitview) return;
                var that = this;
                var menu=$("#menu");
                var asideMenu= $.query("#aside_menu");
                var els = $.query("#content,  #header, #navbar");
                var panelMask = $.query(".afui_panel_mask");
                time = time || this.transitionTime;
                var open = $("#aside_menu").css("display")==="block";
                var toX=aside?"-"+that.sideMenuWidth:that.sideMenuWidth;
                // add panel mask to block when side menu is open for phone devices
                if(panelMask.length === 0 && window.innerWidth < $.ui.handheldMinWidth){
                    els.append("<div class='afui_panel_mask'></div>");
                    panelMask = $.query(".afui_panel_mask");
                    $(".afui_panel_mask").bind("click", function(){
                        $.ui.toggleSideMenu(false, null, null, aside);
                    });
                }
                //Here we need to check if we are toggling the left to right, or right to left
                var menuPos=this.getSideMenuPosition();
                if(open&&!aside&&menuPos<0)
                    open=false;
                else if(open&&aside&&menuPos>0)
                    open=false;


                if (force === 2 || (!open && ((force !== undefined && force !== false) || force === undefined))) {
                    this.togglingSideMenu = true;
                    if(!aside)
                        menu.show();
                    else
                        asideMenu.show();
                    that.css3animate(els, {
                        x: toX,
                        time: time,
                        complete: function(canceled) {
                            that.togglingSideMenu = false;
                            els.vendorCss("Transition", "");
                            if (callback) callback(canceled);
                            if(panelMask.length !== 0 && window.innerWidth < $.ui.handheldMinWidth){
                                panelMask.show();
                            }
                        }
                    });

                } else if (force === undefined || (force !== undefined && force === false)) {
                    this.togglingSideMenu = true;
                    that.css3animate(els, {
                        x: "0px",
                        time: time,
                        complete: function(canceled) {
                            // els.removeClass("on");
                            els.vendorCss("Transition", "");
                            els.vendorCss("Transform", "");
                            that.togglingSideMenu = false;
                            if (callback) callback(canceled);
                            if(!$.ui.splitview)
                                menu.hide();
                            asideMenu.hide();
                            if(panelMask.length !== 0 && window.innerWidth < $.ui.handheldMinWidth){
                                panelMask.hide();
                            }
                        }
                    });
                }
            };
            $.ui.toggleLeftSideMenu = function(force, callback) {
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
                        complete: function() {
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
                        complete: function() {
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
        $.ui.ready(function(){
            wire8Tiles();
        });
    }
})(af);
