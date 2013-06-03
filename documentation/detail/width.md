$().width() returns the css width of the element based. The "px" is stripped from the result.

Below we have to divs.  One has a fixed width, and the other is based off %

```html
<div id="widthTest" style="background:red;width:100px;height:100px;">
    This is content
</div>
<div id="widthTest2" style="background:green;width:100%;height:100px;">
    This is content 2
</div>
```


Now we will get the offset
```js
$("#widthTest").width();
```

</br>
<input type="button" value="Width test 1" onclick='alert($("#widthTest").width())'>
<input type="button" value="Width test 2" onclick='alert($("#widthTest2").width())'>
<div id="widthTest" style=";background:red;width:100px;height:100px;">
    This is content
</div>

<div id="widthTest2" style=";background:green;width:100%;height:100px;">
    This is content 2
</div>
