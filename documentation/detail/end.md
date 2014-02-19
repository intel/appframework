$().end() rolls back the elements before filtering

Let's look at the filter example below.

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


By calling filter of ".anchor", we will reduce our set from six elements to two.
After we call end(), it will reduce the set back to $("ul li");

```js
$("ul li").filter(".anchor").end();
```
