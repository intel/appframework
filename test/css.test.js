require("./chai.helper");
var domHelper = require("./dom.helper");

describe("css", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"no1\"></div>"
        );
    });

    it("should read a CSS property from an element", function () {
        var expected = "green";

        document.getElementById("no1").style["background-color"] = expected;

        var actual = $("#no1").css("background-color");
        actual.should.equal(expected);
    });

    it("should set a CSS property on an element", function () {
        var expected = "green";

        $("#no1").css("background-color", expected);

        var actual = document.getElementById("no1").style["background-color"];

        actual.should.equal(expected);
    });

    it("should write multiple CSS properties to an element", function () {
        $("#no1").css({
          "height": "100px",
          "background-color": "#CCC"
        });

        var elt = document.getElementById("no1");

        elt.style["height"].should.equal("100px");
        elt.style["background-color"].should.equal("#CCC");
    });
});
