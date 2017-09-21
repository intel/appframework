#Lockscreen

The lockscreen enables developers of hybrid apps to present a lock screen to users.
Users are required to enter a 4 digit pin to unlock it.  This can easily be bypassed
on web browsers

```
$(document.body).lockScreen(opts)
```

## Properties

#### Attributes
You can object of options

```
logo                            (string) image to show above password box
roundKeyboard                    (boolean) When set to true, rounded keys are shown


```

#### Functions

```
renderKeyboard(function)        Function to render the keyboard.  This returns a string
validatePassword(function)      Function to validate the password.  It accepts a string and returns a boolean


```


## Methods
```
show ()                         Show the lockscreen
hide ()                         Hide the lockscreen
```

## Events
```
none
```

## Examples

Here are two examples.  The first shows the lock screen.  The second uses the cordova device pause/resume events to show it

```
var lock=$(document.body).lockScreen();
lock.validatePassword=function(pass){
    pass=parseInt(pass,10);
    return pass==1111;
}
lock.show();
```

Now we force showing on the cordova device pause/resume events

```

function showLockScreen(){
    var lock=$(document.body).lockScreen();
    lock.validatePassword=function(pass){
        pass=parseInt(pass,10);
        return pass==1111;
    }
    lock.show();
}

$(document).on("pause resume",showLockScreen,false);

```