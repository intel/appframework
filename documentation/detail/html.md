$().html() will get or set the innerHTML property of DOM node(s)

If you pass in a string, it will set the innerHTML of all the DOM nodes to the new value.

If you do not have a parameter, it will return the first elements innerHTML value;

```html
<div id="bar">
	This is some html
</div>
<div id="foo">
	We will update this
</div>
```


```js
var html=$("#bar").html();
$("#foo").html("new content");
```
