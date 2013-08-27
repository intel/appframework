var path = require("path");

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
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
        // * ui includes both the appframework.ui.js file, the
        //   files in ui/transitions, and the needed plugins  (NOT appframework.js)
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
                    "ui/transitions/**/*.js",
                    "plugins/af.css3animate.js",
                    "plugins/af.scroller.js",
                    "plugins/af.popup.js",
                    "plugins/af.actionsheet.js",
                    "plugins/af.passwordBox.js",
                    "plugins/af.selectBox.js",
                    "plugins/af.touchEvents.js",
                    "plugins/af.touchLayer.js",
                    "plugins/af.8tiles.js"

                    ]
                }
            }
        },

        mochaccino: {
            unit: [ "test/**/*.test.js" ],

            // unit tests with coverage report in build/
            cov: {
                files: [
                    { src: "test/**/*.test.js" }
                ],
                reporter: 'html-cov',
                reportDir: 'build'
            }
        },
        cssmin: {
            all: {
                files: {
                'build/css/af.ui.min.css': [
                    "css/src/main.css",
                    "css/src/appframework.css",
                    "css/src/lists.css",
                    "css/src/forms.css",
                    "css/src/buttons.css",
                    "css/src/badges.css",
                    "css/src/grid.css",
                    "css/src/android.css",
                    "css/src/win8.css",
                    "css/src/bb.css",
                    "css/src/ios7.css",
                    "css/src/ios.css",
                    "plugins/css/af.actionsheet.css",
                    "plugins/css/af.popup.css",
                    "plugins/css/af.scroller.css",
                    "plugins/css/af.selectbox.css"
                    ]
                }
            },
            base: {
                files: {
                'build/css/af.ui.base.min.css': [
                    "css/src/main.css",
                    "css/src/appframework.css",
                    "css/src/lists.css",
                    "css/src/forms.css",
                    "css/src/buttons.css",
                    "css/src/badges.css",
                    "css/src/grid.css",
                    "plugins/css/af.actionsheet.css",
                    "plugins/css/af.popup.css",
                    "plugins/css/af.scroller.css",
                    "plugins/css/af.selectbox.css"
                    ]
                }
            }
        },
        concat: {
            cssall: {
                files: {
                'build/css/af.ui.css': [
                    "css/src/main.css",
                    "css/src/appframework.css",
                    "css/src/lists.css",
                    "css/src/forms.css",
                    "css/src/buttons.css",
                    "css/src/badges.css",
                    "css/src/grid.css",
                    "css/src/android.css",
                    "css/src/win8.css",
                    "css/src/bb.css",
                    "css/src/ios7.css",
                    "css/src/ios.css",
                    "plugins/css/af.actionsheet.css",
                    "plugins/css/af.popup.css",
                    "plugins/css/af.scroller.css",
                    "plugins/css/af.selectbox.css"
                    ]
                }
            },
            cssbase: {
                files: {
                'build/css/af.ui.base.css': [
                    "css/src/main.css",
                    "css/src/appframework.css",
                    "css/src/lists.css",
                    "css/src/forms.css",
                    "css/src/buttons.css",
                    "css/src/badges.css",
                    "css/src/grid.css",
                    "plugins/css/af.actionsheet.css",
                    "plugins/css/af.popup.css",
                    "plugins/css/af.scroller.css",
                    "plugins/css/af.selectbox.css"
                    ]
                }
            },
            afui:{
                 files: {
                    "build/ui/appframework.ui.js": [
                    "ui/src/appframework.ui.js",
                    "ui/transitions/**/*.js",
                    "plugins/af.css3animate.js",
                    "plugins/af.scroller.js",
                    "plugins/af.popup.js",
                    "plugins/af.actionsheet.js",
                    "plugins/af.passwordBox.js",
                    "plugins/af.selectBox.js",
                    "plugins/af.touchEvents.js",
                    "plugins/af.touchLayer.js",
                    "plugins/af.8tiles.js"

                    ]
                }
            }
        }
    });

    // NB jshint is disabled for now as it fails with the current code
    grunt.registerTask("default", [
        "clean",
        "test",
        "uglify",
        "cssmin",
        "concat"
    ]);

    grunt.registerTask("test", ["mochaccino:unit"]);
    grunt.registerTask("cov", ["clean", "mochaccino:cov"]);
};
