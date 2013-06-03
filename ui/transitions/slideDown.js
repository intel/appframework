(function ($ui) {

    function slideDownTransition(oldDiv, currDiv, back) {
        oldDiv.style.display = "block";
        currDiv.style.display = "block";
        var that = this;
        if (back) {
            oldDiv.style.zIndex = 2;
            currDiv.style.zIndex = 1;
            that.css3animate(oldDiv, {
                y: "0%",
                x: "0%",
                complete: function () {
                    that.css3animate(oldDiv, {
                        y: "-100%",
                        time: $ui.transitionTime,
                        complete: function () {
                            that.finishTransition(oldDiv, currDiv);
                        }
                    });
                }
            });
        } else {
            oldDiv.style.zIndex = 1;
            currDiv.style.zIndex = 2;
            that.css3animate(currDiv, {
                y: "-100%",
                x: "0%",
                time:"10ms",
                complete: function () {
                    that.css3animate(currDiv, {
                        y: "0%",
                        time: $ui.transitionTime,
                        complete: function () {
                            that.finishTransition(oldDiv, currDiv);
                        }
                    });
                }
            });
        }
    }
    $ui.availableTransitions.down = slideDownTransition;
})(af.ui);