$().off(event,selector,[callback]) will remove a delegate added by $().on()

If a callback is specificed, it will only remove that callback.


Below is a sample of undelegating all click event to all list items
```js
$("ol").off("click","li");
```

Say we had multiple click listners, but only want to unbind one
```js
function bindOne(){
}

function bindTwo(){
}

$("ol").bind("click","li",bindOne);
$("ol").bind("click","li",bindTwo);
```

Now we want to unbind only "bindOne"

```js
$("ol").unbind("click","li",bindOne);
```

```html
<ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
</ol>
```

Click one of the items below.
<ol id="offTest">
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
</ol>

<script>
$("#offTest").on("click","li",function(event){alert(this.innerHTML)});
function offTest(){
    $("#offTest").off("click","li");
    alert("Click event removed");
}
</script>

<input type="button" value="Undelegate LI events" onclick="offTest()">