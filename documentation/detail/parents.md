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

<div id="parents1">
    <div class="childs">
        <div class="gcs">GC</div>
    </div>
</div>
<div id="parents2">
    <div class="childs">Child</div>
</div>
<script>
function getParents(){
    var obj=$(".childs").parents();
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}
function getParentGCs(){
    var obj=$(".gcs").parents();
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}

</script>
This test will have "parents1" and "parents2" and then the shared ancestors
<input type="button" value="Get .child Parent" onclick="getParents()"><br>
This test will not include "parent2", since gcs is a single element

<input type="button" value="Get .gc Parent" onclick="getParentGCs()">