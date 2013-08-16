require("./chai.helper");
var domHelper = require("./dom.helper");

describe("text", function () {
    var expected = "I am the text for no2";

    beforeEach(function () {
        domHelper(
            "<div id=\"no1\"></div>" +
            "<div id=\"no2\">" + expected + "</div>"
        );
    });

    it("should set text inside an element", function () {
        var text = "this is a test";
        $("#no1").text(text);
        document.getElementById("no1").textContent.should.equal(text);
    });

    it("should get text from inside an element", function () {
        $("#no2").text().should.equal(expected);
    });
});
