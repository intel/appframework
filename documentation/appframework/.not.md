#.not(selector);

```

Basically the reverse of filter.  Return all elements that do NOT match the selector
      
```

##Example

```
      $("#foo").not(".bar"); //Selector
      $("#foo").not($(".bar")); //Objects
      $("#foo").not($(".bar").get(0)); //Single element
      
```


##Parameters

```
selector                      String|Array|Object

```

##Returns

```
Object                        Returns an appframework object after the filter was run
```

