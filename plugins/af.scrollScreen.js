/**
 * af.scrollScreen - Widget to hide the header/footer when scrolling to go "full screen"
 * Copyright 2013 - Intel
 */;
(function($) {
    "use strict";

    if (!$||!$.ui) {
        throw "This plugin requires App Framework UI";
    }

    $.extend($.ui,{
        _hideHeaderOnScroll:false,
        _hideFooterOnScroll:false,
        hideHeaderOnScroll:function(){
            console.log(this);
            this._hideHeaderOnScroll=true;
            this.setupScrollStart();
        },
        hideFooterOnScroll:function(){
            this._hideFooterOnScroll=true;
            this.setupScrollStart();
        }
    });


    $.ui.ready(function(){

        var headerShown=false;
        var footerShown=false;
        var startY=0;
        var prevY=0;
        var hdrHeight;
        var ftrHeight;        
        var scrollSetup=false;

        $.ui.setupScrollStart=function(){
            if(scrollSetup) return;
            $.bind($.touchLayer,"scrollstart",initScrollStart);
            $.bind($.touchLayer,"scroll",trackScroll);
            scrollSetup=true;
        };
        $.ui.removeScrollStart=function(){
            $.unbind($.touchLayer,"scrollstart",trackScroll);
        };

        var initScrollStart = function(el,pos){
            startY=null;
            prevY=0;
        };
        var trackScroll=function(pos){

            if(!startY) startY=pos.y;

            //scrolling down
            if(pos.y<prevY&&((Math.abs(pos.y)-Math.abs(startY))>80))
            //&&!headerShown)
            {            
                if($.ui._hideHeaderOnScroll&&!headerShown){
                    headerShown=true;
                    var hdr=$("#header");
                    hdrHeight=hdr.css("height");
                    hdr.vendorCss("TransitionDuration","200ms");
                    hdr.css("height","0px");
                    startY=pos.y;
                }
                if($.ui._hideFooterOnScroll&&!footerShown){
                    footerShown=true;
                    var ftr=$("#navbar");
                    ftrHeight=ftr.css("height");
                    ftr.vendorCss("TransitionDuration","200ms");
                    ftr.css("height","0px");
                    startY=pos.y;
                }
            }

            if(pos.y>prevY&&(Math.abs(pos.y)-Math.abs(startY)))
            {
                if(headerShown&&$.ui._hideHeaderOnScroll){
                    headerShown=false;
                    var hdr=$("#header");
                    hdr.css("height",hdrHeight);
                    startY=pos.y;
                }
                if(footerShown&&$.ui._hideFooterOnScroll){
                    footerShown=false;
                    var ftr=$("#navbar");
                    ftr.css("height",ftrHeight);
                    startY=pos.y;   
                }
            }



            prevY=pos.y;
        };


        var oldLoader=$.ui.loadContent;

        $.ui.loadContent=function(){
            if(headerShown)
                $("#header").css("height",hdrHeight);
            if(footerShown)
                $("#navbar").css("height",ftrHeight);
            $("#header").vendorCss("TransitionDuration","");
            oldLoader.apply($.ui,arguments);
            headerShown=false;
            footerShown=false;
        };
        $.ui.hideHeaderOnScroll();
        $.ui.hideFooterOnScroll();
    });
})(af);