#CSS3 Animate

This plugin wraps CSS3 animation CSS settings.  It supports setting any of the Transform properties and others.  It also allows chaning for callbacks and queuing.

```
$(selector).css3Animate()
$(selector).css3AnimateQueue();
```

## Properties

#### Attributes

```
time                          (int) Time in ms to run the animation for
x                             (string) X coordinate to move to (can be in pixels or percent)
y                             (string) Y coordinate to move to (can be in pixels or percent)
previous                      (bool)  When true, start from the previous location for animations.
origin                        (string) Transform origin property as a string. You can speficy x,y or both
scale                         (string) Scale property for animation.  Can be integer or percent
rotateX                       (string) Rotate along the X Axis.  Can be integer or percent
rotateY                       (string) Rotate along the Y Axis.  Can be integer or percent
skewX                         (string) Skew along the X Axis.  Can be integer or percent
skewY                         (string) Skew along the Y Axis.  Can be integer or percent
opacity                       (int) Animate opacity between 0.1 and 1
width                         (string) Animate the css width property.  Can be pixels or percent
height                        (string) Animate the css height property.  Can be pixels or percent
timingFunction                (string) CSS3 Transform timing function to use
delay                         (string) Time to delay animation start
addClass                      (string) Use a CSS class for animation instead of setting properties
removeClass                   (string) Class you can remove when calling addClass

```

#### Functions

```
complete(function)            Function to execute when animation has completed
success(function)             Function to execute when animation has successfully finished
failure(function)             Function to execute when animation has failed or was stopped
```





## Methods

```
none
```

## Events

```
none
```

## Css3AnimateQueue functions
```
push(object)                  Add a css3Animation object to the queue, with an additional "id" property for the DOM node to animate
pop()                         Remove a css3Animation object from the queue
run()                         Run all animations in order, waiting for one to finish before the next starts
```



## CSS/Customize

Below is an example used by App Framework's iOS7 theme to customize the look and feel of the popup

```
none
```


## Examples

Here is a basic example that animates a lot of properties.  We will change the height, width, X coords, yCoords and opacity.  At the end, we call reset() that would reset it's position

```
$("#animate").css3Animate({
    width: "100px",
    height: "100px",
    x: "20%",
    y: "30%",
    time: "1000ms",
    opacity: .5,
    success: function () {
        reset()
    }
});
```

Below we use the success callback to run another animation with a delay.  We animate from the previous position.

```
$("#animate").css3Animate({
    x: 20,
    y: 30,
    time: "300ms",
    success: function () {
        $("#animate").css3Animate({
            x: 20,
            y: 30,
            time: "500ms",
            previous: true,
            callback: function () {
                reset();
            }
        });
    }
});
```

Now we will use the animation queue to display multiple animations in a row, all linked together.

```
var tmp = new $.css3AnimateQueue(); //Create a new queue

tmp.push({
    id: "animate",
    x: 20,
    y: 30,
    time: "300ms"
});
tmp.push({
    id: "animate",
    x: 20,
    y: 30,
    time: "500ms",
    previous: true
});
tmp.push({
    id: "animate",
    x: 100,
    y: 100,
    time: "1s"
});
tmp.push(function () {
    reset()
});
tmp.run();
```