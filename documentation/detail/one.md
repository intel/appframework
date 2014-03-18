$().one(event,callback) Registers an event listener and only executes it once.

There are many times where you only want an event to happen one time, and then remove it.  This allows you to do that.

```js
$("#testAnchor").one("click",function(){alert("Submitting form")});
```
