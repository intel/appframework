#Slide Menu

This plugin allows users to drag to reveal the left side menu in an App Framework UI application.


To enable it, simply include the plugin into your applictaion.  By default, it is enabled and will always slide to reveal on phones and tablets.

##Properties
Below are properties you can set on the $.ui object to modify the plugin

```
$.ui.slideSideMenu = true; //Set to false to turn off the swiping to reveal
$.ui.fixedSideMenuWidth = 200000;//If you are using splitview, change this to the splitview threshold
```

##Split View

If you are using a split view for tablets, you want this to only work on phones.  You can do this by setting the property above to what the splitview threshold is for App Framework

```
$.ui.fixedSideMenuWidth = 768; //Default threshold for App Framework
```