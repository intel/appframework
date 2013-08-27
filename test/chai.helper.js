var chai = require("chai")

// turn on stack traces for errors thrown during chai assertions
chai.Assertion.includeStack = true;

// make should API globally available
global.should = chai.should();
