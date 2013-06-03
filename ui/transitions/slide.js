(function ($ui) {

    /**
     * Initiate a sliding transition.  This is a sample to show how transitions are implemented.  These are registered in $ui.availableTransitions and take in three parameters.
     * @param {Object} previous panel
     * @param {Object} current panel
     * @param {Boolean} go back
     * @title $ui.slideTransition(previousPanel,currentPanel,goBack);
     */
    function slideTransition(oldDiv, currDiv, back) {

        oldDiv.style.display = "block";
        currDiv.style.display = "block";
        var that = this;
        if (back) {
            that.css3animate(oldDiv, {
                x: "0%",
                y: "0%",
                complete: function () {
                    that.css3animate(oldDiv, {
                        x: "100%",
                        time: $ui.transitionTime,
                        complete: function () {
                            that.finishTransition(oldDiv, currDiv);
                        }
                    }).link(currDiv, {
                        x: "0%",
                        time: $ui.transitionTime
                    });
                }
            }).link(currDiv, {
                x: "-100%",
                y: "0%"
            });
        } else {
            that.css3animate(oldDiv, {
                x: "0%",
                y: "0%",
                complete: function () {
                    that.css3animate(oldDiv, {
                        x: "-100%",
                        time: $ui.transitionTime,
                        complete: function () {
                            that.finishTransition(oldDiv, currDiv);
                        }
                    }).link(currDiv, {
                        x: "0%",
                        time: $ui.transitionTime
                    });
                }
            }).link(currDiv, {
                x: "100%",
                y: "0%"
            });
        }
    }
    $ui.availableTransitions.slide = slideTransition;
    $ui.availableTransitions['default'] = slideTransition;
})(af.ui);