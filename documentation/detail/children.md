$().children([selector]) returns the children of each element in the collection, filtered by the optional selector

Let's look at the following html structure

```html
<div id="childstest1">
    <div id='childtestgc1' class="childstest">
        <div id='childtestgc3'  class="gcstest">GC</div>
    </div>
    <div id='childtestgc2'  class="childstest">Child</div>
</div>
```


Now we will get the child elements of everything of parents
```js
$("#childtest1").children();
```
