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



<div id="html:bar">
	This is some html
</div>
<div id="html:foo">
	We will update this
</div>

<input type="button" value="Get HTML" onclick="alert($('#html:bar').html())"> <input type="button" value="Set HTML" onclick="$('#html:foo').html('New Content')"> 