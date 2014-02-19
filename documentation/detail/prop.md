$().prop(property,[value]) gets or sets a property of an HTML element.

First set up an element
```html
<div id="property_content"></div>
```

Then set a property value by specifying a property name and value of "hello"
```js
$("#property_content").prop("test_prop","hello");
```

We then use $().prop along with the property name to get the value and show it in an alert.  If you attempt to get the value before it is assigned,  we return undefined.
```js
alert($("#property_content").prop("test_prop"));
```
