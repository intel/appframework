# App Framework - a HTML5 targeted Javascript Framework

App Framework is a UI framework targeted at HTML5 browsers.

Visit <http://app-framework-software.intel.com/index.php> for more information, documentation, and support.

#2.2 support
Visit <http://app-framework-software.intel.com/af22/index.php> for App Framework 2.2 documentation.

#3.0 version

The 3.0 version of App Framework removes the following

1. Query selector library - instead use jQuery* or Zepto*
2. Only supports Android* 4+, iOS* 6+, WP* 8, FF* OS and Blackberry* 10
3. No longer provides a "Touchlayer", use Fastclick (https://github.com/ftlabs/fastclick) instead.
4. Native scrolling is only used.  If you need a JS scroller, use an existing one like FTScroller (https://github.com/ftlabs/ftscroller) or iScroll

##Note
You can still use App Framework 2 if you need Android <4 support or the query selector library.  The old query selector library *may* work with AF 3.0, but we do not test or support it.

# Contribute

You can contribute to the core code by forking it and make a pull request.  Please keep in mind we do not want to add functionality that is a one-off case.  These are best dealt with via plugins.

You can make changes to any of the files in the "src" directory



#Building

We use Grunt to build our compiled files.  When you have made a change, run "grunt rebuild" to compile new source and minified files to include in your PR.

grunt-closure-compiler requires the closure compiler jar file.  The path is set in Gruntfile.js, but by default should exist in a directory called "closure" parallel to App Framework

```
  -- appframework
  -- closure
    -- build
      -- compiler.jar
```

# Pull Requests

Pull requests will not be considered without the following:

1. Explanation of the bug
2. Test case that proves the current code base is failing
3. Explanation of the fix

We will pull the code down and test it and then provide feedback.  If everything passes, we will merge and rebuild the files.


# Bugs

Please use github issues and file any bugs with the following

1. Any error messages from the console

2. Line numbers of offending code

3. Test cases

4. Description of the error

5. Expected result

6. Browser/Device you are testing on


# License

App Framework is is licensed under the terms of the MIT License, see the included license.txt file.

App Framework uses code from the following software:

1) Karma Test Runner - https://github.com/karma-runner/karma (MIT-X11 License)