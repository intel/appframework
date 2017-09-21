describe("animation", function () {
    
    beforeEach(function () {
            $("#animmator").remove();
            $(document.body).append("<div id='animmator'></div>");
    });

    it("should be an object",function(){
        var foo=$("#animmator").animation();
        expect($.isObject(foo)).to.be.true;
    });

    it("should run an animation",function(done){        
        $("#animmator").animation().end(function(){
            done();
        }).run('asdf');
    });
    it("should run an animation with no callback",function(done){        
        $("#animmator").animation().run('asdf');
        done();
    });
    it("should keep the class",function(done){
        $("#animmator").animation().keep().end(function(){
            expect(this.classList.contains("asdf")).to.be.true;            
            done();
        }).run('asdf');
    });
    it("should keep the class",function(done){
        $("#animmator").animation().keep().end(function(){
            expect(this.classList.contains("asdf")).to.be.true;            
            done();
        }).run('asdf');
    });

    it("should rerun the animation",function(done){
        $("#animmator").animation().end(function(){            
            done();
        }).reRun('asdf');
    });

    it("should run the animation in reverse",function(done){
        $("#animmator").animation().reverse().end(function(){            
            done();
        }).run('asdf');
    });

    it("should run the slide-in animation",function(done){
        $("#animmator").animation().end(function(){            
            done();
        }).run('slide-in');
    });
    
});


