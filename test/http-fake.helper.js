/*
 * Fake partial implementation of the node http module,
 * for use with tests and to create a fake XMLHttpRequest
 * class for headless testing.
 *
 * Note that this is a very broken implementation, only sending
 * the data and objects required for use with our fake XMLHttpRequest.
 */
require("./chai.helper");
var xmlHttpRequestClassMaker = require("./http-fake-xmlhttprequest.helper");
var EventEmitter = require('events').EventEmitter;
var util = require("util");

// REQUEST
// a bare-bones implementation; we basically ignore most
// of its functionality
var Request = function (config) {
    EventEmitter.call(this);
};

util.inherits(Request, EventEmitter);

Request.prototype.end = function () {};
Request.prototype.write = function () {};

// RESPONSE
var Response = function (config) {
    this.statusCode = config.status || 200;
    this.headers = config.headers || {}
    this.data = config.data || null;
    EventEmitter.call(this);
};

util.inherits(Response, EventEmitter);

// ignore setEncoding
Response.prototype.setEncoding = function () {};

// for running the fake response
Response.prototype.run = function () {
    this.emit("data", this.data);
    this.emit("end");
};

// http fake; NB we only fake the request() method which is used
// by our fake XMLHTTPRequest class

// this contains objects with the structure
// {request: {...}, response: <Response instance>};
// when an HTTP request is made via the request() method exported
// by this module, the options passed to request() are compared
// against the request property of each object in this array;
// as soon as a match is found, the corresponding Response instance
// is returned
var requestsToResponses = [];

// compare the parameters object with the candidate object,
// returning true if all of the parameters are matched by candidate;
// this will halt via a chai exception if any key in candidate
// is missing from parameters
var parametersMatch = function (parameters, candidate) {
    var isMatch = true;

    for (var key in candidate) {
        /// if the key in candidate is itself an object, recursively
        // compare with the key in parameters
        if (typeof candidate[key] === "object") {
            return parametersMatch(parameters[key], candidate[key]);
        }
        else {
            isMatch = (candidate[key] === parameters[key]);
        }

        if (!isMatch) {
            break;
        }
    }

    return isMatch;
};

// map an actual request onto a fake response by comparing
// the request options with each candidate in requestsToResponses
var findResponse = function (requestOptions) {
    var candidateResponse = null;

    var candidateRequest;
    for (var i = 0; i < requestsToResponses.length; i += 1) {
        candidateRequest = requestsToResponses[i].request;

        if (parametersMatch(requestOptions, candidateRequest)) {
            candidateResponse = requestsToResponses[i].response;
            break;
        }
    }

    if (!candidateResponse) {
        var msg = "received request but could not map to fake response; " +
        "request was:\n" +
        JSON.stringify(requestOptions);

        candidateResponse = new Response({ status: 503, data: msg });
    }

    // return a 503 status (internal server error) if we
    // couldn't find a candidate response
    return candidateResponse;
};

var HttpFake = {
    // register a fake response for a given request pattern;
    // responseOptions specifies how the response should
    // be constructed; requestOptions specifies the content of the
    // request to be matched
    registerFake: function (responseOptions, requestOptions) {
        requestOptions = requestOptions || {};
        var fakeResponse = new Response(responseOptions);
        var requestToResponse = {
            request: requestOptions,
            response: fakeResponse
        };
        requestsToResponses.push(requestToResponse);
    },

    clearFakes: function () {
        requestsToResponses = [];
    },

    // stand in for http.request
    request: function (options, callback) {
        var resp = findResponse(options);
        callback(resp);

        resp.run();

        return new Request();
    }
};

// construct our XMLHttpRequest class using the fake http implementation
HttpFake.Request = xmlHttpRequestClassMaker(HttpFake, HttpFake);

// export everything
module.exports = HttpFake;
