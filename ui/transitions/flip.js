

(function ($ui) {

    function flipTransition(oldDiv, currDiv, back) {
        oldDiv.style.display = "block";
        currDiv.style.display = "block";
        var that = this;
        if (back) {
            that.css3animate(currDiv, {
                x: "100%",
                scale: 0.8,
                rotateY: "180deg",
                complete: function () {
                    that.css3animate(currDiv, {
                        x: "0%",
                        scale: 1,
                        time: $ui.transitionTime,
                        rotateY: "0deg",
                        complete: function () {
                            that.clearAnimations(currDiv);
                        }
                    });
                }
            });
            that.css3animate(oldDiv, {
                x: "100%",
                time: $ui.transitionTime,
                scale: 0.8,
                rotateY: "180deg",
                complete: function () {
                    that.css3animate(oldDiv, {
                        x: "-100%",
                        opacity: 1,
                        scale: 1,
                        rotateY: "0deg",
                        complete: function () {
                            that.finishTransition(oldDiv);
                        }
                    });
                    currDiv.style.zIndex = 2;
                    oldDiv.style.zIndex = 1;
                }
            });
        } else {
            oldDiv.style.zIndex = 1;
            currDiv.style.zIndex = 2;
            that.css3animate(currDiv, {
                x: "100%",
                scale: 0.8,
                rotateY: "180deg",
                complete: function () {
                    that.css3animate(currDiv, {
                        x: "0%",
                        scale: 1,
                        time: $ui.transitionTime,
                        rotateY: "0deg",
                        complete: function () {
                            that.clearAnimations(currDiv);
                        }
                    });
                }
            });
            that.css3animate(oldDiv, {
                x: "100%",
                time: $ui.transitionTime,
                scale: 0.8,
                rotateY: "180deg",
                complete: function () {
                    that.css3animate(oldDiv, {
                        x: "-100%",
                        opacity: 1,
                        scale: 1,
                        rotateY: "0deg",
                        complete: function () {
                            that.finishTransition(oldDiv);
                        }
                    });
                    currDiv.style.zIndex = 2;
                    oldDiv.style.zIndex = 1;
                }
            });
        }
    }
    $ui.availableTransitions.flip = flipTransition;
})(af.ui);