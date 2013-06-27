$().map is used to iterate through elements and execute a callback function on each element.   The elements can be an Array or an Object.

It returns a NEW App Framework object.

The following would loop through all checkboxes and return a string with every id as a comma separated string

```html
<form>
	Agree to terms?<input type='checkbox' id='terms'/><br/>
	Sign up for offers?<input type='checkbox' id='offers'><br/>
	<input type='submit' value='Go'/>
</form>
```

```js
$('input[type='checkbox']).map(function() {
	return this.id;
}).get(0).join(",");
```

The above would output the following <code>"terms, offers"</code>

Below is a more detailed example.  Here we will create a function to set the height to the smallest div.

```html
<input id="equalize" type="button" value="Equalize">
 
 
<div class="mapsample" style="background:red; height: 40px;width:50px;float:left;" ></div>
<div class="mapsample" style="background:green; height: 70px;width:50px;float:left;" ></div>
<div class="mapsample" style="background:blue; height: 50px;width:50px;float:left;" ></div>
 
 
 
<script>
$.fn.equalizeHeights = function() {
  var maxHeight = this.map(function(i,e) {
    return $(e).height();
  }).get(0);
 
  return this.height( Math.min.apply(this, minHeight)+"px" );
};
 
$('#equalize').bind("click",function(){
  $('.mapsample').equalizeHeights();
});
 
</script>
```

<div class="sample" style='height:100px'>

<input id="equalize" type="button" value="Equalize">
<div class='mapsample' style="background:red; height: 40px;width:50px;float:left; "></div>
<div class='mapsample' style="background:green; height: 70px;width:50px;float:left;"></div>
<div class='mapsample' style="background:blue; height: 50px;width:50px;float:left; "></div>
 
 
<script>
$.fn.equalizeHeights = function() {
  var minHeight = this.map(function(i,e) {
    return $(e).height();
  }).get(0);
 
  return this.height( Math.min.apply(this, minHeight)+"px" );
};
 
$('#equalize').bind("click",function(){
  $('.mapsample').equalizeHeights();
});
 
</script>

</div>