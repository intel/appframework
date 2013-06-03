$().closest([selector]) for each element in the collection, including itself, it will search and traverse up the dom until it finds the first element matching the selector.  If the elements in the collection match the selector, it will return those.



```html
<div id="closest1" class="grandparent">
    <div id='closestgc1' class="closest">
        <div id='closestgc3'  class="closest">GC</div>
    </div>
    <div id='closestgc2'  class="closest">Child</div>
</div>
```


Now lets get the closest div
```js
$("#closestgc3").closest('div');
```

Or we can find the closest "grandparent" class
```js
$(".closest").closest(".grandparent");
```

<div id="closest1" class='grandparent'>
    <div id='closestgc1' class="closest">
        <div id='closestgc3'  class="closest">GC</div>
    </div>
    <div id='closestgc2'  class="closest">Child</div>
</div>
<script>
function getclosest(){
    var obj=$("#closestgc3").closest('div');
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}
function getclosestGC(){
    var obj=$(".closest").closest(".grandparent");
    var str="";
   obj.each(function(obj){
    if(this.id=="")
        return;
      str+=this.id+",";
   });
   alert(str);
}

</script>
This will be the closestgc3 div since it is a div
<input type="button" value="Get #closestgc3 div" onclick="getclosest()"><br>
This will traverse up to .grandparent from all the .closest class divs
<input type="button" value="Get .closest closest .grandparent" onclick="getclosestGC()">