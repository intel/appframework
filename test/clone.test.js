require("./chai.helper");
var domHelper = require("./dom.helper");

describe("clone", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"foo\">" +
            "<div id=\"bar\"></div><div id=\"mux\"></div>" +
            "</div>" +
            "<div id=\"blu\" class=\"red\"></div>" +
            "<div id=\"rd\" class=\"red\"></div>"
        );
    });

    it("should shallow clone with no children", function () {
        var cloned = $("#foo").clone(false).get();
        cloned.childNodes.length.should.equal(0);
        cloned.id.should.equal(document.getElementById("foo").id);
    });

    it("should deep clone including children", function () {
        var original = document.getElementById("foo");
        var cloned = $("#foo").clone(true).get();
        cloned.childNodes.length.should.equal(original.childNodes.length);
        cloned.id.should.equal(original.id);
    });

    it("should clone multiple elements in a collection", function () {
        var originals = document.querySelectorAll(".red");
        var clones = $(".red").clone();

        clones.length.should.equal(originals.length);

        for (var i = 0; i < clones.length; i += 1) {
            clones[i].id.should.equal(originals[i].id);
        }
    });
});
