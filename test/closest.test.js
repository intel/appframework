require("./chai.helper");
var domHelper = require("./dom.helper");

describe("closest", function () {
    var elt;
    var emptyCollection;

    beforeEach(function () {
        domHelper(
            "<div id=\"too-far-away\" class=\"outer\">" +
            "<div id=\"should-be-me\" class=\"outer\">" +
            "<p class=\"inner1\">" +
            "<span class=\"inner2\">" +
            "<em class=\"inner3\">hello</em>" +
            "</span>" +
            "</p>" +
            "</div>" +
            "</div>" +
            "<div id=\"not-me\" class=\"outer no-match\"></div>" +
            "<div id=\"or-me\" class=\"outer no-match\"></div>"
        );

        elt = $(".inner3");
        elt.length.should.equal(1);

        emptyCollection = $("bloop");
        emptyCollection.length.should.equal(0);
    });

    it("should select the first ancestor node which matches the selector", function () {
        var closest = elt.closest(".outer");
        closest.length.should.equal(1);
        closest[0].should.equal($("#should-be-me")[0]);
    });

    it("should select the first ancestor node which matches the selector wrt a context", function () {
        var closest = elt.closest(".outer", document);
        closest.length.should.equal(1);
        closest[0].should.equal($("#should-be-me")[0]);
    });

    it("should return an empty collection if context causes match to fail", function () {
        var closest = elt.closest(".outer", $(".no-match"));
        closest.length.should.equal(0);
        $.is$(closest).should.be.true;
    });

    it("should return an empty collection if no matching closest node", function () {
        var closest = elt.closest("yottaflop");
        closest.length.should.equal(0);
        $.is$(closest).should.be.true;
    });

    it("should return the empty collection if called on an empty collection", function () {
        var closest = emptyCollection.closest(".outer");
        closest.should.equal(emptyCollection);
        closest.length.should.equal(0);
        $.is$(closest).should.be.true;
    });
});
