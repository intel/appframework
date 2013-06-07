$().offset() returns the offset of the first element in the collection

The offset returns the following
<ol>
    <li>left</li>
    <li>top</li>
    <li>right</li>
    <li>bottom</li>
    <li>width</li>
    <li>height</li>
</ol>

Below we have a box absolutely positioned in the div.

```html
<div id="offsetTest" style="position:absolute;background:red;width:100px;height:100px;left:100px;top:100px;">
    This is content
</div>
```


Now we will get the offset
```js
$("#offsetTest").offset();
```

</br>
<input type="button" value="Get Offset" onclick='alert(JSON.stringify($("#offsetTest").offset()))'>
<div style="position:relative;width:100%;height:300px;">
<div id="offsetTest" style="position:absolute;background:red;width:100px;height:100px;right:100px;top:-50px;">
    This is content
</div>
</div>
