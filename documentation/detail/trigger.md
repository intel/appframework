$().trigger(event,data) allows you to trigger any event on the collection.  This is usefull for emulating events, or sending custom events for listeners and delegates.

```
$("#triggerTest").trigger("customEvent");
```

Below is a div that we will register "customEvent" for
```html
<div id="triggerTest">Won't respond to a click</div>
```

```js
$("#triggerTest").bind("customEvent",function(){alert("Responding to custom event")});
```

<div id="triggerTest">Won't respond to a click</div>

<script>
$("#triggerTest").bind("customEvent",function(){alert("Responding to custom event")});

function triggerIt(){
    $("#triggerTest").trigger("customEvent");
}
</script>


<input type="button" value="Trigger customEvent" onclick="triggerIt()">



