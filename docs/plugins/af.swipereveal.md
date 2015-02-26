#swipe to reveal

The swipe to reveal allows you to swipe an object and reveal another.  This is useful for "swipe to delete" implementations

To use this, simply include the js plugin and css file.



##Using

To use the plugin, add the class "swipe-reveal" to your container DOM node.  Inside the container should be two elements, the first with the content you want to show with class "swipe-content".  The second is the content to reveal with class "swipe-hidden"

```
<li class="swipe-reveal">
    <div class="swipe-content">Swipe to reveal with some options </div>
    <div class="swipe-hidden">
        <a class="button more">More</a>
        <a class="button archive" onclick="$(this).closest('.swipe-reveal').remove()">Archive</a>
    </div>
</li>
```