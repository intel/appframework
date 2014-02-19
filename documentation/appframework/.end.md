#.end();

```

Rolls back the appframework elements when filters were applied
This can be used after .not(), .filter(), .children(), .parent()
      
```

##Example

```
      $().filter(".panel").end(); //This will return the collection BEFORE filter is applied
      
```


##Parameters

```

```

##Returns

```
Object                        returns the previous appframework object before filter was applied
```

