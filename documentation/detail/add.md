$().add(select) adds additional objects to an existing App Framework collection

Assume there is an existing collection of divs
```js
var divs=$("div");
```


then using $().add(selector) we can add other elements to the collection based off the selector
```js
var divandspan=$("div").add("span");
```
