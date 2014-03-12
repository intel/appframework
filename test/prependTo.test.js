require("./chai.helper");
var domHelper = require("./dom.helper");

describe("appendTo", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"prependToTest\"></div>"
        );
    });

    it("should prepend a string to an element", function () {
        $("<span class=\"important\"></span>").prependTo("#prependToTest");
        document.getElementById("prependToTest").childNodes.length.should.equal(1);
    });

    it("should prepend a DOM element", function () {
        var elt = document.createElement("p");
        elt.setAttribute("id", "intro");
        elt.textContent = "hello";

        $(elt).prependTo("#prependToTest");

        var children = document.getElementById("prependToTest").childNodes;
        children.length.should.equal(1);
        children[0].getAttribute("id").should.equal("intro");
        children[0].textContent.should.equal("hello");
    });

    it("should prepend multiple DOM elements in the correct order", function () {
        var elt1 = document.createElement("p");
        elt1.setAttribute("id", "end");
        elt1.textContent = "world";

        var elt2 = document.createElement("p");
        elt2.setAttribute("id", "more-end");
        elt2.textContent = "goodbye";

        $(elt1).prependTo("#prependToTest");
        $(elt2).prependTo("#prependToTest");

        var children = document.getElementById("prependToTest").childNodes;
        children.length.should.equal(2);
        children[0].getAttribute("id").should.equal("more-end");
        children[0].textContent.should.equal("goodbye");
    });
});
