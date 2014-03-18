#.parents(selector)

```

Returns the parents of the elements based off the selector (traversing up until html document)
      
```

##Example

```
      $("#foo").parents(".bar");
      $("#foo").parents($(".bar"));
      $("#foo").parents($(".bar").get(0));
      
```


##Parameters

```
[selector]                    String|Array|Object

```

##Returns

```
Object                        appframework object with unique parents
```

