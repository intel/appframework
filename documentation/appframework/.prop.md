#.prop(property,[value])

```

Gets or sets a property on an element
If used as a getter, we return the first elements value.  If nothing is in the collection, we return undefined
      
```

##Example

```
      $().prop("foo"); //Gets the first elements "foo" property
      $().prop("foo","bar");//Sets the elements "foo" property to "bar"
      $().prop("foo",{bar:"bar"}) //Adds the object to an internal cache
      
```


##Parameters

```
property                      String|Object
[value]                       String|Array|Object|function

```

##Returns

```
String,Object,Array,Function  If used as a getter, return the property value. If a setter, return an appframework object
```

