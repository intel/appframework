/*
 * HTTP server with programmable API for adding stubs/mocks.
 */
var express = require("express");
var http = require("http");
var expect = require("chai").expect;

// compare a requestMatcher with a request; if each property
// in the requestMatcher matches with a property in the request,
// return true; otherwise, return false
//
// note that chai's eql is abused to do the matches
var meetsCriteria = function (request, requestMatcher) {
    var good = true;

    // if we're recursing into an object in the requestMatcher,
    // but request doesn't have a corresponding object, just
    // return false immediately
    if (!request) {
        return false;
    }

    for (var key in requestMatcher) {
        if (typeof requestMatcher[key] === "function") {
            good = requestMatcher[key](request[key]);
        }
        else if (typeof requestMatcher[key] === "object") {
            good = meetsCriteria(request[key], requestMatcher[key]);
        }
        else {
            try {
                expect(requestMatcher[key]).to.eql(request[key]);
            }
            catch (e) {
                good = false;
            }
        }

        if (!good) {
            break;
        }
    }

    return good;
};

// matches the request req against the requestMatchers in
// map (see Server.map property, below); when a match is found, send it
// via the Express response object res, using the responseConfig in
// the map
var matcher = function (map, req, res) {
    var toSend = null;

    var requestMatcher;
    var responseConfig;

    for (var i = 0; i < map.length; i += 1) {
        requestMatcher = map[i].requestMatcher;
        if (meetsCriteria(req, requestMatcher)) {
            toSend = map[i].responseConfig;
        }
    }

    return toSend;
};

var Server = function () {
    var self = this;

    // this contains objects with the structure
    // {requestMatcher: {...}, responseConfig: {...}};
    // when the server receives a request, it iterates through
    // these objects until it finds a requestMatcher which matches
    // the request; then, it returns a response generated from
    // responseConfig
    this.map = [];

    this.app = express();

    // use middleware to parse request body
    this.app.use(express.bodyParser());

    // hand off requests to the request/response matcher
    this.app.all(/.*/, function (req, res) {
        // defaults if no response config found
        var data = "No matching response for request";
        var statusCode = 503;
        var pause = 0;

        // try to find an appropriate response for this request
        var responseConfig = matcher(self.map, req, res);

        if (responseConfig) {
            statusCode = responseConfig.status || 200;

            // should we generate the response body data using the
            // responseConfig's data function?
            if (typeof responseConfig.data === "function") {
                data = responseConfig.data(req);
            }
            else {
                data = responseConfig.data || '';
            }

            pause = responseConfig.pause || 0;
        }
        else {
            console.error("could not find a response configuration for request");
        }

        setTimeout(function () {
            res.status(statusCode)
               .send(data);
        }, pause);
    });

    this.server = require("http").createServer(this.app);

    this.port = null;
};

// register a fake response for a given request pattern;
// responseConfig specifies how the response should
// be constructed; requestMatcher is an object to compare with
// each received request, to determine if the response is
// an appropriate candidate to return;
// NB if requestMatcher is not specified, the fake response
// will match every request
//
// responseConfig currently uses the following properties:
// * data: sets the response body; this can be set to a function:
// if it is, that function is passed the original express request
// object, and should return a string to be used as the response body
// * status: sets the status code for the response (default: 200)
// * pause: sets a pause (ms) before the response is returned (default: 0)
//
// in the requestMatcher, set a property for each property of the
// request you want to test; the value of the property in the
// requestMatcher can either be a value for comparison (using
// chai's eql() function) or a function which will be passed
// the corresponding value from the request; for example:
//
// {
//     query: function (reqQuery) {
//        return reqQuery["id"] === "1";
//     }
// }
//
// note that if you want requestMatcher to compare headers,
// you should lowercase the names of the headers so they match
// headers as perceived by express; also note that the server
// will parse application/json, multipart/form-data and
// application/x-www-form-urlencoded requests into objects, so
// any matchers for the request body should use objects rather than
// strings
Server.prototype.registerFake = function (responseConfig, requestMatcher) {
    this.map.push({
        responseConfig: responseConfig,
        requestMatcher: requestMatcher || {}
    });
};

Server.prototype.clearFakes = function () {
    this.map = [];
};

// cb is invoked when the server emits a "listening" event
// or with any thrown error
Server.prototype.start = function (cb) {
    var self = this;

    var realCb = function () {
        if (typeof cb === "function") {
            cb.apply(null, arguments);
        }
        // if first argument is set, it's an error,
        // so throw it if a callback is not defined
        else if (arguments[0]) {
            throw arguments[0];
        }
    };

    try {
        var maxConnectionsQueueLength = 511;

        // "listening" event handler
        var handler = function () {
            self.port = self.server.address().port;
            realCb();
        };

        this.server.listen(0, "localhost", maxConnectionsQueueLength, handler);
    }
    catch (e) {
        realCb(e);
    }
};

// cb is invoked with an error if any occurs, otherwise
// with no arguments
Server.prototype.stop = function (cb) {
    var self = this;

    var realCb = function () {
        if (typeof cb === "function") {
            cb.apply(null, arguments);
        }
        else if (arguments[0]) {
            throw arguments[0];
        }
    };

    try {
        this.server.on("close", realCb);
    }
    catch (e) {
        realCb(e);
    }

    this.server.close();
};

module.exports = {
    createServer: function () {
        return new Server();
    }
};
