/**
 * Generate animations based off a json file
 * Android <4.4 does not support animation-direction:reverse, so we have to create the reverse animation
 */

var fs=require("fs");
var path = require("path");

var anims=require("./anims.json");

var out="";
anims.forEach(function(obj){
    if(obj.noTrans)
        out+=generateNoTrans(obj.name,obj.time);
    else
        out+=generateAnim(obj.name,obj.time,obj.steps,obj.easing,obj.css);
});

fs.writeFile(path.join(__dirname,"../src/less/animation.less"),out);

function generateNoTrans(name,time,css){
    css=css||"";
    var tmp="."+name+" {\n"+
    "    -webkit-animation: noTransition "+time+" forwards;\n"+
    "    animation: noTransition "+time+" forwards;\n"+
    "    "+(css)+"\n"+
    "}\n\n";
    return tmp;
}

function generateAnim(name,time,steps,easing,css){

    //loop through steps
    if(!css||!css.length)
        css="";

    var to="";
    var reverse="";
    if(steps){
        for(var j in steps)
        {
            to+="    "+j+"% { "+steps[j]+"}\n";
            reverse+="    "+(100-parseInt(j,10))+"% { "+steps[j]+"}\n";
        }
    }

    var tmp="."+name+" {\n"+
            "    -webkit-animation: "+name+"Animation "+time+" forwards;\n"+
            "    animation: "+name+"Animation "+time+" forwards;\n"+
            "    "+(css)+"\n"+
            "}\n\n"+
            "@-webkit-keyframes "+name+"Animation {\n"+
            to.replace(/transform/g,"-webkit-transform")+
            "}\n\n"+
            "@keyframes "+name+"Animation {\n"+
            to+
            "}\n\n";

            var time=parseInt(time,10);
            time*=1.5;
            time=time+"ms";
     tmp+="."+name+".animation-reverse {\n"+
            "    -webkit-animation: "+name+"AnimationReverse "+time+" forwards;\n"+
            "    animation: "+name+"AnimationReverse "+time+" forwards;\n"+
            "}\n\n"+
            "@-webkit-keyframes "+name+"AnimationReverse {\n"+
            reverse.replace(/transform/g,"-webkit-transform")+
            "}\n\n"+
            "@keyframes "+name+"AnimationReverse {\n"+
            reverse+
            "}\n\n";
    return tmp;
}
