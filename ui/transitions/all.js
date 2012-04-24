(function($ui){
    
        function fadeTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    opacity: .1,
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
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                currDiv.style.opacity = 0;
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms",
                            opacity: 1
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.fade = fadeTransition;
})($.ui);
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
(function($ui){
        
         function popTransition(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    opacity: .1,
                    scale: .2,
                    origin: "50% 50%",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            time: "1ms"
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    x: "0%",
                    y: "0%",
                    time: "1ms",
                    scale: .2,
                    origin: "50% 50%",
                    opacity: .1,
                    callback: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: "200ms",
                            scale: 1,
                            opacity: 1,
                            origin: "0% 0%"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.pop = popTransition;
})($.ui);
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
(function($ui){
    
        function slideDownTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui;
            if (back) {
                that.css3animate(currDiv, {
                    x: "0%",
                    y: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    y: "-100%",
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms"
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    y: "-100%",
                    x: "0%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "0%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.down = slideDownTransition;
})($.ui);
(function($ui){
    
        function slideUpTransition(oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = $ui;
            if (back) {
                that.css3animate(currDiv, {
                    x: "00%",
                    y: "0%",
                    time: "1ms"
                });
                that.css3animate(oldDiv, {
                    y: "100%",
                    x: "00%",
                    time: "200ms",
                    callback: function() {
                        that.finishTransition(oldDiv);
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms"
                        });
                        currDiv.style.zIndex = 2;
                        oldDiv.style.zIndex = 1;
                    }
                });
            } else {
                oldDiv.style.zIndex = 1;
                currDiv.style.zIndex = 2;
                that.css3animate(oldDiv, {
                    x: "00%",
                    time: "200ms",
                    callback: function() {
                        that.css3animate(oldDiv, {
                            x: 0,
                            y: 0,
                            time: "1ms",
                            callback: function() {
                                that.finishTransition(oldDiv);
                            }
                        });
                    }
                });
                that.css3animate(currDiv, {
                    y: "100%",
                    x: "00%",
                    time: "1ms",
                    callback: function() {
                        that.css3animate(currDiv, {
                            y: "0%",
                            x: "00%",
                            time: "200ms"
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.up = slideUpTransition;
})($.ui);
