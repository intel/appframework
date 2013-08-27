require("./chai.helper");
var domHelper = require("./dom.helper");

describe("addClass", function () {
    // set up the DOM and some global variables
    beforeEach(function () {
        domHelper(
            "<div id=\"single1\" class=\"red\"></div>" +
            "<div id=\"single2\" class=\"red\"></div>"
        );
    });

    it("should append a single new class", function () {
        $("#single1").addClass("black");
        $("#single1").attr("class").should.equal("red black");
    });

    it("should not append a class if it already exists on an element", function () {
        $("#single2").addClass("red");
        $("#single2").attr("class").should.equal("red");
    });
});
