#.undelegate(selector,event,[callback]);

```

Unbinds events that were registered through delegate.  It acts upon the selector and event.  If a callback is specified, it will remove that one, otherwise it removes all of them.
  
```

##Example

```
  $("#div").undelegate("p","click",callback);//Undelegates callback for the click event
  $("#div").undelegate("p","click");//Undelegates all click events
  
```


##Parameters

```
selector                      String|Array|Object
event                         String|Object
callback                      Function

```

##Returns

```
Object                        appframework object
```

