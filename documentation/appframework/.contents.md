#.contents(selector)

```

Returns the child nodes of the elements based off the selector and includes text nodes
      
```

##Example

```
      $("#foo").contents(".bar"); //Selector
      $("#foo").contents($(".bar")); //Objects
      $("#foo").contents($(".bar").get(0)); //Single element
      
```


##Parameters

```
[selector]                    String|Array|Object

```

##Returns

```
Object                        appframework object with unique children
```

