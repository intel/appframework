describe("actionsheet", function () {
    

    
    it("should display the action sheet from an html string",function(done){
        var sheet=$(document.body).actionsheet('<a  >Back</a><a  onclick="alert(\'hi\');" >Show Alert 3</a><a  onclick="alert(\'goodbye\');">Show Alert 4</a>');
        $("#af_actionsheet").css("display").should.eql("block");
        setTimeout(function(){
            $("#af_actionsheet a").length.should.eql(4);
            sheet.hideSheet();
            setTimeout(function(){
                $("#af_actionsheet").length.should.eql(0);
                done();
            },400);
        },400);
    });
    it("should display the action sheet from an array of objects",function(done){
        var sheet=$(document.body).actionsheet(
        [{
            text: 'back',
            cssClasses: 'red',
            handler: function () {
                $.ui.goBack();
            }
        },  {
            text: 'show alert 6',
            cssClasses: '',
            handler: function () {
                alert("goodbye");
            }
        }]);
        $("#af_actionsheet").css("display").should.eql("block");
        setTimeout(function(){
            $("#af_actionsheet a").length.should.eql(3);
            sheet.hideSheet();
            setTimeout(function(){
                $("#af_actionsheet").length.should.eql(0);
                done();
            },400);
        },400);
    });
    it("should dismiss the action sheet from an item click",function(done){
        var sheet=$(document.body).actionsheet(
        [{
            text: 'back',
            cssClasses: 'red',
            handler: function () {
                done();
            }
        },  {
            text: 'show alert 6',
            cssClasses: ''
        }]);
        $("#af_actionsheet").css("display").should.eql("block");
        setTimeout(function(){
            $("#af_action_mask").trigger("click");
            $("#af_actionsheet a").eq(0).trigger("click");
            //trigger a click on the mask            
        },400);
    });
});
