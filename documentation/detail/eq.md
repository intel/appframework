$().eq(index) reduces the collection to the element at that index.  If the index is negative, it will go backwards.


Let's take the following list
```html
<ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    <li>Four</li>
    <li>Five</li>
</ol>
```

<ol id="eqTest">
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    <li>Four</li>
    <li>Five</li>
</ol>

Now we will get the html of the li at 0, 3 and -1.

0 = "One"
3 = "Four"
-1 = "Five"


<input type="button" value="eq(0)" onclick="alert($('#eqTest li').eq(0).html())">
<input type="button" value="eq(3)" onclick="alert($('#eqTest li').eq(3).html())">
<input type="button" value="eq(-1)" onclick="alert($('#eqTest li').eq(-1).html())">