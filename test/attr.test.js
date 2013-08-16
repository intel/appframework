require("./chai.helper");
var domHelper = require("./dom.helper");

describe("attr", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"single1\" class=\"red\" data-spong=\"bang\"></div>" +
            "<div id=\"single2\" class=\"red\" data-spong=\"bloing\"></div>"
        );
    });

    it("should set an attribute on a collection of elements", function () {
        var divs = $("div");
        divs.attr("data-foo", "bar");

        var rawDivs = document.querySelectorAll("div");

        for (var i = 0; i < rawDivs.length; i += 1) {
            rawDivs[i].getAttribute("data-foo").should.equal("bar");
        }
    });

    it("should set attributes from an object on a collection of elements", function () {
        var divs = $("div");
        divs.attr({
          "data-foo": "bar",
          "data-ex": "why",
          "data-alpha": "zed"
        });

        var rawDivs = document.querySelectorAll("div");

        for (var i = 0; i < rawDivs.length; i += 1) {
            rawDivs[i].getAttribute("data-foo").should.equal("bar");
            rawDivs[i].getAttribute("data-ex").should.equal("why");
            rawDivs[i].getAttribute("data-alpha").should.equal("zed");
        }
    });

    it("should set a (pseudo) attribute to a function, object or array", function () {
        // function
        var fn = function () {
            return "bar";
        };

        $(".red").attr("data-foo", fn);
        $(document.getElementById("single1")).attr("data-foo").should.equal(fn);
        $(document.getElementById("single2")).attr("data-foo").should.equal(fn);

        // object
        var obj = {
            a: 1,
            b: 2
        };

        $(".red").attr("data-foo", obj);
        $(document.getElementById("single1")).attr("data-foo").should.equal(obj);
        $(document.getElementById("single2")).attr("data-foo").should.equal(obj);

        // array
        var arr = ["a", "b", "c"];

        $(".red").attr("data-foo", arr);
        $(document.getElementById("single1")).attr("data-foo").should.equal(arr);
        $(document.getElementById("single2")).attr("data-foo").should.equal(arr);
    });

    it("should remove an attribute if value is set to null", function () {
        $(".red").attr("data-greet", "hello");
        $(".red").attr("data-greet", null);

        var elt1 = document.getElementById("single1");
        var value1 = elt1.getAttribute("data-greet");
        (value1 === null).should.be.true

        var elt2 = document.getElementById("single2");
        var value2 = elt2.getAttribute("data-greet");
        (value2 === null).should.be.true
    });

    it("should remove a (pseudo) attribute if value is set to null", function () {
        $(".red").attr("data-greet", {a: 1, b: 2});
        $(".red").attr("data-greet", null);

        var elt1 = document.getElementById("single1");
        var value1 = elt1.getAttribute("data-greet");
        (value1 === null).should.be.true

        var elt2 = document.getElementById("single2");
        var value2 = elt2.getAttribute("data-greet");
        (value2 === null).should.be.true
    });

    it("should get an attribute's value from a single element", function () {
        var actual = $("#single1").attr("data-spong");
        actual.should.equal("bang");
    });

    it("should get the first element's attribute value if called on an af collection", function () {
        var actual = $(".red").attr("data-spong");
        actual.should.equal("bang");
    });
});
