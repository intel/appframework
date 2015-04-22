var path = require("path");

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-mochaccino");
    grunt.loadNpmTasks("grunt-closure-compiler");
    grunt.loadNpmTasks("grunt-banner");
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [ "build/cov" ],

        // see .jshintrc file for the options;
        // options are explained at http://www.jshint.com/docs/config/
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },

            core: [ "src/*.js" ],

        },
        karma: {
            unit: {
                  configFile: 'karma.conf.js'
                    }
        },

        concat: {
            afui:{
                files: {
                    "build/appframework.ui.js": [
                        "src/af.shim.js",
                        "src/af.ui.js",
                        "src/af.actionsheet.js",
                        "src/af.grower.js",
                        "src/af.touchEvents.js",
                        "src/af.animateheader.js",
                        "src/af.popup.js",
                        "src/af.animation.js",
                        "src/af.splashscreen.js",
                        "src/af.drawer.js",
                        "src/af.swipereveal.js",
                        "src/af.desktopBrowsers.js",
                        "src/af.toast.js",
                        "src/af.lockscreen.js"
                    ]
                }
            },
            less: {
                files: {
                    "build/af.ui.less":[
                        "src/less/main.less",
                        "src/less/anim2.less",
                        "src/less/animation.less",
                        "src/less/*.less"
                    ]
                }
            },
            lessBase: {
                files: {
                    "./build/af.ui.base.less": [
                    "src/less/main.less",
                    "src/less/anim2.less",
                    "src/less/animation.less",
                    "src/less/appframework.less",
                    "src/less/af.actionsheet.less",
                    "src/less/af.popup.less",
                    "src/less/af.splashscreen.less",
                    "src/less/af.swipereveal.less",
                    "src/less/af.toast.less",
                    "src/less/badges.less",
                    "src/less/buttons.less",
                    "src/less/forms.less",
                    "src/less/grid.less",
                    "src/less/lists.less",
                    "src/less/splitview.less",
                    "src/less/af.lockscreen.less"
                    ]
                }
            }
        },
        "closure-compiler": {
            "appframework-ui": {
                closurePath: "../closure/",
                js: ["build/appframework.ui.js"],
                jsOutputFile: "build/appframework.ui.min.js",
                options: {
                },
                maxBuffer: 500,
                noreport:true
            },
        },
        usebanner: {
            taskName: {
                options: {
                    position: "top",
                    banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - "+
                        "<%= grunt.template.today('yyyy-mm-dd') %> */\n",
                    linebreak: true
                },
                files: {
                    src: [ "build/*.js","build/*.js","build/css/*.css" ]
                }
            }
        },
        less: {
            development: {
                options: {
                    paths: ["./src/less"],
                    yuicompress: false
                },
                files: {
                    "./build/af.ui.css": "./src/less/*.less"
                }
            },
            base: {
                options: {
                    paths: ["./src/less"],
                    yuicompress: false
                },
                files: {
                    "./build/af.ui.base.css": [
                    "src/less/main.less",
                    "src/less/anim2.less",
                    "src/less/animation.less",
                    "src/less/appframework.less",
                    "src/less/af.actionsheet.less",
                    "src/less/af.popup.less",
                    "src/less/af.splashscreen.less",
                    "src/less/af.swipereveal.less",
                    "src/less/af.toast.less",
                    "src/less/badges.less",
                    "src/less/buttons.less",
                    "src/less/forms.less",
                    "src/less/grid.less",
                    "src/less/lists.less",
                    "src/less/splitview.less",
                    "src/less/af.lockscreen.less"
                    ]
                }
            }
        },
        watch: {
            files: "./src/less/*.less",
            tasks: ["less"]
        }
    });


    grunt.registerTask("default", [
        "jshint",
        "test",
        "clean",
        "closure-compiler",
        "usebanner",
        "watch"
    ]);

    grunt.registerTask("rebuild" , ["less","concat","closure-compiler","usebanner"]);
    grunt.registerTask("hint" , ["jshint"]);
    grunt.registerTask("test" , ["karma"]);

};