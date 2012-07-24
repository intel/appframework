(function($ui){
    
        function flipTransition (oldDiv, currDiv, back) {
             oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this
            if (back) {
                that.css3animate(currDiv, {
                    x: "100%",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            scale: 1,
                            time: "150ms",
                            rotateY: "0deg",
                            complete: function(){
                                that.clearAnimations(currDiv);
                            }
                        });
                    }
                });
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "150ms",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            opacity: 1,
                            scale: 1,
                            rotateY: "0deg",
                            complete: function() {
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
                that.css3animate(oldDiv, {
                    x: "100%",
                    time: "150ms",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(oldDiv, {
                            x: "-100%",
                            y: 0,
                            time: "1ms",
                            scale: 1,
                            rotateY: "0deg",
                            complete: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "100%",
                    time: "1ms",
                    scale: .8,
                    rotateY: "180deg",
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "150ms",
                            scale: 1,
                            rotateY: "0deg",
                            complete:function(){
                                that.clearAnimations(currDiv);
                            }
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.flip = flipTransition;
})($.ui);