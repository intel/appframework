$().removeClass(name) will remove a css class from an element.

Assume there is an element that displays some content usinge the "greenredclass" css class
```html
<div style='border:1px solid black' id="removeclass_content" class="greenredclass">This is some content</div>
```


Then using $().removeClass() we can remove the css class defined as by greenredclass to that element.
```js
$("#removeclass_content").removeClass("greenredclass");
```
 

</br>   
<div style='border:1px solid black' id="removeclass_content" class="greenredclass">This is some content</div>
<input type="button" value="Remove the Class" onclick='$("#removeclass_content").removeClass("greenredclass");'>