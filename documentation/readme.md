#App Framework documentation generator

To generate the api pages, we use the following tools.

1) dox (node.js) module

2) markdown files for examples

3) php script to generate the html file


#Source documentation

We use jsdoc style documentation for generating the docs.  Anything you do not want to show in the documentation pages, use the following.

```js
   * @api private
```

#dox

Dox is found at https://github.com/visionmedia/dox

#Contributing

Make sure you have dox installed and it's dependences.  Run dox on the following files

```
  appframework.js

  ui/appframework.ui.js
```

#Examples

Exampes are in the "detail" folder in here, which are markdown files.  You can edit the examples to make changes or enhance them.

#Building

See build.bat - this runs dox to create the needed json file, then docgen.php to create the output.

#Output

The output is found in "index.html" in the documentation page.  This gets uploaded to the App Framework site.