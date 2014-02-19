/*global require*/
var fs = require("fs");

var cmdArgs = process.argv.splice(2);

function stripTags(oldString) {
    "use strict";
    return oldString.replace(/(<([^>]+)>)/ig,"");
}

function rPad(string,val,length){
    "use strict";
    if(!string||!val||length===0) return;
    while(string.length<length){
        string=string+val;
    }
    return string;
}

var mdTemlpate="#{title}\n\n"+
"{example}\n\n"+
"##Parameters\n\n```\n{params}\n```\n\n"+
"##Returns\n\n```\n{returns}\n```\n\n"+
"{extra}";

function makeMD(title,example,params,returns,extra){
    "use strict";
    return mdTemlpate.replace("{title}",title).replace("{example}",example).replace("{params}",params).replace("{returns}",returns).replace("{extra}",extra);
}

//loop through the files
cmdArgs.forEach(function(ind){
    "use strict";
    if(fs.statSync(ind)){
        var name=ind.replace(".json","");
        var contents=require("./"+name);
        contents.forEach(function(entry){
            if(entry.isPrivate||entry.ignore)
                return;

            var mdTxt="";
            var title="";
            var params=[];
            var desc="";
            var returnObj={
                desc:"",
                types:""
            };
            var example=entry.code;
            if(entry.description.full.indexOf("jshint ")!==-1) return;
            if(entry.tags){
                entry.tags.forEach(function(tag){
                  //  console.log(tag);
                    switch(tag.type){
                    case "title":
                        title=tag.string;
                        break;
                    case "param":
                        params[tag.name]=tag.types;
                        break;
                    case "return":
                        returnObj.desc=tag.description;
                        returnObj.types=tag.types;
                        break;
                    }
                    title=title.replace("* @title","");
                });

            }
            title=title.replace("$()","");
            if(title.length===0) return;
            var summary="```\n"+entry.description.summary;
            //Cleanup the docx html code
            summary=summary.replace("<div class=\"highlight\"><pre lang=\"\">","\n```\n\n##Example\n\n```\n").
                    replace("</pre></div>","\n```\n").
                    replace(/<br \/>/g,"\n").
                    replace(/<p>/g,"\n").
                    replace(/```js/g,"```").
                    replace(/          /g,"");
            summary=stripTags(summary);
            var paramsTxt="";
            var returnTxt=rPad(returnObj.types," ",30)+returnObj.desc;
            Object.keys(params).forEach(function(key){
                paramsTxt+=rPad(key," ",30)+params[key].join("|")+"\n";
            });
            var extra="";
            var extraName=title.replace(";","");
            if(extraName.indexOf("(")!==-1)
                extraName=extraName.substr(0,extraName.indexOf("("));

            try {
                if(fs.statSync("./detail/"+extraName+".md"))
                {                    
                    extra=fs.readFileSync("./detail/"+extraName+".md").toString();
                    extra=extra.replace(/```js/g,"```");
                    extra=extra.replace(/```html/g,"```");
                    extra="##Detail\n\n"+extra;
                    
                }
            }
            catch(e){
            }
            var md=makeMD(title,summary,paramsTxt,returnTxt,extra);
            fs.writeFileSync("./"+name+"/"+extraName+".md",md);
        });
    }
});

