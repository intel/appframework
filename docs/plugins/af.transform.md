#transform

This plugin lets you run transition based animations via css3 transforms.

```
$(selector).transition()
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
end (function)					Function to execute after animation has completed
run (transform,duration)		CSS3 transform to run and duration
```

## Events
```
none
```


## Examples

Here is a basic example to run the animation

```
$("#one").transition().run("translate3d(-100px,-100px,0)","500ms");

```

Now we will execute a function after it's completed


```
$("#one").animation().end(function(){console.log('completed')}).run("translate3d(-100px,-100px,0)","500ms");
```