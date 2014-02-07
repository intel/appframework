#Popup

The popup plugin allows you to creat your own stylized popup with App Framework.  It is non-blocking and allows more flexibility then native dialogs.  You can use this plugin to show messages, options, or even login forms.

```
$(selector).popup(options) // returns a reference to the popup object
```

## Properties

#### Attributes

You can pass in a string or an object to the popup function.  If you pass in a string, it will emulate an alert box.

```
id                            (string) ID of DOM elemenet for the popup container
title                         (string) Title to show for the popup
message                       (string) Text to display in the popup
cancelText                    (string) Text to display for the cancel button
doneText                      (string) Text to display for the done button
cancelOnly                    (bool/false) When true, only the cancel button will show
cancelClass                   (string) CSS class for the cancel button
doneClass                     (string) CSS Class for the done button
autoCloseDone                 (bool/false) When true, the popup will auto hide when the done button is pressed
supressTitle                  (bool/false) When true, the title will not be shown in the popup

```

#### Functions

```
cancelCallback(function)           Function to execute when the cancel button is clicked
doneCallback(function)             Function to execute when the done button is clicked
onShow(function)                   Function to execute when the popup is displayed to the user
```


## Methods

```
show()                        Call to present the popup to the user
hide()                        Call to dismiss the popup from the user
```

## Events
```
close                         When dispatched, this event will close the popup window programatically
```


## CSS/Customize

Below is an example used by App Framework's iOS7 theme to customize the look and feel of the popup

```
/* The main container/*
#afui.ios7 .afPopup {
    display: block;
    border:1px solid rgba(158,158,158,255);
    border-radius:10px;
    padding:0;
    text-align: center;
    width:280px;
    position: absolute;
    z-index: 1000000;
    top: 50%;
    color:inherit;
    background:rgba(249,249,249,1);
    text-align:center;
}

/* The title/*
#afui.ios7 .afPopup>HEADER{
    padding:10px 0;
}

/* The content area/*
#afui.ios7 .afPopup>DIV{
    font-size:14px;
    padding-bottom:10px;
}

/* The bottom where the buttons are displayed/*

#afui.ios7 .afPopup>FOOTER{
    border-top:1px solid #aaa;
}


/* The cancel/done buttons/*
#afui.ios7 .afPopup .button {
    border: none;
    width: 50%;
    margin: 0;
    background: transparent;
    color:rgba(82,155,234,255);
    padding:12px 0;
}

#afui.ios7 .afPopup .button.pressed {
    background: none;
}

#afui.ios7 .button.pressed {
    font-weight:bold;
    background: white;
}

#afui.ios7 .afPopup a:not(:first-of-type) {
    border-left:1px solid rgba(158,158,158,255);
}
```


## Examples

Here is a basic alert style popup.  You can pass in a string instead of an object

```
 $(document.body).popup("I'm replacing an alert box");
```

Below shows a more advanced example setting properties

```
 $(document.body).popup({
    title: "Alert! Alert!",
    message: "This is a test of the emergency alert system!! Don't PANIC!",
    cancelText: "Cancel me",
    cancelCallback: function () {
        console.log("cancelled");
    },
    doneText: "I'm done!",
    doneCallback: function () {
        console.log("Done for!");
    },
    cancelOnly: false
});
```

Here we will show a login prompt for the user
```
 $(document.body).popup({
    title: "Login",
    message: "Username: <input type='text' class='af-ui-forms'><br>Password: <input type='text' class='af-ui-forms' style='webkit-text-security:disc'>",
    cancelText: "Cancel",
    cancelCallback: function () {},
    doneText: "Login",
    doneCallback: function () {
        alert("Logging in")
    },
    cancelOnly: false
});
```

Now we will programatically dismiss the popup.  The first will be by callling "hide"

```
var popup=$(document.body).popup("This will hide after 3 seconds");
setTimeout(function(){
    popup.hide(); 
},3000);
```

Here we trigger the "close" event on the popup based of the id we gave it.

```
$(document.body).popup({
    id:"myPopup",
    title:"Hide",
    message:"auto hide after 3 seconds",
    cancelOnly:true
});
setTimeout(function(){
    $("#myPopup").trigger("close");
},3000);
```
