$().siblings([selector]) returns the siblings of each element in the collection, filtered by the optional selector

Let's look at the following html structure

```html
<div id="siblingstest1">
    <div id='siblingtestgc1' class="siblingstest">
        <div id='siblingtestgc3'  class="siblingsgcstest">GC</div>
    </div>
    <div id='siblingtestgc2'  class="siblingstest">Child</div>
    <div id='siblingtestgc4'  class="siblingstest">Child</div>
</div>
```


Now we will get the child elements of everything of parents
```js
$("#siblingtest1").siblings();
```
