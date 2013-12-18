require("./chai.helper");
var domHelper = require("./dom.helper");

describe("attr", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"single1\">" +
            "<span>should not be selected when inside context</span>" +
            "</div>" +
            "<div id=\"single2\"></div>" +
            "<span>this should also not be selected</span>"
        );
    });

    it("should select a single element by ID", function () {
        var elt = $("#single1");
        elt.size().should.equal(1);
        elt.get(0).id.should.equal("single1");
    });

    it("should select multiple elements", function () {
        var elts = $("div");
        elts.size().should.equal(2);
    });

    it("should wrap native DOM elements", function () {
        var elt = document.createElement("div");
        $(elt).get(0).should.equal(elt);
    });

    it("should not wrap af objects more than once", function () {
        var elt = $("#single1").get(0);
        $($("#single1")).get(0).should.equal(elt);
    });

    it("should create elements", function () {
        var elt = $("<div id=\"foobar\"></div>").get(0);
        elt.id.should.equal("foobar");
    });

    it("should select within a context if supplied", function () {
        var text = "<div id=\"parent_test_cont\">" +
            "<div class=\"parent1\" id=\"parent1\">" +
            "<span class=\"parsel\">Foo</span>" +
            "<span class=\"parsel\">Foo</span>" +
            "</div>"+
            "<div class=\"parent1\" id=\"parent2\">" +
            "<span class=\"parsel\">Foo</span>" +
            "</div>" +
            "<div class=\"parent1\" id=\"parent3\">" +
            "<p class=\"parsel\">Foo</p>" +
            "</div>" +
            "<span class=\"parent1\" id=\"parent3\">" +
            "<p class=\"parsel\">Foo</p>" +
            "</span>" +
            "</div>";

        $("#single2").append(text);

        var tmp = $("#parent_test_cont");

        $("span", tmp).length.should.equal(4);
    });

    it("should remove spaces when constructing HTML", function () {
        $("   <div />   ").length.should.equal(1);
    });
});
