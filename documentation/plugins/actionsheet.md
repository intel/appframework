#actionsheet

The actionsheet plugin let's developers create an action sheet for the user to interact with.  We always add a last "Cancel" option to the actionsheet.

```
$(selector).actionsheet(options)
```

## Properties

#### Attributes
You can pass in a string of anchors that will be rendered or an array of objects.  Below are for each object in the array.

```
text                          (string) Text to show for  actionsheet element
cssClass                      (string) CSS class actionsheet element
```

#### Functions

```
click(function)               Function to execute for the item selected
```


## Methods
```
hideSheet()                   Dismiss the actionsheet.
```

## Events
```
none
```

## CSS/Customize

Below is an example used by App Framework's iOS7 theme to customize the look and feel of the popup

```
/* The main container*/
#afui.ios7 #af_actionsheet {
    background-color:transparent;
    color:black;
    padding-left:10px;
    padding-right:10px;
    border-top: transparent 1px solid;
    box-shadow: 0px -1px 2px rgba(0,0,0,0);
}

/* Styling for each anchor*/
#afui.ios7 #af_actionsheet a{
    background-image:none;
    text-shadow:none;
    box-shadow:none;
    font-weight:normal;
    border-radius: 0;
    border:none;
    -webkit-box-shadow:none;
    color:rgba(82,155,234,255);
    background-color:white;
    cursor:pointer;
    border-radius:0px;
    line-height: 40px;
    font-size: 20px;
    margin-bottom: 1px;
}

/* Custom styles for the first anchor */
#afui.ios7 #af_actionsheet a:first-child{
    border-top-left-radius:5px;
    border-top-right-radius:5px;
}

/* Custom style for the last anchor */
#afui.ios7 #af_actionsheet a:nth-last-child(2){
    border-bottom-left-radius:5px;
    border-bottom-right-radius:5px;
}

/* Special styles for the cancel anchor*/
#afui.ios7 #af_actionsheet a.cancel{
    font-weight:bold;
    margin: 9px 0;
    border-radius:5px;
}

```


## Examples

Here is a basic alert style popup.  You can pass in a string instead of an object.  Any clicks, events, etc are available to the anchors.

```
$(document.body).actionsheet('<a  onclick="alert(\'hi\');" >Hi</a><a  onclick="alert(\'goodbye\');">Goodbye</a>');
```

Below is an example using an array of objects.  We can specify custom CSS classes and click handlers for each anchor

```
$(document.body).actionsheet(
    [{
        text: 'back',
        cssClasses: 'red',
        click: function () {
            alert("Clicked Back")
        }
    }, {
        text: 'Alert Hi',
        cssClasses: 'blue',
        click: function () {
            alert("Hi");
        }
    }, {
        text: 'Alert Goodbye',
        cssClasses: '',
        click: function () {
            alert("Goodbye");
        }
    }]
);
```

Here we will dismiss the actionsheet in 5 seconds if there is no response from the user

```
var sheet=$(document.body).actionsheet('<a  onclick="alert(\'hi\');" >Hi</a><a  onclick="alert(\'goodbye\');">Goodbye</a>');
setTimeout(function(){
    sheet.hideSheet();
},5000);
```