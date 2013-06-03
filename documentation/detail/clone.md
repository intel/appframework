$().clone(deep) clones all the DOM nods in the collection.  If deep is set to "true", it will also clone the elements children.


Let's say we have an ordered list and we want to keep adding elements by cloning the first LI.

```html
<ol>
    <li>Entry</li>
</ol>
```

We can clone and then add it to the list like the following.

```js
var obj=$("ol li").eq(0).clone();

$("ol li").append(obj);
```

Below we can clone and add elements.  You can also change the text of the first element to see how the cloned nodes will reflecct it.


<script>
function changeNode(){
    $("#cloneTest li").eq(0).html("Updated Text");
}

function cloneTest(){
    $("#cloneTest li").eq(0).clone().appendTo("#cloneTest");
}
</script>

<ol id="cloneTest">
    <li>Entry</li>
</ol>

<input type="button" value="Clone a node" onclick="cloneTest()">

<input type="button" value="Change first LI html" onclick="changeNode()">