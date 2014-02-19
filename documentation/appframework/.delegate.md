#.delegate(selector,event,[data],callback)

```

Delegate an event based off the selector.  The event will be registered at the parent level, but executes on the selector.
  
```

##Example

```
  $("#div").delegate("p","click",callback);
  
```


##Parameters

```
selector                      String|Array|Object
event                         String|Object
data                          Object
callback                      Function

```

##Returns

```
Object                        appframework object
```

