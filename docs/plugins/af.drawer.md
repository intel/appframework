#drawer

This plugin enables drawers (side menus) in your application.  The drawers must be &lt;nav> items in the same view.


```
$.afui.drawer                 Reference to a drawer object
```

## Properties


```
none
```

#### Functions

```
none
```


## Methods
```
show (id, position, string)         Show a drawer based of the id, position and transition
hide (string,string)                Hide a drawer based off the id and position

```

## Positions
```
left                                Show the drawer on the left side
right                               Show the drawer on the right side
```

## Transitions
```
cover                               The menu will cover the main area
reveal                              The main area will slide out and reveal the menu
push                                The menu will push the main area to the side
```

## Events
```
none
```

## Data Directive
```
data-left-menu                       Show the menu on the left side
data-right-menu                      Show the menu on the right side
data-transition                      Transition to run
data-menu-close                      Close the active menu


<a data-left-menu="leftMenu" data-transition="cover">Left Cover</a>
<a data-left-menu="leftMenu" data-close>Close Menu</a>
```


## Examples


Here is a basic example to show the drawer with id "left", on the left side with a reveal transition.

```
$.afui.drawer.show("#left","left","reveal");

```

We can hide the drawer in two ways.  One is calling hide, which hides the active drawer.  The other is specifying the exact drawer to hide.

```
$.afui.drawer.hide();

$.afui.drawer.hide("#left","left");
```

