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

<div id="siblingstest1">
    <div id='siblingtestgc1' class="siblingstest">
        <div id='siblingtestgc3'  class="siblingsgcstest">GC</div>
    </div>
    <div id='siblingtestgc2'  class="siblingstest">Child</div>
     <div id='siblingtestgc4'  class="siblingstest">Child</div>
</div>
<script>
function getSiblings(){
    var obj=$("#siblingtestgc1").siblings();
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}
function getSiblingsGC(){
    var obj=$(".siblingsgcstest").siblings();
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
<input type="button" value="Get siblingtestgc1 siblings" onclick="getSiblings()"><br>
this will be empty since there are no other elements in the div

<input type="button" value="Get .siblingsgcstest siblings" onclick="getSiblingsGC()">