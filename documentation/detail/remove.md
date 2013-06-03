$().remove(selector) removes elements based off a selector

Assume we have an element that displays some content
```html
<div id="some_content" style="border:1px solid green">This is content that will be removed from the DOM.</div>
```


We then use $().remove() to remove the element from the DOM
```js
$("#some_content").remove();
```


</br>
<div id="some_content" style="border:1px solid green">This is content that will be removed from the DOM.</div>
</br>
<input type="button" value="Remove Element" onclick='$("#some_content").remove();'>
