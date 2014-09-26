#Toast

The toast plugin enables developers to deliver toast style messages to users

```
$.afui.toast(options)
```

## Properties

#### Attributes
You can pass in a string that will display a message, or an object of options

```
message                         (string) Text to show for toast message
position                        (string) possitions the message will be in
                                    tr - top right, tl - top left
                                    br - bottom right, br - bottom left
                                    tc - top center, bc - bottom center

delay							(ms)    Delay in milliseconds for auto-hiding the message

autoClose                       (boolean) Autoclose the toast from the delay
type                            (string) Type/css class for the message
									success - green
									error - red
									warning - yellow

addCssClass					     (string) CSS class to addd to the toast
```

#### Functions

```
none
```


## Methods
```
none
```

## Events
```
none
```

## Data Directive (maps to option parameters)
```
data-toast                          Declare the data-toast element
data-message					    message parameter
data-position						position parameter
data-type							type parameter
data-auto-close						autoClose parameter
data-delay							delay parameter


<a data-toast>Toast</a>
```


## Examples

Here are three examples.  Two uses JavaScript to display the toasts and another uses data attributes on the anchor

```
$.afui.toast({
	message:"Top Right",
	position:"tr",
	autoClose:false, //have to click the message to close
	type:"success"
});
```

Just display a message

```
$.afui.toast("Hello World");
```

###Directive example

Here we will dismiss the actionsheet in 5 seconds if there is no response from the user

```
<a class="button" data-toast data-message="I'm replacing an alert box I'm replacing an alert box" >Toast1</a>

<a class="button" data-toast data-type="error" data-message="Error found" data-position="br" >Toast2</a>
```