# App Framework - a HTML5 targeted Javascript Framework

App Framework is a Javascript framework targeted at HTML5 browsers with a blazingly fast query selector library that supports W3C queries.

Visit <http://app-framework-software.intel.com/index.php> for more information, documentation, and support.

Visit <http://app-framework-software.intel.com/documentation.php#afui/afui_jquery> for more information on using App Framework UI and jQuery.

# Contribute

You can contribute to the core code by forking it and make a pull request.  Please keep in mind we do not want to add functionality that is a one-off case.  These are best dealt with via plugins.

You can make changes to the following files.

1. appframework.js
2. css/*.css
3. ui/appframework.ui.js
4. ui/transitions/*.js
5. plugins/*.js
6. plugins/css/*.css


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

1) Zepto.js - Thomas Fuchs (MIT X11 License)

2) qUnit - jQuery Foundation (MIT X11 License)

3) ayepromise - Christoph Burgmer (BSD License)