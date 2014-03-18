#.append(element,[insert],[content])

```

Appends to the elements
We boil everything down to an appframework object and then loop through that.
If it is HTML, we create a dom element so we do not break event bindings.
if it is a script tag, we evaluate it.
      
```

##Example

```
      $().append(""); //Creates the object from the string and appends it
      $().append($("#foo")); //Append an object;
      
```


##Parameters

```
Element/string                String|Object
[insert]                      Boolean

```

##Returns

```
Object                        appframework object
```

