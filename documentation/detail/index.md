$().index(element) returns the numerical index of the element matching the selector.

Let's take the following list
```html
<ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    <li id="seven">Seven</li>
    <li>Four</li>
    <li>Five</li>
</ol>
```

Now we want to get the index of the element with id "seven"

```js
var ind=$("ol li").index("#seven");
```
