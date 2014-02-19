$().clone(deep) clones all the DOM nods in the collection.  If deep is set to "true", it will also clone the elements children.


Let's say we have an ordered list and we want to keep adding elements by cloning the first LI.

```html
<ol>
    <li>Entry</li>
</ol>
```

We can clone and then add it to the list like the following.

```js
var obj=$("ol li").eq(0).clone();

$("ol li").append(obj);
```