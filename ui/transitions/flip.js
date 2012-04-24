(function($ui){
    
        function flipTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
                that.css3animate(oldDiv, {
                    x: "10%",
                    time: "200ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms",
                            opacity: 1
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "200ms",
                    scale: '.8',
                    rotateY: "180deg",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms"
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.flip = flipTransition;
})($.ui);