(function ($ui) {

    function popTransition(oldDiv, currDiv, back) {
        oldDiv.style.display = "block";
        currDiv.style.display = "block";
        var that = this;
        if (back) {
            currDiv.style.zIndex = 1;
            oldDiv.style.zIndex = 2;
            that.clearAnimations(currDiv);
            that.css3animate(oldDiv, {
                x:"0%",
                time: $ui.transitionTime,
                opacity: 0.1,
                scale: 0.2,
                origin:"50% 50%",
                complete: function (canceled) {
                    if (canceled) {
                        that.finishTransition(oldDiv);
                        return;
                    }

                    that.css3animate(oldDiv, {
                        x: "-100%",
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
                x: "0%",
                scale: 0.2,
                origin: "50%" + " 50%",
                opacity: 0.1,
                time:"0ms",
                complete: function () {
                    that.css3animate(currDiv, {
                        x: "0%",
                        time: $ui.transitionTime,
                        scale: 1,
                        opacity: 1,
                        origin: "0%" + " 0%",
                        complete: function (canceled) {
                            if (canceled) {
                                that.finishTransition(oldDiv, currDiv);
                                return;
                            }

                            that.clearAnimations(currDiv);
                            that.css3animate(oldDiv, {
                                x: "100%",
                                y: 0,
                                complete: function () {
                                    that.finishTransition(oldDiv);
                                }
                            });
                        }
                    });
                }
            });
        }
    }
    $ui.availableTransitions.pop = popTransition;
})(af.ui);