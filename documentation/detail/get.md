$().get([index]) to get the raw DOM element 

Write a function that uses $().get(0) to get the first element
```js
function getElementByIndex(){
	var obj=$(".panel").get(0);
	alert("This is the first panel = "+obj.id);
}
```
You can then set up a way to call the function, in this case we set up a button

</br>
<script>
	function getElementByIndex(){
		var obj=$(".panel").get(0);
		alert("This is the first panel = "+obj.id);
	}
</script>

<input type="button" value="Get First Panel" onclick='getElementByIndex();;'>