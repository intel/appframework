require("./chai.helper");
var domHelper = require("./dom.helper");

describe("removeProp", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"no1\"></div>" +
            "<div id=\"no2\"></div>" +
            "<div id=\"no3\"></div>"
        );

        $("div").prop("data-jig", "fancy");
        $("div").prop("data-prance", "hurray");

        // check props are set
        var count = 0;

        $("div").each(function (index, item) {
            count += 1;
            $(item).prop("data-jig").should.equal("fancy");
            $(item).prop("data-prance").should.equal("hurray");
        });

        count.should.equal(3);
    });

    it("should remove a property from elements", function () {
        var count = 0;

        // check one prop is removed
        $("div").removeProp("data-jig");

        $("div").each(function (index, item) {
            count += 1;
            ($(item).prop("data-jig") === undefined).should.be.true;
            $(item).prop("data-prance").should.equal("hurray");
        });

        count.should.equal(3);
    });

    it("should remove multiple properties on elements when passed an object", function () {
        var count = 0;

        // check all props are removed
        $("div").removeProp("data-jig data-prance");

        $("div").each(function (index, item) {
            count += 1;
            ($(item).prop("data-jig") === undefined).should.be.true;
            ($(item).prop("data-prance") === undefined).should.be.true;
        });

        count.should.equal(3);
    });
});
