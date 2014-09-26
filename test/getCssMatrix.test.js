
describe("getCssMatrix", function () {
    var stubMatrix = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };
    var oldWK=window.WebKitCSSMatrix;
    var oldMS=window.MSCSSMatrix;
    beforeEach(function () {
        $(document.body).append("<div id=\"moo\"></div>");
        
    });
    afterEach(function(){
        window.WebKitCSSMatrix=oldWK;
        window.MSCSSMatrix=oldMS;
    })

    it("should return a default matrix if no element argument passed and no matrix function", function () {
        window.WebKitCSSMatrix=null;
        var matrix = $.getCssMatrix();
        var expected = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        matrix.should.eql(expected);
    });

    it("should return a matrix from a *Matrix function if present and no element", function () {
        var matrix = $.getCssMatrix();
        matrix.should.eql(new WebKitCSSMatrix());
    });


    it("should use the MSCSSMatrix function if present", function () {
        var elt = document.getElementById("moo");
       
        var matrix = $.getCssMatrix(elt);
                var computedStyle = window.getComputedStyle(elt);

        var transform = computedStyle.webkitTransform ||
                        computedStyle.transform ||
                        computedStyle[$.feat.cssPrefix + "Transform"];
        

        matrix.should.eql(new WebKitCSSMatrix(transform));        
    });


    it("should return a matrix hacked from the stylesheet", function () {
        window.WebKitCSSMatrix=null;
        $("#moo").cssTranslate("1px,1px");
        var ele=document.getElementById("moo");
        var matrix=$.getCssMatrix(ele);
        var expected = { a: 1, b: 0, c: 0, d: 1, e: 1, f: 1 };
        matrix.should.eql(expected);

        var matrix=$.getCssMatrix();
        var expected = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0};
        matrix.should.eql(expected);
    });


});
