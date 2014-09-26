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
     
});
