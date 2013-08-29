var path = require("path");
require("./chai.helper");
var domHelper = require("./dom.helper");

// this loads fixtures/jsonp.loaded.js from the local filesystem
var basepath = path.join(__dirname, "fixtures");
var JSONP_LOADED_URI = "file://" + path.join(basepath, "jsonp.loaded.js");

describe("jsonp", function () {
    beforeEach(function () {
        domHelper(
            "<div id=\"foo\">" +
            "</div>"
        );
    });

    it("should load an external JSONP script with callback in the URI", function (done) {
        // make chai's expect function available in the execution context
        // for the script
        window.expect = expect;

        // this is the function referenced in the jsonp.loaded.js script
        window.parseResponse = function (data) {
            var expected = { JSONP_LOADED: true };
            window.expect(data).to.eql(expected);
            done();
        };

        $.jsonP({
            url: JSONP_LOADED_URI + "?callback=?",

            error: function () {
                done(new Error("could not load jsonp.loaded.js script"));
            }
        });
    });

});
