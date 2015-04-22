describe("lockscreen",function(){
    before(function(){
      $("#lockScreen").remove();
    });

    afterEach(function(){
       $("#lockScreen").remove();

       $(document.body).lockScreen().hide();
    });


    it("should display a lockscreen",function(done){

        $(document.body).lockScreen().show()

        setTimeout(function(){
            $('#lockScreen').length.should.eql(1);
            $(document.body).lockScreen().hide();
            done();
        },200);
    });

     it("should fail the password",function(done){

        var lock=$(document.body).lockScreen();
        lock.validatePassword=function(pass){
            pass=parseInt(pass,10);
            pass.should.eql(2222);
            return pass==1111;
        }
        lock.show();
        setTimeout(function(){
            //$('#lockScreen').length.should.eql(1);
            var key=$('#lockScreen [data-key="2"]');
            key.trigger("click");
            key.trigger("click");
            key.trigger("click");
            key.trigger("click");
            $("#lockScreen .error").css("visibility").should.eql("visible");
            done();
        },100);
    });

    it("should accept the password and close",function(done){

        var lock=$(document.body).lockScreen();
        lock.validatePassword=function(pass){
            pass=parseInt(pass,10);
            pass.should.eql(1111);
            return pass.should.eql(1111);
        }
        lock.show();
        setTimeout(function(){
            var key=$('#lockScreen [data-key="1"]');
            key.trigger("click");
            key.trigger("click");
            key.trigger("click");
            key.trigger("click");
            setTimeout(function(){
                var visibility=$("#lockScreen .error").css("visibility");
                expect(visibility).to.be.undefined;
                done();
            },50);
        },300);
    });

});