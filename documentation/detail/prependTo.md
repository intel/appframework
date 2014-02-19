$().prependTo(element|selector) prepends  the collection to an element

Assume we have found all the paragraphcs on the page and want to move them into another div

```js
var paragraphs=$("p");
```

Now let's put them in a div with the id called "paragraphs".  The will move to the dop

```js
$("#prependTest p").prependTo("#paragraphsPrepend");
```


```html
<div id="paragraphsPrepend">
   This content will stay at the bottom when the <p> tags are moved
</div>
<div id="prependTest">
    <p>Paragraph One</p>
    <p>Paragraph Two</p>
</div>
```
