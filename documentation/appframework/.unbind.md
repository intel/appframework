#.unbind(event,[callback]);

```

Unbinds an event to each element in the collection.  If a callback is passed in, we remove just that one, otherwise we remove all callbacks for those events
  
```

##Example

```
  $().unbind("click"); //Unbinds all click events
  $().unbind("click",myFunc); //Unbinds myFunc
  
```


##Parameters

```
event                         String|Object
[callback]                    Function

```

##Returns

```
Object                        appframework object
```

