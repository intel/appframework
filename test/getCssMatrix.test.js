require("./chai.helper");
var sinon = require("sinon");
var domHelper = require("./dom.helper");

describe("getCssMatrix", function () {
    var stubMatrix = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };

    // matrix for 90deg rotate
    var stubWebkitCssMatrix = "matrix(0, 1, -1, 0, 0, 0)";

    // matrix for 180deg rotate
    var stubMsCssMatrix = "matrix(-1, 0, 0, -1, 0, 0)";

    // matrix for 270deg rotate
    var stubFooCssMatrix = "matrix(0, -1, 1, 0, 0, 0)";

    beforeEach(function () {
        domHelper(
            "<div id=\"moo\"></div>"
        );
    });

    it("should return a default matrix if no element argument passed", function () {
        var matrix = $.getCssMatrix();
        var expected = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        matrix.should.eql(expected);
    });

    it("should return a default matrix for an element if an exception occurs", function () {
        var stub = sinon.stub(window, "getComputedStyle").throws();
        var expected = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        var elt = document.getElementById("moo");
        var matrix = $.getCssMatrix(elt);
        matrix.should.eql(expected);
    });

});
