$().removeAttr(attribute) removes an attribute of an HTML element.

Assume we set a default attribute value of an element to "foo"
```html
<div id="removeattr_content" test_attr="foo"></div>
```


We then use $().attr along with the attribute name to get the value and show it in an alert.
```js
alert($("#removeattr_content").attr("test_attr"));
```

The attribute can then be removed by using $().removeAttribute() and specifying the attribute name
```js
$("#removeattr_content").removeAttr("test_attr");
```

</br>
<div id="removeattr_content" test_attr="foo">The test_attr attribute is set to "foo"</div>
<input type="button" value="Get Attribute" onclick='alert($("#removeattr_content").attr("test_attr"));'>
<input type="button" value="Remove Attribute" onclick='$("#removeattr_content").removeAttr("test_attr");'>