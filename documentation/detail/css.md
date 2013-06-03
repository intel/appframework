$().css() will get or set CSS properties on the DOM nodes

If you pass in two parameters, a key and value, it will set the CSS property

If you only supply a key, it will return the first objects value.

Additionally, you can pass in an object as the first parameter and it will set multiple values


```js
$("div").css("display","none"); //Set display:none on all divs

$("span").css("display");//Get the display property of the first span

$("div").css({color:'red',background:'black'});//Set the color to red, and the background color to black on all divs
```



<div id="css:test">
	This is the CSS test div
</div>

<input type="button" value="Set background color" onclick="$('#css:test').css('background','green');"> <input type="button" value="Get background color" onclick="alert($('#css:test').css('background'));">   <input type="button" value="Set has properties" onclick="$('#css:test').css({'background':'blue',color:'pink'});">