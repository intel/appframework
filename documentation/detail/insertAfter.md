$().insertAfter(element) Inserts a collection after the element in the dom.

Let's say we want to move all paragraphs after an element with id ="insertBeforeTest"

```html
<p>This is p1</p>
<p>This is p2</p>
<div id="insertAfterTest">P's will go after me</div>
<div>Some stuff</div>
```


We can find all the p tags, then insert after #insertAfterTest
```js
$("p").insertAfter("#insertAfterTest");
```
