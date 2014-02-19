$().insertBefore(element) Inserts a collection before the element in the dom.

Let's say we want to move all paragraphs before an element with id ="insertBeforeTest"
```html
<div>Some stuff</div>
<div id="insertBeforeTest">P's will go before me</div>
<p>This is p1</p>
<p>This is p2</p>
```


We can find all the p tags, then insert before #insertBeforeTest
```js
$("p").insertBefore("#insertBeforeTest");
```
