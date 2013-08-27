require("./chai.helper");
var sinon = require("sinon");
var domHelper = require("./dom.helper");

describe("getCssMatrix", function () {
    var stubMatrix = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };

    beforeEach(function () {
        domHelper(
            "<div id=\"moo\"></div>"
        );

        window.WebKitCSSMatrix = null;
        window.MSCSSMatrix = null;
    });

    it("should return a default matrix if no element argument passed and no matrix function", function () {
        var matrix = $.getCssMatrix();
        var expected = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        matrix.should.eql(expected);
    });

    it("should return a matrix from a *Matrix function if present and no element", function () {
        window.WebKitCSSMatrix = function () {
            return stubMatrix;
        };

        var matrix = $.getCssMatrix();

        matrix.should.eql(stubMatrix);
    });

    it("should use the WebKitCSSMatrix function if present", function () {
        var elt = document.getElementById("moo");

        var stubStyle = {
            webkitTransform: "matrix(0, 1, -1, 0, 0, 0)"
        };

        var stub = sinon.stub(window, "getComputedStyle").returns(stubStyle);

        window.WebKitCSSMatrix = function () {
            return stubMatrix;
        };

        var matrix = $.getCssMatrix(elt);
        matrix.should.eql(stubMatrix);
        stub.restore();
    });

    it("should use the MSCSSMatrix function if present", function () {
        var elt = document.getElementById("moo");

        var stubStyle = {
            transform: "matrix(-1, 0, 0, -1, 0, 0)"
        };

        var stub = sinon.stub(window, "getComputedStyle").returns(stubStyle);

        window.MSCSSMatrix = function () {
            return stubMatrix;
        };

        var matrix = $.getCssMatrix(elt);
        matrix.should.eql(stubMatrix);
        stub.restore();
    });

    it("should manually parse CSS matrix if no *Matrix function", function () {
        var elt = document.getElementById("moo");

        $.feat.cssPrefix = "foo";

        var stubStyle = {
            fooTransform: "matrix(0, -1, 1, 0, 0, 0)"
        };

        var stub = sinon.stub(window, "getComputedStyle").returns(stubStyle);

        var expected = { a: 0, b: -1, c: 1, d: 0, e: 0, f: 0 };
        var matrix = $.getCssMatrix(elt);
        matrix.should.eql(expected);
        stub.restore();
    });

    it("should return a default matrix for an element if it has no transform property", function () {
        var stub = sinon.stub(window, "getComputedStyle").returns({});
        var expected = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
        var elt = document.getElementById("moo");
        var matrix = $.getCssMatrix(elt);
        matrix.should.eql(expected);
        stub.restore();
    });

});
