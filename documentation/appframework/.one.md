#.one(event,callback);

```

Binds an event to each element in the collection that will only execute once.  When it executes, we remove the event listener then right away so it no longer happens
  
```

##Example

```
  $().one("click",function(){console.log("I was clicked once");});
  
```


##Parameters

```
event                         String|Object
[callback]                    Function

```

##Returns

```
appframework                  object
```

