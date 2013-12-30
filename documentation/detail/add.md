$().add(select) adds additional objects to an existing App Framework collection

Assume there is an existing collection of divs
```js
var divs=$("div");
```


then using $().add(selector) we can add other elements to the collection based off the selector
```js
var divandspan=$("div").add("span");
```
 

</br>   
<div style='border:1px solid black' id="adddiv_content">This is a div content</div>
<div style='border:1px solid black' id="addspan_content">This is a span content</div>
<input type="button" value="Get Div" onclick='alert($("#adddiv_content").length)'>
<input type="button" value="Get Div and add span" onclick='alert($("#adddiv_content").add("#addspan_content").length)'>