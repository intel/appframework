<<<<<<< HEAD
require("./chai.helper");
var domHelper = require("./dom.helper");

describe("replaceClass", function () {
    beforeEach(function () {
        domHelper(
            "<div data-role=\"foo1\" class=\"red\"></div>" +
            "<div data-role=\"foo2\" class=\"red\"></div>" +
            "<div data-role=\"foo3\" class=\"blue\"></div>"
        );
    });

    it("should replace a class on a single element", function () {
        var matching = $(".blue");
        matching.length.should.equal(1);
        matching.replaceClass("blue", "pink");

        var elt = document.querySelector("[data-role=\"foo3\"]");
        elt.getAttribute("class").should.equal("pink");
    });

    it("should replace a class on multiple elements", function () {
        var matching = $(".red");
        matching.length.should.equal(2);
        matching.replaceClass("red", "bronze");

        var elts = document.querySelectorAll(".bronze");
        elts.length.should.equal(2);

        for (var i = 0; i < elts.length; i += 1) {
            elts[i].getAttribute("class").should.equal("bronze");
        }

        var untouched = document.querySelector("[data-role=\"foo3\"]");
        untouched.getAttribute("class").should.equal("blue");
    });
=======
describe("replaceClass", function () {
    var stubMatrix = { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1 };

    beforeEach(function () {
       $(document.body).append("<div id=\"moo\"></div>");


    });

    it("should replace a css class", function () {
        var el=document.getElementById("moo");
        el.className="foobar";

        $(el).replaceClass("foobar","bar");

        expect($(el).hasClass("bar")).to.be.true;
        expect($(el).hasClass("foobar")).to.be.false;
    });

    it("should do nothing to the classes", function () {
        var el=document.getElementById("moo");
        el.className="foobar";

        $(el).replaceClass();

        expect($(el).hasClass("bar")).to.be.false;
        expect($(el).hasClass("foobar")).to.be.true;
    });
    it("Should add the class",function(){
        var el=document.getElementById("moo");
        el.className="foobar";

        $(el).replaceClass("","bar");

        expect($(el).hasClass("bar")).to.be.true;
        expect($(el).hasClass("foobar")).to.be.true;
    });
    it("should replace a css class when multiple classes exist", function () {
        var el=document.getElementById("moo");
        el.className="foobar temp stuff";

        $(el).replaceClass("foobar","bar");
        expect($(el).hasClass("bar")).to.be.true;
        expect($(el).hasClass("temp")).to.be.true;
        expect($(el).hasClass("stuff")).to.be.true;
        expect($(el).hasClass("foobar")).to.be.false;
    });

    it("should replace multiple classess", function () {
        var el=document.getElementById("moo");
        el.className="foobar temp";

        $(el).replaceClass("foobar temp","bar has");
        expect($(el).hasClass("bar")).to.be.true;
        expect($(el).hasClass("has")).to.be.true;
        expect($(el).hasClass("foobar")).to.be.false;
        expect($(el).hasClass("temp")).to.be.false;
    });
     
>>>>>>> 3.0beta
});
