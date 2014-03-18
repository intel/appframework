$().attr(attribute,[value]) gets or sets an attribute of an HTML element.

Assume we set a default attribute value of an element to "foo"
```html
<div id="attr_content" test_attr="foo"></div>
```


We then use $().attr along with the attribute name to get the value and show it in an alert.
```js
alert($("#attr_content").attr("test_attr"));
```

The attribute can then be modified by assigning a new value of "bar" to the attribute
```js
$("#attr_content").attr("test_attr","bar");
```
