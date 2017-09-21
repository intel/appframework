describe("afui", function () {
    before(function(){
        $("#afuitest").remove();
        $(document.body).append("<div id='afuitest'></div>");

        $("#afuitest").append(__html__['test/fixtures/afui.html']);
        $.afui.isLaunching=false;
        $.afui.hasLaunched=true;
        $.afui.launchCompleted=false;
        $.afui.defaultPanel=null;
        $.afui.activeDiv=null;
    });

    after(function(){
        $("#afuitest").remove();
    })
    it("should not be launched", function () {

        expect($.afui.launchCompleted).to.be.false;
    });

    it("should launch and dispatch ready function",function(done){

        $.afui.ready(function(){
            done();
        })
        $.afui.launch();

    });
    it("should be launched",function(){
        expect($.afui.launchCompleted).to.be.true;
    });

    it("should have an active view",function(){
        $("#afuitest").find(".view.active").length.should.equal(1);
    });
    it("should have an active panel",function(){
        $("#afuitest").find(".panel.active").length.should.equal(1);
    });
    //View testing
    it("should have a title",function(){
        var item=$("#afuitest").find(".view.active header h1");
        item.html().should.eql("hello");
    });
    it("should change the title by string",function(){
        var title="New Title";
        $.afui.setTitle(title);
        var item=$("#afuitest").find(".view.active header h1");
        item.html().should.eql(title);
    });
    it("should change the title by attribute",function(){
        var elem=$("<div data-title='New Title'></div>");
        $.afui.setTitle(elem);
        var item=$("#afuitest").find(".view.active header h1");
        item.html().should.eql('New Title');
    });

    it("should get the current title",function(){
        $.afui.getTitle().should.eql("New Title");
    });

    it("should load a panel",function(done){
        $.afui.loadContent("#foobar");
        setTimeout(function(){
            $.afui.activeDiv.should.eql(document.getElementById("foobar"));
            $("#afuitest").find(".view.active header h1").html().should.eql("foobar");
            done();
        },500);
    });
    it("should load a panel from a footer link",function(done){
        $("#afuitest footer a").eq(0).trigger("click");
        setTimeout(function(){
            $.afui.activeDiv.should.eql(document.getElementById("hello"));
            $("#afuitest").find(".view.active header h1").html().should.eql("hello");
            done();
        },500);
    });
    it("should go back in the view history stack",function(done){
        $.afui.goBack();
        setTimeout(function(){
            $.afui.activeDiv.should.eql(document.getElementById("foobar"));
            $("#afuitest").find(".view.active header h1").html().should.eql("foobar");
            done();
        },500);
    });
    it("should load a panel from a footer link",function(done){
        $("#afuitest footer a").eq(0).trigger("click");
        setTimeout(function(){
            $.afui.activeDiv.should.eql(document.getElementById("hello"));
            $("#afuitest").find(".view.active header h1").html().should.eql("hello");
            done();
        },500);
    });
     it("should go back in the view history stack",function(done){
        window.history.go(-1);
        setTimeout(function(){
            $.afui.activeDiv.should.eql(document.getElementById("foobar"));
            $("#afuitest").find(".view.active header h1").html().should.eql("foobar");
            done();
        },500);
    });
    it("should not go back with an empty history",function(done){
        $.afui.clearHistory();
        setTimeout(function(){
            $.afui.activeDiv.should.eql(document.getElementById("foobar"));
            $("#afuitest").find(".view.active header h1").html().should.eql("foobar");
            done();
        },500);
    });
    //Test animating the header
    it("should animate the header",function(done){
         $.afui.animateHeader(true);
         var div="hello";
         $.afui.loadContent("#"+div);
         var hdr=$($.afui.activeDiv).closest('.view').children("header");
         hdr.find("h1").eq(0).html().should.eql("hello");
         hdr.find("h1").length.should.eql(2);
         hdr.find("h1").eq(1).html().should.eql("foobar");
         //wait for the animation to finish
         setTimeout(function(){
            done();
         },550);

    });
    it("should test animate header functions",function(){
        var title=$.afui.getTitle();
        $.afui.setTitle();
        $.afui.getTitle().should.eql(title);
        //shouldn't animate
        $.afui.setTitle("foobar",null,null,true);
        var hdr=$($.afui.activeDiv).closest('.view').children("header");
        hdr.find("h1").eq(0).html().should.eql("foobar");
        hdr.find("h1").length.should.eql(1);
    });
    it("should disable animating the headers",function(){
        $.afui.animateHeader(false);
         var div="foobar";
         $.afui.loadContent("#"+div);
         var hdr=$($.afui.activeDiv).closest('.view').children("header");
         hdr.find("h1").eq(0).html().should.eql("foobar");
         hdr.find("h1").length.should.eql(1);
    });

    //Should load a new view
    it("Should load a new view",function(done){
        var view=$($.afui.activeDiv).closest('.view');
        view.find("footer a").eq(2).trigger("click");
        setTimeout(function(){
            var newView=$($.afui.activeDiv).closest('.view');

            expect(view.get(0)).to.not.eql(newView.get(0));
            done();
        },300);
        done();
    });

    it("should click a tab bar and keep the state",function(done){
        $(".tabbed .button").eq(1).trigger("click");
        setTimeout(function(){
            expect($(".tabbed .button").eq(1).hasClass('pressed')).to.be.true;
            done();
        },100);
    });
    it("should disable tab bar",function(done){
        $.afui.disableTabBar();
        $(".tabbed .button").eq(1).trigger("click");
        setTimeout(function(){
            //expect($(".tabbed .button").eq(1).hasClass('pressed')).to.be.false;
            done();
        },100);
    });

    it("should update a badge",function(){
        $.afui.updateBadge("#badgeTest","1","bl","green");

        $("#badgeTest").html().should.eql('3<span class="af-badge bl" style="background: green;">1</span>');
    })
});