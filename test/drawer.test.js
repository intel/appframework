describe("drawerTests",function(){

    before(function(){
        $.afui.hasLaunched=false;
        $("#drawertest").remove();
        $(document.body).append("<div id='drawertest'></div>");

        $("#drawertest").append(__html__['test/fixtures/drawer.html']);
        $.afui.isLaunching=false;
        $.afui.hasLaunched=true;
        $.afui.launchCompleted=false;
        $.afui.defaultPanel=null;
        $.afui.activeDiv=null;
        $.afui.launch();

    });

    after(function(){
        $("#drawertest").remove();
    });
    it("should wait for afui read",function(done){
        $.afui.ready(function(){
            done();
        });
    });

    it("should show left menu by cover js call",function(done){
        //$("#leftcover").trigger("click");
        $.afui.drawer.show("#left","left","cover");
        setTimeout(function(){

            expect($("#left").hasClass("active")).to.be.true;
            done();
        },500);
    });

    it("should close the left menu",function(done){
        $.afui.drawer.hide('#left');
        setTimeout(function(){
            expect($("#left").hasClass("active")).to.be.false;
            done();
        },500);
    });
    it("should show left menu by push data directive",function(done){
        $("#leftpush").trigger("click");
        setTimeout(function(){
            expect($("#left").hasClass("active")).to.be.true;
            expect($($.afui.activeDiv).closest('.view').find('.slide-left-out').length===3).to.be.true
            done();
        },500);
    });

    it("should close the left menu by data directive",function(done){
        $("#hideactive").trigger("click");
        setTimeout(function(){
            expect($("#left").hasClass("active")).to.be.false;
            done();
        },500);
    });

    it("should show right menu by cover js call",function(done){
        //$("#leftcover").trigger("click");
        $.afui.drawer.show("#right","right","reveal");
        setTimeout(function(){
            expect($("#right").hasClass("active")).to.be.true;
            expect($($.afui.activeDiv).closest('.view').find('.slide-right-out').length===3).to.be.true
            done();
        },500);
    });

    it("should close the right menu",function(done){
        $("#hideright").trigger("click");
        setTimeout(function(){
            expect($("#right").hasClass("active")).to.be.false;
            done();
        },500);
    });

     it("should show left menu and auto hide",function(done){
        //$("#leftcover").trigger("click");
        $.afui.drawer.show("#left","left","reveal");
        setTimeout(function(){
            expect($("#left").hasClass("active")).to.be.true;
            $.afui.drawer.hide();
            setTimeout(function(){
                expect($("#left").hasClass("active")).to.be.false;
                done();
            },500);
        },500);
    });

    it("should show left",function(done){
        //$("#leftcover").trigger("click");
        $.afui.drawer.show("#left","left","reveal");
        setTimeout(function(){
                done();
        },500);
    });
    it("should hide left when showing right",function(done){
        //$("#leftcover").trigger("click");
        expect($("#left").hasClass("active")).to.be.true;
        $.afui.drawer.show("#right","right","reveal");
        setTimeout(function(){
                expect($("#right").hasClass("active")).to.be.true;
                expect($("#left").hasClass("active")).to.be.false;
                done();
        },500);
    });

     it("should  do nothing when already shown",function(done){
        //$("#leftcover").trigger("click");
        $.afui.drawer.show("#left","left","reveal");
        setTimeout(function(){
                $.afui.drawer.show("#left","left","reveal");
                done();
        },500);
    });
});