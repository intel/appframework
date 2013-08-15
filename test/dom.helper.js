var path = require("path");
var domino = require("domino");
var afPath = path.join(__dirname, "../appframework.js");

// html: html to load into the window
// jsFiles: array of paths to js files to load into the window
// callback: function with signature callback(errors, window)
module.exports = function (html) {
    if (!("window" in global)) {
        global.window = domino.createWindow("<body></body>");
        global.navigator = global.window.navigator;
        require(afPath);
        global.$ = window.$;
    }

    window.document.querySelector("body").innerHTML = html;
};
