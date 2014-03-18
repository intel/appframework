#.on(event,selector,[data],callback);

```

Similar to delegate, but the function parameter order is easier to understand.
If selector is undefined or a function, we just call .bind, otherwise we use .delegate
  
```

##Example

```
  $("#div").on("click","p",callback);
  
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

