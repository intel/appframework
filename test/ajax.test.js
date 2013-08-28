require("./chai.helper");
var domHelper = require("./dom.helper");
var HttpFake = require("./http-fake.helper");

// NB sinon has a fake XMLHTTPRequest object, but it doesn't
// work properly with node.js;
// see https://groups.google.com/forum/#!topic/sinonjs/yD8Q9OjtFvc

describe("ajax", function () {
    var originalXmlHttpRequest;

    before(function () {
        domHelper(
            "<div id=\"foo\">" +
            "</div>"
        );

        originalXmlHttpRequest = window.XMLHttpRequest;

        // use our doctored XMLHttpRequest, associating it with
        // the jsdom window
        window.XMLHttpRequest = HttpFake.Request;
    });

    afterEach(function () {
        HttpFake.clearFakes();
    });

    after(function () {
        window.XMLHttpRequest = originalXmlHttpRequest;
    });

    it("should do a GET request to a specified url", function (done) {
        // this is what we expect the request to look like
        var expectedRequest = {
            method: "GET",
            path: "/?a=1&b=2",
            host: "localhost",
            headers: {
                "X-bloop": "glong"
            }
        };

        // this is what we send back if we get the expected request
        var response = { data: "hello world" };

        HttpFake.registerFake(response, expectedRequest);

        $.ajax({
            type: "GET",
            url: "/",
            host: "localhost",
            data: "a=1&b=2",
            dataType: "text",
            headers: {
                "X-bloop": "glong"
            },
            success: function (data) {
                data.should.equal("hello world");
                done();
            },
            error: function (xhr) {
                done(new Error(xhr.responseText));
            }
        });
    });

    it("should do a POST request to a specified url", function (done) {
        // this is what we expect the request to look like
        var expectedRequest = {
            method: "POST",
            path: "/save",
            host: "localhost",
            headers: {
                "Content-Type": "application/json"
            }
        };

        // this is what we send back if we get the expected request
        var response = { data: "OK" };

        HttpFake.registerFake(response, expectedRequest);

        $.ajax({
            type: "POST",
            url: "/save",
            host: "localhost",
            contentType: "application/json",
            data: {a: 1, b: 2},
            success: function (data) {
                data.should.equal("OK");
                done();
            },
            error: function (xhr) {
                done(new Error(xhr.responseText));
            }
        });
    });

    it("should do a GET request for XML to a specified url", function (done) {
        var expectedRequest = {
            method: "GET",
            path: "/?x=10&y=20&z=30",
            host: "localhost"
        };

        var xml = "<?xml version=\"1.0\"><top/>";
        var response = { data: xml };

        HttpFake.registerFake(response, expectedRequest);

        $.ajax({
            type: "GET",
            url: "/?x=10",
            data: "y=20&z=30",
            host: "localhost",
            dataType: "xml",
            success: function (data) {
                data.should.equal(xml);
                done();
            },
            error: function (xhr) {
                done(new Error(xhr.responseXML));
            }
        });
    });

    it("should do a json request and parse the response", function (done) {
        var expectedRequest = {
            method: "GET",
            path: "/",
            host: "localhost"
        };

        var responseData = {"hi": "world", "nice": "to see you"};
        var response = { data: JSON.stringify(responseData) };

        HttpFake.registerFake(response, expectedRequest);

        $.ajax({
            type: "GET",
            url: "/",
            host: "localhost",
            dataType: "json",
            success: function (data) {
                data.should.eql(responseData);
                done();
            },
            error: function (xhr) {
                done(new Error(xhr.responseText));
            }
        });
    });
});
