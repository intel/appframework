$().replaceClass(old,new) will replace a css class on an element with another class.

Assume there is an element that displays some content usinge the "greenredclass" css class
```html
<div style='border:1px solid black' id="replaceclass_content" class="greenredclass">This is some content</div>
```


Then using $().replaceClass() you can replace the greenredclass with the blueyellowclass.
```js
$("#replaceclass_content").replaceClass("greenredclass","blueyellowclass");
```
 
