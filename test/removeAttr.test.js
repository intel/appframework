require("./chai.helper");
var domHelper = require("./dom.helper");

describe("removeAttr", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"no1\" data-foo=\"huha\" data-bar=\"muma\"></div>" +
            "<div id=\"no2\" data-foo=\"huha\" data-bar=\"rura\"></div>" +
            "<div id=\"no3\" data-foo=\"huha\" data-bar=\"pupa\"></div>"
        );
    });

    it("should remove a single attribute", function () {
        $("div").removeAttr("data-bar");

        var divs = document.querySelectorAll("div");

        for (var i = 0; i < divs.length; i += 1) {
            divs[i].getAttribute("data-foo").should.equal("huha");
            (divs[i].getAttribute("data-bar") === null).should.be.true;
        }
    });

    it("should remove multiple attributes", function () {
        $("div").removeAttr("data-foo data-bar");

        var divs = document.querySelectorAll("div");

        for (var i = 0; i < divs.length; i += 1) {
            (divs[i].getAttribute("data-bar") === null).should.be.true;
            (divs[i].getAttribute("data-foo") === null).should.be.true;
        }
    });
});
