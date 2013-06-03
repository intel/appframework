$().hide() will set the element's display property to "none", thus hiding the div content.

Consider that there is a div with some content that you want to hide

```html
<div id="hide_content" style="border:1px solid green">
	This is the content we will hide
</div>
```

Based upon some event, you can then hide the div

```js
$("#hide_content").hide();
```

</br>
<div id="hide_content" style="border:1px solid green">This is the content we will hide</div>
<input type="button" value="Hide Div" onclick="$('#hide_content').hide();">