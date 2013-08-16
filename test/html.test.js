require("./chai.helper");
var domHelper = require("./dom.helper");

describe("html", function () {
    var expected = "<span>I am inside no2</span><span>me too</span>";

    beforeEach(function () {
        domHelper(
            "<div id=\"no1\"></div>" +
            "<div id=\"no2\">" + expected + "</div>"
        );
    });

    it("should set HTML inside an element", function () {
        var text = "this is a test";
        $("#no1").html(text);
        document.getElementById("no1").innerHTML.should.equal(text);
    });

    it("should get HTML from inside an element", function () {
        $("#no2").html().should.equal(expected);
    });
});
