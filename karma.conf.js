module.exports = function (karma) {
    karma.set({

// base path, that will be used to resolve files and exclude
        basePath: './',

        frameworks: ['mocha'],
        preprocessors: {
            'test/fixtures/*.html': ['html2js'],
            '**/src/*.js': 'coverage'
        },

// list of files / patterns to load in the browser
        files: [
            {pattern: 'node_modules/chai/chai.js', include: true},
            {pattern: '3rdparty/jquery.min.js', served: true, included: true},
            {pattern: 'build/appframework.ui.js',served: true, included: true},
            {pattern: 'test/chai.helper.js', include: true},
            'build/af.ui.css',
            'test/fixtures/*.html',
            'test/*.test.js'
            /*'test/drawer.test.js'*/

        ],

// list of files to exclude
        exclude: [
            'karma.conf.js'
        ],

// use dots reporter, as travis terminal does not support escaping sequences
// possible values: 'dots', 'progress', 'junit', 'teamcity'
// CLI --reporters progress
        reporters: ['progress', 'coverage'],

//Code Coverage options. report type available:
//- html (default)
//- lcov (lcov and html)
//- lcovonly
//- text (standard output)
//- text-summary (standard output)
//- cobertura (xml format supported by Jenkins)
        coverageReporter: {
            // cf. http://gotwarlost.github.com/istanbul/public/apidocs/
            type: 'html',
            dir: 'coverage/'
        },


// web server port
        port: 9876,


// cli runner port
        runnerPort: 9100,


// enable / disable colors in the output (reporters and logs)
        colors: true,


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        //logLevel: LOG_DEBUG,


// enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
// CLI --browsers Chrome,Firefox,Safari
        browsers: ['Chrome'],


// If browser does not capture in given timeout [ms], kill it
        captureTimeout: 6000,


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
        singleRun: true,


        plugins: [
            'karma-mocha',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-htmlfile-reporter',
            'karma-html2js-preprocessor'
        ]
    });
}