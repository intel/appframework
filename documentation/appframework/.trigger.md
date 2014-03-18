#.trigger(event,data);

```

This triggers an event to be dispatched.  Usefull for emulating events, etc.
        
```

##Example

```
        $().trigger("click",{foo:"bar"});//Trigger the click event and pass in data
        
```


##Parameters

```
event                         String|Object
[data]                        Object

```

##Returns

```
Object                        appframework object
```

