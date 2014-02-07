#Passwords

This plugin fixes known issues with input type="password" on Android <4 when -webkit-transform:translate3d is applied to an ancestor.  


```
$.passwordBox;  //An object assigned to App Framework
```

## Properties

#### Attributes

```
none
```

#### Functions

```
none
```



## Methods

```
changePasswordVisiblity(hideOrShow,id)  Toggle password visibility.  hideOrShow is an integer (1 = show, 0 = hide) and id is the element id to toggle
```

## Events
```
None
```

## CSS/Customize



## Examples

Here we will fix all password boxes for the document

```
$.passwordBox.getOldPasswords(); //No parameter will default to the document
```

Now we will specify a specific div

```
$.passwordBox.getOldPasswords("main"); //Fix passwords in div with id "main"
```

Here we will show how to toggle visibility of a specific input box

```
$.passwordBox.changePasswordVisibility(1,"password");// Integer - 1 to show 0 to hide
```

Here we will hide it

```
$.passwordBox.changePasswordVisibility(0,"password");// Integer - 1 to show 0 to hide
```
