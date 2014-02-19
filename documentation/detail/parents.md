$().parents([selector]) returns the parents of each element in the collection and traverses up the DOM, filtered by the optional selector

Let's look at the following html structure

```html
<div id="parents1">
    <div class="childs">
        <div class="gcs">GC</div>
    </div>
</div>
<div id="parents2">
    <div class="childs">Child</div>
</div>
```


Now we will get the parent elements of everything with the class "child"
```js
$(".child").parent();
```
