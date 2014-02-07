#App Framework documentation generator

To generate the api pages, we use the following tools.

1) dox (node.js) module

2) markdown files for examples

3) node script to parse dox output

#Source documentation

We use jsdoc style documentation for generating the docs.  Anything you do not want to show in the documentation pages, use the following.

```
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

Run dox on the files needed.

```
dox < ../appframework.js > appframework.json
dox <../ui/appframework.ui.js > af.ui.json

node docgen.js "appframework.json" "af.ui.json"
```

This will create the new readme files in the folders

```
appframework
  $.ajax.md
   
af.ui
  $.ui.actionSheet.md
```