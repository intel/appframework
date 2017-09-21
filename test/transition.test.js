describe("transition", function () {
    
    beforeEach(function () {
            $(document.body).remove("#transitioner");
            $(document.body).append("<div id='transitioner'></div>");
    });

    it("should be an object",function(){
        var foo=$("#transitioner").transition();
        expect($.isObject(foo)).to.be.true;
    });

    it("should run a transition with a callback but not keep the transition",function(done){        
        $("#transitioner").transition().end(function(){
            var matrix=($.getCssMatrix(this));
            matrix.m22.should.eql(1.2);
        }).run('scale(1.2)',"200ms");
         setTimeout(function(){
            var matrix=($.getCssMatrix($("#transitioner").get(0)));
            matrix.m22.should.eql(1);
            done();
        },300);
    });
    it("should run a transition with no callback",function(done){        
        $("#transitioner").transition().run('scale(1.2)',"200ms");
        setTimeout(function(){
            var matrix=($.getCssMatrix($("#transitioner").get(0)));
            matrix.m22.should.eql(1);
            done();
        },300);
    });
    
    it("should keep the transition",function(done){
        $("#transitioner").transition().keep().run('scale(1.2)',"200ms");
        setTimeout(function(){
            var matrix=($.getCssMatrix($("#transitioner").get(0)));
            matrix.m22.should.eql(1.2);
            done();
        },300);
    });
    
});


