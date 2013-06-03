$().parent([selector]) returns the parents of each element in the collection, filtered by the optional selector

Let's look at the following html structure

```html
<div id="parent1">
    <div class="child">
        <div class="gc">GC</div>
    </div>
</div>
<div id="parent2">
    <div class="child">Child</div>
</div>
```


Now we will get the parent elements of everything with the class "child"
```js
$(".child").parent();
```

<div id="parent1">
    <div class="child">
        <div class="gc">GC</div>
    </div>
</div>
<div id="parent2">
    <div class="child">Child</div>
</div>
<script>
function getParent(){
    var obj=$(".child").parent();
   alert(obj[0].id+"  "+obj[1].id);
}
</script>
<input type="button" value="Get Parent" onclick="getParent()">