describe("cssTranslate", function () {
    var stubMatrix = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };

    beforeEach(function () {
        $(document.body).append("<div id=\"moo\"></div>");


    });

    it("should set the webkit css value", function () {
        $.feat.cssPrefix ="Webkit";
        var el=document.getElementById("moo");
        var time="100ms";
        $(el).cssTranslate("100px,0");
        var style=el.style["WebkitTransform"];
        expect(style==="translate3d(100px, 0px, 0px)").is.true;

    });

    it("should set the proper x/y coords", function () {
        $.feat.cssPrefix ="Webkit";
        var el=document.getElementById("moo");
        var time="100ms";
        $(el).cssTranslate("100px,100px");
        var style=el.style["WebkitTransform"];
        expect(style==="translate3d(100px, 100px, 0px)").is.true;
    });



   
    
});
