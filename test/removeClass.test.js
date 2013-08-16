require("./chai.helper");
var domHelper = require("./dom.helper");

describe("removeClass", function () {
    // set up the DOM and some global variables
    beforeEach(function () {
        domHelper(
            "<div id=\"single\" class=\"red\"></div>" +
            "<div id=\"multiple1\" class=\"red green\"></div>" +
            "<div id=\"multiple2\" class=\"orange green\"></div>"
        );
    });

    it("should remove a single class from an element", function () {
        $("#single").removeClass("red");
        ($("#single").attr("class") === null).should.be.true;
    });

    it("should leave non-matching classes on an element", function () {
        $("#multiple1").removeClass("red");
        $("#multiple1").attr("class").should.equal("green");
    });

    it("should not remove any classes if element has none which match", function () {
        $("#multiple2").removeClass("red");
        $("#multiple2").attr("class").should.equal("orange green");
    });

    it("should remove multiple classes from an element", function () {
        $("#multiple1").removeClass("red green");
        ($("#multiple1").attr("class") === null).should.be.true;
    });

    it("should remove classes from multiple elements", function () {
        var greenDivs = $(".green");
        greenDivs.removeClass("red green");
        (greenDivs[0].getAttribute("class") === null).should.be.true;
        greenDivs[1].getAttribute("class").should.equal("orange");
    });
});
