$().is(selector) returns a boolean if at least one element in the collection match the selector

Lets take the following html.

```html
<ol>
    <li>One</li>
    <li class="foo">Two</li>
    <li>Three</li>
</ol>
```

We will now check three cases.

```js
$("ol li").is("li"); //Check if they are LI elements

$("ol li").is(".foo"); //Check if there are any elements of class foo

$("ol li").is("div"); //Check if any elements are divs' - they are not
```

Run the tests below.  The last one will fail because a LI element can not be a div.

<ol id="isTest">
    <li>One</li>
    <li class="foo">Two</li>
    <li>Three</li>
</ol>


<input type="button" value="Check LI" onclick="alert($('#isTest li').is('li'))">

<input type="button" value="Check .foo" onclick="alert($('#isTest li').is('.foo'))">

<input type="button" value="Check DIV" onclick="alert($('#isTest li').is('div'))">