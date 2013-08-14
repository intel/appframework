var path = require("path");

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-mochaccino");

    grunt.initConfig({
        clean: [ "build" ],

        // see .jshintrc file for the options;
        // options are explained at http://www.jshint.com/docs/config/
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },

            core: [ "appframework.js" ],

            jq: [ "jq.appframework.js" ],

            plugins: [ "plugins/**/*.js" ],

            ui: [ "ui/appframework.ui.js", "ui/transitions/**/*.js" ]
        },

        // minification
        //
        // assumptions:
        //
        // * appframework.js and jq.appframework.js are minified
        //   into separate files
        // * plugins are minified separately (one file per plugin)
        // * ui includes both the appframework.ui.js file and the
        //   files in ui/transitions (NOT appframework.js)
        uglify: {
            options: {
                compress: true,
                mangle: true,
                preserveComments: false,
                beautify: {
                  "max_line_len": 600
                }
            },

            core: {
                files: {
                    "build/appframework.min.js": [ "appframework.js" ]
                }
            },

            jq: {
                files: {
                    "build/jq.appframework.min.js": [ "jq.appframework.js " ]
                }
            },

            plugins: {
                files: [
                  {
                      src: "plugins/**/*.js",
                      expand: true,
                      dest: "build",

                      // change extension for each source file from .js
                      // to .min.js
                      rename: function (dest, src) {
                          src = src.replace(".js", ".min.js");
                          return path.join(dest, src);
                      }
                  }
                ]
            },

            ui: {
                files: {
                    "build/ui/appframework.ui.min.js": [
                        "ui/src/appframework.ui.js",
                        "ui/transitions/**/*.js"
                    ]
                }
            }
        },

        mochaccino: {
            all: [ "test/**/*.test.js" ]
        }
    });

    grunt.registerTask("default", [
        "clean",
        "jshint",
        "uglify"
    ]);
};
