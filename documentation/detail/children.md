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

<div id="childstest1">
    <div id='childtestgc1' class="childstest">
        <div id='childtestgc3'  class="gcstest">GC</div>
    </div>
    <div id='childtestgc2'  class="childstest">Child</div>
</div>
<script>
function getChildren(){
    var obj=$("#childstest1").children();
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}
function getChildrenGC(){
    var obj=$(".childstest").children();
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}

</script>
This test will have to elements, but not include "gctest"
<input type="button" value="Get childtest1 children" onclick="getChildren()"><br>
this will only have "gctest" since there is only one child of both childtest divs

<input type="button" value="Get .childtest children" onclick="getChildrenGC()">