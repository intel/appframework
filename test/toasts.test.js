describe("toast",function(){
    before(function(){
        $("#toasttest").remove();
        $(document.body).append("<div id='toasttest'></div>");
        $("#toasttest").append(__html__['test/fixtures/toast.html']);
        $.afui.isLaunching=false;
        $.afui.hasLaunched=true;
        $.afui.launchCompleted=false;
        $.afui.defaultPanel=null;
        $.afui.activeDiv=null;
        $.afui.launch();
    });

    after(function(){
        $("#toasttest").remove();
    });

    
    it("should display a toast and auto hide",function(done){

        var msg="Hello 1";
        $(document.body).toast({message:msg,delay:100});
        setTimeout(function(){
            $('.afToastContainer').find(".afToast div").html().should.eql(msg);
            setTimeout(function(){
                expect( $('.afToastContainer').find(".afToast").length===0).to.be.true;
                done();
            },500);
        },50);
    });
    it("should display a toast and stay open",function(done){

        var msg="Hello 2";
        $(document.body).toast({message:msg,autoClose:false});
        setTimeout(function(){
            $('.afToastContainer').find(".afToast div").html().should.eql(msg);
            setTimeout(function(){
                expect( $('.afToastContainer').find(".afToast").length===1).to.be.true;
                done();
            },500);
        },50);
    });

    it("should close a toast by clicking it",function(done){        
        expect( $('.afToastContainer').find(".afToast").length===1).to.be.true;
        $('.afToastContainer').find(".afToast").trigger("click");
        setTimeout(function(){
            expect( $('.afToastContainer').find(".afToast").length===0).to.be.true;
            done();
        },350);
    });
    it("should not animate hiding",function(done){
        var msg="Hello 2";
        $.os.android=true;
        $(document.body).toast({message:msg,autoClose:true,delay:100});
        setTimeout(function(){
            $('.afToastContainer').find(".afToast div").html().should.eql(msg);
            setTimeout(function(){
                expect( $('.afToastContainer').find(".afToast").length===0).to.be.true;
                $.os.android=false;
                done();
            },300);
        },50);
    });

    it("should be bottom center with warning class",function(done){
        var msg="Hello 6";        
        $(document.body).toast({message:msg,autoClose:true,delay:100,position:"bc",type:"warning"});
        setTimeout(function(){
            var elem=$('.afToastContainer').find(".afToast");
            expect(elem.hasClass("warning")).to.be.true;
            expect(elem.parent().hasClass("bc")).to.be.true;
            setTimeout(function(){                
                expect( $('.afToastContainer').find(".afToast").length===0).to.be.true;
                done();
            },500);
        },50);
    });

    it("should launch and dispatch ready function",function(done){

        $.afui.ready(function(){
            done();
        });        
        $.afui.launch();

    });
    it("should use the data directive for a toast",function(done){
        var item=$("#toasttest").find("a").eq(1);
        item.trigger("click");

        setTimeout(function(){
            $('.afToastContainer').find(".afToast div").html().should.eql(item.attr("data-message"));
            var elem=$('.afToastContainer').find(".afToast");
            expect(elem.hasClass(item.attr("data-type"))).to.be.true;
            expect(elem.parent().hasClass(item.attr("data-position"))).to.be.true;
            $('.afToastContainer').find(".afToast div").trigger("click");
            setTimeout(function(){
                expect( $('.afToastContainer').find(".afToast").length===0).to.be.true;
                done();
            },500);
        },50);
    })

});