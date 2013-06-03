$().text() will get or set the innerText property of DOM node(s).  This will remove any HTML formatting/nodes.

If you pass in a string, it will set the innerText of all the DOM nodes to the new value.

If you do not have a parameter, it will return the first elements innerText value;

```html
<div id="bar">
	This is some text <a>Test</a>
</div>
<div id="foo">
	<div style='background:red'>This has a red background</div>
</div>
```


```js
var text=$("#bar").text();
$("#foo").text("new content");
```



<div id="text:bar">
	This is some text <a>Test</a>
</div>
<div id="text:foo">
	<div style='background:red'>This has a red background</div>
</div>

<input type="button" value="Get Text" onclick="alert($('#text:bar').text())"> <input type="button" value="Set Text" onclick="$('#text:foo').text('New Content')"> 