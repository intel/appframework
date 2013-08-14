var fs = require("fs");
var domino = require("domino");

// html: html to load into the window
// jsFiles: array of paths to js files to load into the window
// callback: function with signature callback(errors, window)
module.exports = function (html) {
    global.window = domino.createWindow(html);
    global.navigator = global.window.navigator;
};
