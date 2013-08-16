require("./chai.helper");
var domHelper = require("./dom.helper");

describe("each", function () {
    beforeEach(function () {
        domHelper(
            "<div data-alpha=\"a\"></div>" +
            "<div data-alpha=\"b\"></div>" +
            "<div data-alpha=\"c\"></div>"
        );
    });

    it("should iterate over members of an af collection", function () {
        var expected = "a,b,c";

        var collected = [];

        var count = 0;

        $("div").each(function (index, item) {
            count += 1;
            collected.push(item.getAttribute("data-alpha"));
        });

        var actual = collected.join(",");

        actual.should.equal(expected);
        count.should.equal(3);
    });

    it("should iterate over members of an af collection passed to $.each", function () {
        var expected = "a,b,c";

        var collected = [];

        var count = 0;

        $.each($("div"), function (index, item) {
            count += 1;

            // work around for bug #348
            if (typeof item === "object") {
                collected.push(item.getAttribute("data-alpha"));
            }
        });

        var actual = collected.join(",");

        actual.should.equal(expected);

        // bug https://github.com/01org/appframework/issues/348
        // count.should.equal(3);
    });

    it("should iterate over an array", function () {
        var arr = ["a", "b", "c"];

        var actual = "";

        $.each(arr, function (index, item) {
            actual += item;
        });

        var expected = "abc";

        actual.should.equal(expected);
    });
});
