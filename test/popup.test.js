describe("popup",function(){
    before(function(){
        $("#popuptest").remove();
        $(document.body).append("<div id='popuptest'></div>");
        $("#popuptest").append(__html__['test/fixtures/popup.html']);
        $.afui.isLaunching=false;
        $.afui.hasLaunched=true;
        $.afui.launchCompleted=false;
        $.afui.defaultPanel=null;
        $.afui.activeDiv=null;
        $.afui.launch();
    });

    after(function(){
        $("#popuptest").remove();
    });


    it("should display a popup and dismiss it",function(done){

        var msg="Hello 1";
        $(document.body).popup({title:'Alert',id:'myTestPopup'});
        setTimeout(function(){
            $('#myTestPopup').length.should.eql(1);
            $("#myTestPopup").trigger("close");
            setTimeout(function(){
                $('#myTestPopup').length.should.eql(0);
                done();
            },300);

        },200);
    });

    it("should display a popup execute the done callback",function(done){

        var msg="Hello 1";
        var what=false;
        $(document.body).popup({
            id:"myTestPopup",
            title:"Alert! Alert!",
            message:"This is a test of the emergency alert system!! Don't PANIC!",
            cancelText:"Cancel me",
            cancelCallback: function(){console.log("cancelled");},
            doneText:"I'm done!",
            doneCallback: function(){what=true;},
            cancelOnly:false,
            doneClass:'button',
            cancelClass:'button',
            onShow:function(){},
            autoCloseDone:true, //default is true will close the popup when done is clicked.
            suppressTitle:false //Do not show the title if set to true
        });
        setTimeout(function(){
            $('#myTestPopup').length.should.eql(1);
            $("#myTestPopup #action").trigger("click");
            setTimeout(function(){
                $('#myTestPopup').length.should.eql(0);
                expect(what).to.be.true;
                done();
            },300);

        },200);
    });

 it("should display a popup execute the cancel callback",function(done){

        var msg="Hello 1";
        var what=false;
        $(document.body).popup({
            id:"myTestPopup",
            title:"Alert! Alert!",
            message:"This is a test of the emergency alert system!! Don't PANIC!",
            cancelText:"Cancel me",
            cancelOnly:true,
            cancelCallback: function(){what=true;},
            doneText:"I'm done!",
            doneCallback: function(){what=false;},
            cancelOnly:false,
            doneClass:'button',
            cancelClass:'button',
            onShow:function(){},
            autoCloseDone:true, //default is true will close the popup when done is clicked.
            suppressTitle:false //Do not show the title if set to true
        });
        setTimeout(function(){
            $('#myTestPopup').length.should.eql(1);
            $("#myTestPopup #cancel").trigger("click");
            setTimeout(function(){
                $('#myTestPopup').length.should.eql(0);
                expect(what).to.be.true;
                done();
            },300);

        },200);
    });

    it("should display a popup and dismiss it",function(done){

        var msg="Hello 1";
        $(document.body).popup({title:'Alert',id:'myTestPopup'});
        setTimeout(function(){
            $('#myTestPopup').length.should.eql(1);
            $("#myTestPopup").trigger("close");
            setTimeout(function(){
                $('#myTestPopup').length.should.eql(0);
                done();
            },300);

        },200);
    });

     it("should launch and dispatch ready function",function(done){

        $.afui.ready(function(){
            done();
        });
        $.afui.launch();

    });

    /// data directives
    /*
    it("should display a data directive popup and dismiss it",function(done){

        $("#popuptest a").trigger("click");
        setTimeout(function(){
            $('.afPopup').length.should.eql(1);
            $(".afPopup").trigger("close");
            setTimeout(function(){
                $('.afPopup').length.should.eql(0);
                done();
            },300);

        },200);
    });
*/
});