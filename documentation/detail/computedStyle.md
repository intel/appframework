$().computedStyle(prop) returns the computed style of the element.

$().css() does not return the computed style, only the value associated with the style attribute.


Let's take the following example below.  $().css() and $().computedStyle will return two different values.


```html
<div id="compTest" style="background:green;width:100px;height:100%;" class="myClass1"></div>
```
<div style="width:100%;height:100px">
<div id="compTest" style="background:green;width:100px;height:100%;" class="myClass1"></div>
</div>

<input type="button" value="Get CSS" onclick="alert($('#compTest').css('height'));">

<input type="button" value="Get Computed Style" onclick="alert($('#compTest').computedStyle('height'));">