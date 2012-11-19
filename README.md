In order to bring [jqMobi](appMobi/jQ.Mobi) - which has proven to deliver the fastest rendering especially on 
older Android 2.x single-core phones - to work together with [HighCharts](highslide-software/highcharts.com), [usage of jQuery seems inevitable](http://forums.appmobi.com/viewtopic.php?f=26&t=1933).
When trying to include jQuery on a page, there are namespacing problems as the original jq.ui.js for some reasons
refers to functions like `$.trigger` instead of `jq.trigger`. 

This resitory includes a build file as well as a fixed version of the jqMobi files that only define objects in their own namespace `jq`