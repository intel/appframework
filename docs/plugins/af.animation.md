#animation

This plugin lets you run class based animations and keep the class, reverse them, run a function after it's finished, etc.


```
$(selector).animator()
```

## Properties

#### Attributes
An animator object is return that you act upon

```
none
```

#### Functions

```
none
```


## Methods
```
keep (boolean)					Keep the class after animation has completed
remove (string)                Remove class from classlist
reverse (string)               Run the animation in reverse
end (function)					Function to execute after animation has completed
run (string)					Run the animation with the given class
reRun(string)					Run the animation again.
```

## Events
```
none
```


## Examples

Here is a basic example to run the animation

```
$("#one").animation().run("slide-in");

```

Now we will execute a function after it's completed


```
$("#one").animation().end(function(){console.log('completed')}).run("slide-in");
```

Run the animation in reverse and make sure the class was removed


```
$("#one").animation().remove("slide-out").reverse().end(function(){
    this.classList.add("active");
}).run("slide-out");
```