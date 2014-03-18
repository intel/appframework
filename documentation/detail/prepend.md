$().prepend(element) prepends to an element by calling append and setting insert to true.

Assume we have an element defined with content for which we want to add additional content
```html
<div id="prepend_content"><hr>I'll prepend content before the &lt;hr></div>
```


We then use $().prepend() to add the additional content before the &lt;hr> tag .
```js
$("#prepend_content").prepend("<span>Some more content<br /></span>");
```
