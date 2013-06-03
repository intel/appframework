$().removeProp(property) removes a property of an HTML element.

First set up an element
```html
<div id="property_content"></div>
```

Then set a property with a value of "hello"
```js
$("#property_content").prop("test_prop","hello");
```

Later you can use $().removeProp using the property name to remove the property from the element.
```js
$("#property_content").removeProp("test_prop");
```

</br>
<div id="property_content"></div>
<input type="button" value="Set Property" onclick='$("#property_content").prop("test_prop","hello");'>
<input type="button" value="Get Property" onclick='alert($("#property_content").prop("test_prop"));'>
<input type="button" value="Remove Property" onclick='$("#property_content").removeProp("test_prop");'>
