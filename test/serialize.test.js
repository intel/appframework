require("./chai.helper");
var domHelper = require("./dom.helper");

describe("serialize", function () {
    beforeEach(function () {
        domHelper(
            "<form id=\"myform\" onsubmit=\"return false\">" +
            "<fieldset>" +
            "<input type=\"text\" id=\"name\" name=\"name\" value=\"af\">" +
            "<input id=\"available\" type=\"checkbox\" " +
            "name=\"available\" value=\"true\" checked>" +
            "<select id=\"version\" name=\"version\" multiple=\"multiple\">" +
            "<option id=\"option0.9.5\" value=\"0.9.5\">0.9.5</option>" +
            "<option id=\"option1.0\" value=\"1.0\">1.0</option>" +
            "<select>" +
            "<input type=\"submit\" value=\"Go\">" +
            "</fieldset>" +
            "</form>"
        );
    });

    it("should convert form elements into a querystring", function () {
        var expected = "name=af&available=true";
        var actual = $("#myform").serialize();
        actual.should.equal(expected);
    });

    it("should ignore unchecked checkboxes", function () {
        document.getElementById("available").checked = false;
        var expected = "name=af";
        var actual = $("#myform").serialize();
        actual.should.equal(expected);
    });

    it("should ignore disabled elements", function () {
        document.getElementById("name").disabled = true;
        var expected = "available=true";
        var actual = $("#myform").serialize();
        actual.should.equal(expected);
    });

    it("should serialize drop-down select with default option selected", function () {
        document.getElementById("version").removeAttribute("multiple");
        var expected = "name=af&available=true&version=0.9.5";
        var actual = $("#myform").serialize();
        actual.should.equal(expected);
    });

    it("should serialize select elements with option selected", function () {
        document.getElementById("option1.0").selected = true;
        var expected = "name=af&available=true&version=1.0";
        var actual = $("#myform").serialize();
        actual.should.equal(expected);
    });

    it("should serialize select elements with multiple options selected", function () {
        document.getElementById("option0.9.5").selected = true;
        document.getElementById("option1.0").selected = true;
        var expected = "name=af&available=true&version=0.9.5&version=1.0";
        var actual = $("#myform").serialize();
        actual.should.equal(expected);
    });
});
