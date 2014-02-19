#.off(event,selector,[callback])

```

Removes event listeners for .on()
If selector is undefined or a function, we call unbind, otherwise it"s undelegate
  
```

##Example

```
  $().off("click","p",callback); //Remove callback function for click events
  $().off("click","p") //Remove all click events
  
```


##Parameters

```
event                         String|Object
selector                      String|Array|Object
callback                      Sunction

```

##Returns

```
Object                        appframework object
```

