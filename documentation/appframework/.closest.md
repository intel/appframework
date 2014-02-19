#.closest(selector,[context]);

```

Returns the closest element based off the selector and optional context
      
```

##Example

```
      $("#foo").closest(".bar"); //Selector
      $("#foo").closest($(".bar")); //Objects
      $("#foo").closest($(".bar").get(0)); //Single element
      
```


##Parameters

```
selector                      String|Array|Object
[context]                     Object

```

##Returns

```
Object                        Returns an appframework object with the closest element based off the selector
```

