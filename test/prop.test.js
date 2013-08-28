require("./chai.helper");
var domHelper = require("./dom.helper");

describe("prop", function () {
    var collection;
    var emptyCollection;

    beforeEach(function () {
        domHelper(
            "<div id=\"foo\" bar=\"xomba\"></div>" +
            "<div id=\"foo2\" bar=\"xomba\"></div>"
        );

        collection = $("[bar]");
        collection.length.should.equal(2);

        emptyCollection = $("bingo");
        emptyCollection.length.should.equal(0);
    });

    it("should set multiple properties on members if first arg is an object", function () {
        collection.prop({ "bingo": "masters", "break": "out" });

        $(collection[0]).prop("bingo").should.equal("masters");
        $(collection[1]).prop("bingo").should.equal("masters");

        $(collection[0]).prop("break").should.equal("out");
        $(collection[1]).prop("break").should.equal("out");
    });

    it("should set the property of a single member to the specified value", function () {
        collection = $("#foo");
        collection.length.should.equal(1);
        collection.prop("bleep", "booster");

        collection.prop("bleep").should.equal("booster");

        // check that the other div doesn't have the property
        expect($("#foo2").prop("bleep")).to.be.undefined;
    });

    it("should set the property of each member to the specified value", function () {
        collection.prop("bar", "hoopla");

        $(collection[0]).prop("bar").should.equal("hoopla");
        $(collection[1]).prop("bar").should.equal("hoopla");
    });

    it("should remove the property from each member if the value is null", function () {
        collection.prop("bar", "hoopla");

        // remove the property
        collection.prop("bar", null);

        expect($(collection[0]).prop("bar")).to.be.undefined;
        expect($(collection[1]).prop("bar")).to.be.undefined;
    });

    it("should remove the property from the member and from the cache if value is null", function () {
        collection.prop("bar", { "i": "theobject" });

        // remove the property
        collection.prop("bar", null);

        expect($(collection[0]).prop("bar")).to.be.undefined;
        expect($(collection[1]).prop("bar")).to.be.undefined;
    });

    it("should return the property value of the first member", function () {
        // properties are separate from attributes, but we set one
        // with the same name as an attribute to maximise the possibility
        // of overlap/confusion
        collection.prop("bar", "hoopla");

        collection.prop("bar").should.equal("hoopla");
    });

    it("should return undefined for an unset property", function () {
        expect(collection.prop("definitelynotsetproperty")).to.be.undefined;
    });

    it("should cache the value when it is an object, array or function", function () {
        // object
        var value = { a: 1, b: 2 };
        collection.prop("underTest", value);

        $(collection[0]).prop("underTest").should.equal(value);
        $(collection[1]).prop("underTest").should.equal(value);

        // array
        value = [1, 2, 3];
        collection.prop("underTest", value);

        $(collection[0]).prop("underTest").should.equal(value);
        $(collection[1]).prop("underTest").should.equal(value);

        // function
        value = function () {
            return "hurray!";
        };
        collection.prop("underTest", value);

        $(collection[0]).prop("underTest").should.equal(value);
        $(collection[1]).prop("underTest").should.equal(value);
    });

    it("should reset cached value when set again so cache doesn't go stale", function () {
        // set an object so the cache is used
        var value = { x: 10, y: 20 };
        collection.prop("splendidObject", value);

        $(collection[0]).prop("splendidObject").should.equal(value);
        $(collection[1]).prop("splendidObject").should.equal(value);

        // reset the property value to a different object
        var value2 = { z: 28, p: 38 };
        collection.prop("splendidObject", value2);

        $(collection[0]).prop("splendidObject").should.equal(value2);
        $(collection[1]).prop("splendidObject").should.equal(value2);
    });

    it("should return undefined for an empty collection", function () {
        expect(emptyCollection.prop("master")).to.be.undefined;
    });

    it("should return the empty collection if setting a value on an empty collection", function () {
        expect(emptyCollection.prop("master", "hoho")).to.equal(emptyCollection);
    });

});
