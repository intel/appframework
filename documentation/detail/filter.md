$().filter(selector) reduces a collection to elements that match the selector

Let's say we have all &lt;li> elements and we want to filter to only elements that have class "anchor"


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

```js
$("ul li").filter(".anchor");
```

<ul id="filterTest">
    <li class="anchor">One</li>
    <li class="anchor">Two</li>
    <li>Three</li>
    <li>Four</li>
    <li>Five</li>
    <li>Six</li>
</ul>


<input type="button" value="Get All LI count" onclick="alert($('#filterTest li').length)">

<input type="button" value="Get Filtered count" onclick="alert($('#filterTest li').filter('.anchor').length)">