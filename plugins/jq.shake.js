/**
 * jq.web.shake - a library to detect shake events for AppMobi Apps 
 & Copyright 2011 - AppMobi
 */
(function ($) {
    $['shake'] = function (callback, threshold) {
        var accelCounter = 0;
        var timer;
        var prevX = 0;
        var prevY = 0;
        var prevZ = 0;
        if (!threshold) threshold = 5;
        var suc = function (a) {

                if ((Math.abs(a.x - prevX)) > 0.8) {
                    accelCounter++;
                } else if ((Math.abs(a.y - prevY)) > 0.8) {
                    accelCounter++;
                } else if ((Math.abs(a.z - prevZ)) > 0.8) {
                    accelCounter++;
                }
                prevX = a.x;
                prevY = a.y;
                prevZ = a.z;
                if (accelCounter >= (threshold)) {
                    callback();
                    accelCounter = 0;
                }
            };

        if (callback && typeof (callback) == "function") {
            // create the options object and set the frequency to receive samples
            var opt = new AppMobi.AccelerationOptions();
            opt.frequency = 100;
            // use the special timer variable which will send the samples back
            timer = AppMobi.accelerometer.watchAcceleration(suc, opt);
        }
    }
})(jq)