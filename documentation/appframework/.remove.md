#.remove(selector)

```

Removes elements based off a selector
      
```

##Example

```
$().remove();  //Remove all
$().remove(".foo");//Remove off a string selector
var element=$("#foo").get(0);
$().remove(element); //Remove by an element
$().remove($(".foo"));  //Remove by a collection
      
```


##Parameters

```
selector                      String|Object|Array

```

##Returns

```
Object                        appframework object
```

