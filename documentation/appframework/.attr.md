#.attr(attribute,[value])

```

Gets or sets an attribute on an element
If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
      
```

##Example

```
      $().attr("foo"); //Gets the first elements "foo" attribute
      $().attr("foo","bar");//Sets the elements "foo" attribute to "bar"
      $().attr("foo",{bar:"bar"}) //Adds the object to an internal cache
      
```


##Parameters

```
attribute                     String|Object
[value]                       String|Array|Object|function

```

##Returns

```
String,Object,Array,Function  If used as a getter, return the attribute value. If a setter, return an appframework object
```

