$().toggle() will toggle the visibility of a div.  If the div is currently visible, it will be hidden.  If the div is currently hidden, it will be shown.    Using $().toggle(true) will force showing the div.

Consider the following div which is shown initially.
```html
<div id="toggle_content" style="border:1px solid green;display:block;">
	This is some content
</div>
```

Use toggle to switch the visibility to hide, then show again.
```js
$("#toggle_content").toggle();
```

</br> 
<div id="toggle_content" style="border:1px solid green;display:block;">This is some content</div>
<input type="button" value="Toggle Div" onclick="$('#toggle_content').toggle();">