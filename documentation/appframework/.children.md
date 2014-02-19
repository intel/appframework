#.children(selector)

```

Returns the child nodes of the elements based off the selector
      
```

##Example

```
      $("#foo").children(".bar"); //Selector
      $("#foo").children($(".bar")); //Objects
      $("#foo").children($(".bar").get(0)); //Single element
      
```


##Parameters

```
[selector]                    String|Array|Object

```

##Returns

```
Object                        appframework object with unique children
```

