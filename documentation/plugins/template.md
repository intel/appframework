#Popup

The popup plugin allows you to creat your own stylized popup with App Framework.  It is non-blocking and allows more flexibility then native dialogs.  You can use this plugin to show messages, options, or even login forms.

```
$(selector).popup()
```

## Properties

#### Attributes

```
id                            (string) ID of DOM elemenet for the popup container
```

#### Functions

```
cancelCallback(function)      Function to execute when the cancel button is clicked
```

#### Events
```
```

## Methods

```
show()                        Call to present the popup to the user
```

## CSS/Customize

Below is an example used by App Framework's iOS7 theme to customize the look and feel of the popup

```

```


## Examples

Here is a basic alert style popup.  You can pass in a string instead of an object

```
 $(document.body).popup("I'm replacing an alert box");
```