$().bind(event,callback) binds an event for each element in the collection, and executes a callback when teh event is dispatched.

When calling $().bind(), the elements MUST already exist in the DOM to be able to recieve an event listener.  It is sometimes better to use
$().on instead for event delegation when your DOM has dynamic content.


Below is a sample of binding a click event to all list items
```
$("ol li").bind("click",function(event){alert(this.innerHTML)});
```

```html
<ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
</ol>
```
