require("./chai.helper");
var domHelper = require("./dom.helper");

describe("numonly", function () {
    it("should remove characters from the string", function () {
        var tmp=window.numOnly("123asdf");
        tmp.should.equal(123);
    });

    it("should return a float",function(){
        var tmp=window.numOnly("3.14Pie");
        tmp.should.equal(3.14);
    });

    it("should remove characters from the front of the string",function(){
        var tmp=window.numOnly("pie3.14");
        tmp.should.equal(3.14);
    });
});
