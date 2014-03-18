$().on() allows you to delegate events to a parent and then search for a selector to execute it against.

Say you have a list that you are adding items to dynamcally.  You want to capture a click on each one, but binding to individual one's on DOM changes is cumbersome.  Instead, you can bind to an ancestor, and then provide a selector to execute against.

```html
<ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
</ol>
```

To bind a click event, we can do

```js
$("ol").on("click","li",function(){alert(this.innerHTML)});
```


