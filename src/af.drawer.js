/**
 * af.drawer
 * @copyright Intel 2014
 *
 */

(function($){
    "use strict";
    var activePosition=null;
    var activeEl;
    function Drawer(){
        return this;
    }

    var transitionTypes = {
        push:function(elem,reverse,position){
            var item=$(elem).closest(".view").children().filter(":not(nav):not(aside)");
            position=position||activePosition;
            for(var i=0;i<item.length;i++){
                var anim=$(item[i]).show().animation();
                if(reverse){
                    anim.remove("slide-"+position+"-out").reverse();
                }
                else
                    anim.keep();

                anim.run("slide-"+position+"-out");
            }

        },
        cover:function(){},
        reveal:function(elem,reverse){
            return this.push(elem,reverse);
        }
    };


    Drawer.prototype= {
        defaultTransition:"slide",
        defaultAnimation:"cover",
        isTransitioning:false,
        autoHide:function(event){
            event.preventDefault();
            this.hide();
        },
        checkViewToClose:function(e){
            this.autoHide(e);
        },
        autoHideCheck:null,
        selfCheckViewToClose:null,
        show:function(id,position,animation){
            if(this.isTransitioning) return;
            var self=this;
            activePosition=position==="right"?"right":"left";
            animation=transitionTypes[animation]?animation:this.defaultAnimation;
            var currEl=document.getElementById(id.replace("#",""));
            if(!currEl) return;
            //Let"s find the view
            activeEl=currEl;
            if(currEl.classList.contains("active")) {
                return;
            }
            this.isTransitioning=true;
            this.autoHideCheck=this.autoHide.bind(this);
            $(currEl).closest(".view").children().filter(":not(nav):not(aside)").off("touchstart",this.autoHideCheck);
            currEl.classList.add(activePosition);
            //Let"s remove the other animation types
            var anim=$(currEl).show();
            var other=activePosition==="right"?"left":"right";


            if($(currEl).closest(".view").find(".slide-"+other+"-out").length>0){
                $(currEl).closest(".view").find(".slide-"+other+"-out").removeClass("slide-"+other+"-out");
                $(currEl).closest(".view").find("aside.active, nav.active").removeClass("left right active").hide();
            }
            if(animation!=="reveal"){
                anim.css("zIndex","999").animation().run("slide-"+activePosition+"-in").end(function(){
                    this.classList.add("active");
                    self.isTransitioning=false;
                });
            }
            else {
                anim.animation().run("blank").end(function(){
                    $(this).css("zIndex","999");
                    this.classList.add("active");
                    self.isTransitioning=false;
                });
            }
            currEl.activeAnimation=animation;
            currEl.activePosition=activePosition;
            currEl.toggled=true;
            transitionTypes[animation](currEl,false);
            //fix bug with synthetic events bubbling up
            setTimeout(function(){
                $(currEl).closest(".view").children().filter(":not(nav):not(aside)").on("touchstart",self.autoHideCheck);
            });
            this.selfCheckViewToClose=self.checkViewToClose.bind(this);
            $(currEl).bind("nestedviewunload",this.selfCheckViewToClose);
        },
        hide:function(id,position){
            if(this.isTransitioning) return;
            var self=this;
            var currEl=id&&document.getElementById(id.replace("#",""))||activeEl;
            $(currEl).unbind("nestedviewunload",this.selfCheckViewToClose);

            if(!currEl||!currEl.toggled) return;
            $(currEl).closest(".view").children().filter(":not(nav):not(aside)").off("touchstart",this.autoHideCheck);
            var activePosition=position||currEl.activePosition;
            var anim=$(currEl).animation();
            if(currEl.activeAnimation==="reveal")
                $(currEl).css("zIndex","1");
            var theTransition=currEl.activeAnimation==="reveal"?"blank":"slide-"+activePosition+"-in";
            anim.reverse().reRun(theTransition).end(function(){
                this.classList.remove("active");
                this.classList.remove(activePosition);
                this.style.display="none";
                this.style.zIndex="";
                self.isTransitioning=false;
            });


            if(transitionTypes[currEl.activeAnimation]){
                transitionTypes[currEl.activeAnimation](currEl,true);
            }
            currEl.toggled=false;
            activeEl=null;
        }
    };

    $.afui.drawer =new Drawer();



    //Register the handler for opening

    $.afui.registerDataDirective("[data-left-menu]:not([data-menu-close]),[data-right-menu]:not([data-menu-close])",function(item){
        var $item=$(item);
        var position=$item.attr("data-left-menu")?"left":"right";
        var obj=position==="left"?$item.attr("data-left-menu"):$item.attr("data-right-menu");
        var transition=$item.attr("data-transition");
        this.drawer.show(obj,position,transition);
    });

    //Register the handler for closing
    $.afui.registerDataDirective("[data-menu-close]",function(item){
        var $item=$(item);
        var position=null;
        if($item.attr("data-left-menu"))
            position="left";
        if($item.attr("data-right-menu"))
            position="right";
        var obj=position==="left"?$item.attr("data-left-menu"):$item.attr("data-right-menu");
        if(!obj)
        {
            //Am i dismissing from a drawer?
            obj=$(item).closest("nav").prop("id");
            //let"s find the visible item in the container
            if(!obj||obj.length===0)
                obj=$(item).closest(".view").find("nav.active,aside.active").prop("id");
        }
        this.drawer.hide(obj,position);
    });

})(jQuery);