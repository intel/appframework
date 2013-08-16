var path = require("path");
var jsdom = require("jsdom");
var afPath = path.join(__dirname, "../appframework.js");

// html: html to load into the window
// jsFiles: array of paths to js files to load into the window;
// loads af core by default
module.exports = function (html) {
    if (!("window" in global)) {
        global.document = jsdom.jsdom("<html><head></head><body></body></html>");
        global.window = document.parentWindow;
        global.navigator = window.navigator;
        require(afPath);
        global.$ = window.$;
    }

    if (html) {
        window.document.querySelector("body").innerHTML = html;
    }
};
