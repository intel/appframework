$().ready will execute a function as soon as the DOM is available.  If it is called after the DOM is ready, it will fire the event right away.


```html
<script>
$(document).ready(function(){
	//The dom is ready, do whatever you want
	$("#readytest").html("The dom is now loaded");
});
</script>
<div id="readytest">The dom is not ready</div>
```
