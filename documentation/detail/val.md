$().val([value]) gets or sets the value of an HTML element.

Provide a method for a user to set a value,
```html
<input type="text" id="value_input" size=15>
```

Then use $().val to get the value that was input and show it in an alert.
```js
alert($("#value_input").val());
```

Or you can set a default value within your code
```js
$("#value_input").val("Default Value");
```
