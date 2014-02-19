$().not(selector) reduces a collection to elements that do not match the selector

Let's say we have all &lt;li> elements and we want to remove the elements that have class "anchor"


```html
<ul>
    <li class="anchor">One</li>
    <li class="anchor">Two</li>
    <li>Three</li>
    <li>Four</li>
    <li>Five</li>
    <li>Six</li>
</ul>
```


By calling not of ".anchor", we will reduce our set from six elements to four.

```js
$("ul li").not(".anchor");
```
