
describe("vendorCss", function () {
    var stubMatrix = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };

    beforeEach(function () {
        $(document.body).append("<div id=\"moo\"></div>");
    });

    it("should set the webkit css value", function () {
        $.feat.cssPrefix ="Webkit";
        var el=document.getElementById("moo");
        var time="100ms";
        $(el).vendorCss("TransitionDuration",time);
        var val=el.style['WebkitTransitionDuration'];        
        val.should.eql(time);
    });

    it("should set the vendor neutral css value", function () {
        $.feat.cssPrefix ="Webkit";
        var el=document.getElementById("moo");
        var time="100ms";
        $(el).vendorCss("TransitionDuration",time);
        var val=el.style['transitionduration'];
        val.should.eql(time);
    });

    it("should not set the another vendor css value", function () {
        var el=document.getElementById("moo");
        var time="100ms";
        $(el).vendorCss("TransitionDuration",time);
        var val=el.style['MozTransitionDuration'];
        expect(val).to.be.undefined;
    });

    
});
