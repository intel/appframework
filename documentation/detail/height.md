$().height() returns the css height of the element based.  The "px" is stripped from the result.

Below we have to divs.  One has a fixed height, and the other is based off %

```html
<div id="heightTest" style="background:red;height:100px;height:100px;">
    This is content
</div>
<div id="heightTest2" style="background:green;height:100%;height:30%;">
    This is content 2
</div>
```


Now we will get the offset
```js
$("#heightTest").height();
```

</br>
<input type="button" value="height test 1" onclick='alert($("#heightTest").height())'>
<input type="button" value="height test 2" onclick='alert($("#heightTest2").height())'>
<div id="heightTest" style=";background:red;height:100px;height:100px;">
    This is content
</div>

<div id="heightTest2" style=";background:green;height:100%;height:30%;">
    This is content 2
</div>
