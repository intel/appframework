$().empty() will empty out the contents of the element.  It is better to use $().empty() than to simply use innerHTML with an empty string because it internally calls $.cleanUpContent to clean up tne node content which prevents memory links.

Consider that there is a div defined and you want to empty the content.
```html
<div id="empty_content" style="border:1px solid black">
	This is the content string we will empty
</div>
```

Empty the contents of the above defined div.

```js
$("#empty_content").empty();
```
