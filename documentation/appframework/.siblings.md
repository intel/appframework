#.siblings(selector)

```

Returns the siblings of the element based off the selector
      
```

##Example

```
      $("#foo").siblings(".bar"); //Selector
      $("#foo").siblings($(".bar")); //Objects
      $("#foo").siblings($(".bar").get(0)); //Single element
      
```


##Parameters

```
[selector]                    String|Array|Object

```

##Returns

```
Object                        appframework object with unique siblings
```

