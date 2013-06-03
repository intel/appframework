$().show() will set the elements display property to "block", thus showing the content.

First set up a div with the content you want to show.
```html
<div id="show_content" style="border:1px solid green;display:none;">
  Hello --  I am some content
</div>
```

Then perfom some function to show the div
```js
$("#show_content").show();
```

</br>
<div id="show_content" style="border:1px solid green;display:none;">Hello -- I am some content</div>
<input type="button" value="Show Div" onclick="$('#show_content').show();">