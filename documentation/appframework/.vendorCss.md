#.vendorCss(attribute,[value])

```

Gets or sets css vendor specific css properties
If used as a get, the first elements css property is returned
      
```

##Example

```
      $().vendorCss("transform"); // Gets the first elements background
      $().vendorCss("transform","Translate3d(0,40,0)")  //Sets the elements background to red
      
```


##Parameters

```
attribute                     String
value                         String

```

##Returns

```
Object                        an appframework object
```

