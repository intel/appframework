$().hasClass(name) checks to see if an element has a class.

Assume there is an element that displays some content usinge the "greenredclass" css class
```html
<div style='border:1px solid black' id="hasclass_content" class="greenredclass">This is some content</div>
```


You can then use $().hasClass() to determine if the element has that class or not.
```js
$("#hasclass_content").hasClass("greenredclass");
```
 

</br>   
<div style='border:1px solid black' id="hasclass_content" class="greenredclass">This is some content</div>
<input type="button" value="Has greenredclass?" onclick='alert($("#hasclass_content").hasClass("greenredclass"))'>
<input type="button" value="Has blueyellowclass?" onclick='alert($("#hasclass_content").hasClass("blueyellowclass"))'>