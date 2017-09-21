describe("desktopbrowsers",function(){

    var $item;
    var item;
    before(function(){
       $(document.body).append("<div id='desktopbrowsers'></div>");
       $item=$("#desktopbrowsers");
       item=$item.get(0);
    });

    function fakeMouseEvent(evt,target,x,y){
        var mousedownEvent = document.createEvent ("MouseEvent");
        mousedownEvent.initMouseEvent (evt, true, true, window, 0, 
                                    x,y,x,y,
                                    0,0,0,0, 
                                    0, null);
        target.dispatchEvent (mousedownEvent);
    }

    after(function(){
        $("#desktopbrowsers").remove();
    })

    it("mouse click should trigger a touchstart",function(done){
        $item.one("touchstart",function(){done();});
        fakeMouseEvent("mousedown",item,1,1);

    });
    it("should trigger touchmove from mousemove",function(done){
        $item.one("touchmove",function(){
            done();
        });
        fakeMouseEvent("mousemove",item,2,2);
    });
    it("should NOT trigger touchmove from mousemove with no movement",function(done){
        var bad=true;
        $item.one("touchmove",function(){
            bad=false;            
        });
        setTimeout(function(){
            expect(bad).to.be.true
            done();
        },100);
        fakeMouseEvent("mousemove",item,1,1);
    });
    it("should trigger touchend from mouseup event",function(done){
        $item.one("touchend",function(){done();});
        fakeMouseEvent("mouseup",item,1,1);
    });
    it("should NOT trigger touchmove from mousemove with no mousedown",function(done){
        var bad=true;
        $item.one("touchmove",function(){
            bad=false;            
        });
        setTimeout(function(){
            expect(bad).to.be.true
            done();
        },100);
        fakeMouseEvent("mousemove",item,1,1);
    });


});