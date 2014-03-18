$().unbind(event,callback) unbinds an event for each element in the collection.

If no callback function is passed in, we remove all listeners for that event.


Below is a sample of unbinding all click event to all list items
```js
$("ol li").unbind("click");
```

Say we had multiple click listners, but only want to unbind one
```js
function bindOne(){
}

function bindTwo(){
}

$("ol li").bind("click",bindOne);
$("ol li").bind("click",bindTwo);
```

Now we want to unbind only "bindOne"

```js
$("ol li").unbind("click",bindOne);
```

```html
<ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
</ol>
```
