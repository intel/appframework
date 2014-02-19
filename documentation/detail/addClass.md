$().addClass(name) adds a css class to the element.

Assume there is an element that displays some content
```html
<div style='border:1px solid black' id="cssclass_content">This is some content</div>
```


Then using $().addClass() we can apply the css defined as by greenredclass to that element.
```js
$("#cssclass_content").addClass("greenredclass");
```
