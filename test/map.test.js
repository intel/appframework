require("./chai.helper");
var domHelper = require("./dom.helper");

describe("map", function () {
    it("should apply a function to each element in a collection", function () {
        domHelper("<div id=\"div1\"></div>" +
                  "<div id=\"div2\"></div>" +
                  "<div id=\"div3\"></div>");

        var expected = "div1,div2,div3";

        // test $(selector).map(callback)
        var actual1 = $("div").map(function (index, elt) {
            return elt.id;
        }).get().join(",");

        // test $.map(collection, callback)
        var count = 0;
        var actual2 = $.map($("div"), function (elt, index) {
            count += 1;
            return elt.id;
        }).join(",");

        // bug https://github.com/01org/appframework/issues/348
        // count.should.equal(3);

        actual1.should.equal(expected);
        actual2.should.equal(expected);
    });

    it("should apply a function to elements in an array", function () {
        var expected = "a0,b1,c2";

        var count = 0;

        var actual = $.map(["a", "b", "c"], function (elt, index) {
            count += 1;
            return elt + index;
        }).join(",");

        actual.should.equal(expected);
        count.should.equal(3);
    });

    it("should ignore undefined values returned by the callback", function () {
        var expected = "a,c";

        var actual = $.map(["a", "b", "c"], function (elt) {
            if (elt !== "b") {
                return elt;
            }
            else {
                return undefined;
            }
        }).join(",");

        actual.should.equal(expected);
    });
});
