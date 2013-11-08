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


Below is a list.  There is a button to append options to the list.  We will delegate the click to the &lt;ol> and then select the &lt;li> it was click on to execute.


Click an item below
<ol id="onTest">
    <li>One</li>
    <li>Two</li>
</ol>

<script>

var counter=1;
function addElement(){
    $("#onTest").append("<li>Added "+counter+"</li>");
    counter++;
}

$("#onTest").on("click","li",function(){alert(this.innerHTML)});
</script>


<input type="button" value="Add item" onclick="addElement()">

