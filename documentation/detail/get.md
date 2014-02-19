$().get([index]) to get the raw DOM element 

Write a function that uses $().get(0) to get the first element
```js
function getElementByIndex(){
	var obj=$(".panel").get(0);
	alert("This is the first panel = "+obj.id);
}
```
