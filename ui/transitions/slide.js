(function($ui){
    
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
            var that = $ui
            
            if (back) {
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "0ms"
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "-100%",
                    time: "0ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            } else {
                that.css3animate(oldDiv, {
                    x: "-100%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "0ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.slide = slideTransition;
        $ui.availableTransitions['default'] = slideTransition;
})($.ui);