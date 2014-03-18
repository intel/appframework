#.filter(selector);

```

Filters elements based off the selector
      
```

##Example

```
      $("#foo").filter(".bar"); //Selector
      $("#foo").filter($(".bar")); //Objects
      $("#foo").filter($(".bar").get(0)); //Single element
      
```


##Parameters

```
selector                      String|Array|Object

```

##Returns

```
Object                        Returns an appframework object after the filter was run
```

