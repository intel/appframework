require("./chai.helper");
var domHelper = require("./dom.helper");

describe("appendTo", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"appendToTest\"></div>"
        );
    });

    it("should append a string to an element", function () {
        $("<span class=\"important\"></span>").appendTo("#appendToTest");
        document.getElementById("appendToTest").childNodes.length.should.equal(1);
    });

    it("should append a DOM element", function () {
        var elt = document.createElement("p");
        elt.setAttribute("id", "intro");
        elt.textContent = "hello";

        $(elt).appendTo("#appendToTest");

        var children = document.getElementById("appendToTest").childNodes;
        children.length.should.equal(1);
        children[0].getAttribute("id").should.equal("intro");
        children[0].textContent.should.equal("hello");
    });

    it("should append multiple DOM elements in the correct order", function () {
        var elt1 = document.createElement("p");
        elt1.setAttribute("id", "end");
        elt1.textContent = "world";

        var elt2 = document.createElement("p");
        elt2.setAttribute("id", "more-end");
        elt2.textContent = "goodbye";

        $(elt1).appendTo("#appendToTest");
        $(elt2).appendTo("#appendToTest");

        var children = document.getElementById("appendToTest").childNodes;
        children.length.should.equal(2);
        children[1].getAttribute("id").should.equal("more-end");
        children[1].textContent.should.equal("goodbye");
    });
});
