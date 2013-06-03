$().append(element,[insert]) appends an element or content to an existing element.

Assume we have an element defined with content for which we want to add additional content
```html
<div id="append_content">I'll append content after the &lt;hr> <hr></div>
```


We then use $().append() to add the additional content after the &lt;hr> tag .
```js
$("#append_content").append("<span>Some more content</br></span>");
```

</br>
<div id="append_content">I'll append content after the &lt;hr> <hr></div>
<input type="button" value="Append Content" onclick='$("#append_content").append("<span>Some more content</br></span>");'>