(function($ui){
        function fadeTransition (oldDiv, currDiv, back) {
            oldDiv.style.display = "block";
            currDiv.style.display = "block";
            var that = this;
            if (back) {
                currDiv.style.zIndex = 1;
                oldDiv.style.zIndex = 2;
                that.clearAnimations(currDiv);
                that.css3animate(oldDiv, {
                    x: "0%",
                    time: $ui.transitionTime,
                    opacity: 0.1,
                    complete: function(canceled) {
                        if(canceled) {
                            that.finishTransition(oldDiv, currDiv);
                            return;
                        }

                        that.css3animate(oldDiv, {
                            x: "-100%",
                            opacity: 1,
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
                currDiv.style.opacity = 0;
                that.css3animate(currDiv, {
                    x: "0%",
                    opacity: 0.1,
                    complete: function() {
                        that.css3animate(currDiv, {
                            x: "0%",
                            time: $ui.transitionTime,
                            opacity: 1,
                            complete:function(canceled){
                                if(canceled) {
                                    that.finishTransition(oldDiv, currDiv);
                                    return;
                                }

                                that.clearAnimations(currDiv);
                                that.css3animate(oldDiv, {
                                    x: "-100%",
                                    y: 0,
                                    complete: function() {
                                        that.finishTransition(oldDiv);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
        $ui.availableTransitions.fade = fadeTransition;
})(af.ui);


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
(function ($ui) {

    function slideUpTransition(oldDiv, currDiv, back) {
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
                        y: "100%",
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
                y: "100%",
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
    $ui.availableTransitions.up = slideUpTransition;
})(af.ui);
