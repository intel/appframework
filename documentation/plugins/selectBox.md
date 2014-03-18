#Select Box

This plugin fixes known issues with select boxes on Android <4 when -webkit-transform:translate3d is applied to an ancestor.  


```
$.selectBox; //An object assigned to App Framework
```

## Properties

#### Attributes

```
none
```

#### Functions

```
None
```

## Methods

```
getoldSelects(string)        Get old selectboxes for the element id passed in
```

## Events
```
None
```

## CSS/Customize
Please see the plugins/af.selectBox.css file for customizations


## Examples

Here we will fix all select boxes for the document

```
$.selectBox.getOldSelects(); //No parameter will default to the document
```

Now we will specify a specific div

```
$.selectBox.getOldSelects("main"); //Fix select boxes in div with id "main"
```
