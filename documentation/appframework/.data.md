#.data(key,[value]);

```

Gets or set data-* attribute parameters on elements (when a string)
When used as a getter, it"s only the first element
      
```

##Example

```
      $().data("foo"); //Gets the data-foo attribute for the first element
      $().data("foo","bar"); //Sets the data-foo attribute for all elements
      $().data("foo",{bar:"bar"});//object as the data
      
```


##Parameters

```
key                           String
value                         String|Array|Object

```

##Returns

```
String,Object                 returns the value or appframework object
```

