require("./chai.helper");
var domHelper = require("./dom.helper");

describe("replaceClass", function () {
    beforeEach(function () {
        domHelper(
            "<div data-role=\"foo1\" class=\"red\"></div>" +
            "<div data-role=\"foo2\" class=\"red\"></div>" +
            "<div data-role=\"foo3\" class=\"blue\"></div>"
        );
    });

    it("should replace a class on a single element", function () {
        var matching = $(".blue");
        matching.length.should.equal(1);
        matching.replaceClass("blue", "pink");

        var elt = document.querySelector("[data-role=\"foo3\"]");
        elt.getAttribute("class").should.equal("pink");
    });

    it("should replace a class on multiple elements", function () {
        var matching = $(".red");
        matching.length.should.equal(2);
        matching.replaceClass("red", "bronze");

        var elts = document.querySelectorAll(".bronze");
        elts.length.should.equal(2);

        for (var i = 0; i < elts.length; i += 1) {
            elts[i].getAttribute("class").should.equal("bronze");
        }

        var untouched = document.querySelector("[data-role=\"foo3\"]");
        untouched.getAttribute("class").should.equal("blue");
    });
});
