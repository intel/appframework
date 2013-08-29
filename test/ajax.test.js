require("./chai.helper");
var domHelper = require("./dom.helper");
var HttpFake = require("./http-fake.helper");
var XMLHttpRequest = require("./http-fake-xmlhttprequest.helper");

// NB sinon has a fake XMLHTTPRequest object, but it doesn't
// work properly with node.js;
// see https://groups.google.com/forum/#!topic/sinonjs/yD8Q9OjtFvc

describe("ajax", function () {
    var originalXmlHttpRequest;
    var server = HttpFake.createServer();

    // we need to refer to this from the tests, but we allow
    // the server to randomly get a port before setting it
    var host;

    before(function (done) {
        domHelper(
            "<div id=\"foo\">" +
            "</div>"
        );

        // replace jsdom's XMLHttpRequest with
        // node-xmlhttprequest, to support POST requests
        originalXmlHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = XMLHttpRequest;

        server.start(function () {
            host = "localhost:" + server.port;
            done.apply(null, arguments);
        });
    });

    afterEach(function () {
        server.clearFakes();
    });

    after(function (done) {
        window.XMLHttpRequest = originalXmlHttpRequest;
        server.stop(done);
    });

    it("should do a GET request to a specified url", function (done) {
        // this is what we expect the request to look like
        var requestMatcher = {
            method: "GET",
            path: "/",
            query: {a: "1", b: "2"},
            host: "localhost",
            headers: {
                "x-bloop": "glong"
            }
        };

        // this is what we send back if we get the expected request
        var response = { data: "hello world" };

        server.registerFake(response, requestMatcher);

        $.ajax({
            type: "GET",
            url: "http://" + host + "/",
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
        var postData = {a: 1, b: 2};

        // this is what we expect the request to look like
        var requestMatcher = {
            method: "POST",
            path: "/save",
            host: "localhost",
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: { a: "1", b: "2" }
        };

        // this is what we send back if we get the expected request
        var response = { data: "OK" };

        server.registerFake(response, requestMatcher);

        $.ajax({
            type: "POST",
            url: "http://" + host + "/save",
            contentType: "application/x-www-form-urlencoded",
            data: postData,
            success: function (responseText) {
                responseText.should.equal("OK");
                done();
            },
            error: function (xhr) {
                done(new Error(xhr.responseText));
            }
        });
    });

    it("should do a GET request for XML to a specified url", function (done) {
        var requestMatcher = {
            method: "GET",
            path: "/",
            query: { x: "10", y: "20", z: "30" },
            host: "localhost"
        };

        var xml = "<?xml version=\"1.0\"><top/>";
        var response = { data: xml };

        server.registerFake(response, requestMatcher);

        $.ajax({
            type: "GET",
            url: "http://" + host + "/?x=10",
            data: "y=20&z=30",
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
        var requestMatcher = {
            method: "GET",
            path: "/",
            host: "localhost"
        };

        var responseData = {hi: "world", nice: "to see you"};
        var response = { data: JSON.stringify(responseData) };

        server.registerFake(response, requestMatcher);

        $.ajax({
            type: "GET",
            url: "http://" + host + "/",
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

    it("should call error callback if request fails", function (done) {
        var requestMatcher = {
            method: "GET",
            path: "/",
            host: "localhost"
        };

        var response = { status: 503 };

        server.registerFake(response, requestMatcher);

        $.ajax({
            type: "GET",
            url: "http://" + host + "/",

            success: function (data) {
                done(new Error("success cb should not be called"));
            },

            error: function (xhr, message) {
                xhr.status.should.equal(503);
                message.should.equal("error");
                done();
            }
        });
    });

    it("should call error callback if request times out", function (done) {
        var requestMatcher = {
            method: "GET",
            path: "/",
            host: "localhost"
        };

        // response should still error because it times out,
        // even though the status code is 200
        var response = { status: 200, pause: 2000, data: "OK" };

        server.registerFake(response, requestMatcher);

        $.ajax({
            type: "GET",
            url: "http://" + host + "/",

            timeout: 100,

            success: function (data) {
                done(new Error("success cb should not be called"));
            },

            error: function (xhr, message) {
                message.should.equal("timeout");
                done();
            }
        });
    });
});
