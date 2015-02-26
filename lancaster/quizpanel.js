(function(){

    var app={};


    app.controllers={};


    app.controllers.addition= {
        sign:"+"
    };
    app.controllers.subtraction= {
        sign:"-"
    };
    app.controllers.division= {
        sign:"/"
    };
    app.controllers.multiplication= {
        sign:"*"
    };
    app.controllers.shapes = {
        sign:""
    };
    app.controllers.colors = {
        sign:""
    };
    window.app=app;
})();


(function($){
    var points=0;
    var currentCategory;
    var categoryQuestions;
    var categoryCorrect;
    $(document).ready(function(){

        $("#quiz").bind("panelgrowstart",function(e,item,reverse){
            $(".answerList").removeClass("active");
            $(".answerList li").removeClass("correct wrong response");

            $(this).closest('.view').find('#transitionView').removeClass("addition subtraction division multiplication shapes colors").addClass('active '+$(item).attr('data-category'));
            $("#quiz h3").html($(item).attr('data-category'));
            $("#quiz h2").html("(0/0)");
            currentCategory=$(item).attr('data-category');
            var item=$("#quiz .card");
            item.get(0).className="card";
            item.get(0).classList.add(currentCategory);

            categoryQuestions=categoryCorrect=0;
            addNewQuestions();
        });

        $("#quiz").bind("panelgrowcomplete",function(e,item,reverse){

            var img=$(this).closest('.view').find('#transitionView');
            if($.os.android) return img.removeClass("active"), $(".answerList").addClass("active");
            setTimeout(function(){

                img.animation().keep().reverse().end(function(){
                    $(".answerList").addClass("active");
                    this.classList.remove("active");
                    this.classList.remove("fade-in");
                }).run("fade-in");
            },100);
        });

        $("#quiz").bind("panelgrowendstart",function(e){
            //$(this).closest(".view").children().css("visibility","hidden");
            $(this).closest('.view').find('#transitionView').addClass("active");
        });
        $("#quiz").bind("panelgrowendcomplete",function(e){
            //$(this).closest(".view").children().css("visibility","hidden");
            var img=$(this).closest('.view').find('#transitionView');

            img.animation().keep().reverse().end(function(){
                this.classList.remove("active");
                this.classList.remove("fade-in");
            }).run("fade-in");
        });

        $("#quiz").on("click",".answerList li",function(e){
            var $el=$(e.target);
            $el.parent().find("li").removeClass("response");
            $el.addClass("response");
            $(".answerArrow").addClass("response");
        });
        $("#quiz").on("click",".answerArrow",function(e){
            //check current question;

            var item=$("#quiz li.response");
            if(item.length===0) return;
            $(e.target).addClass("active");
            setTimeout(function(){
                categoryQuestions++;
                item.parent().find("[data-correct]").addClass("correct");
                if(item.attr("data-correct")){
                    $("#points").html(++points);
                    categoryCorrect++;
                }
                else{
                    item.addClass("wrong");
                }
                $("#quiz h2").html("("+categoryCorrect+"/"+categoryQuestions+")");
                setTimeout(function(){
                    $(e.target).removeClass("active");
                    $(".answerArrow").removeClass("response");
                    $(".answerList li").removeClass("correct wrong response");
                    addNewQuestions();

                },1000);
            },500);
        });

        function getRandomInt(max) {
            return Math.floor(Math.random() * max);
        }
        function addNewQuestions(){
            var items=generateAnswers();
            var answers=[];
            answers.push(items.answer);
            do {
                resp=getRandomInt(9);
                if(answers.indexOf(resp)===-1)
                    answers.push(resp);
            }
            while(answers.length<4);
            var userAnswers=$(".answerList li");
            userAnswers.removeAttr("data-correct");
            userAnswers.each(function(i){
                this.innerHTML=answers[i];
                if(answers[i]===items.answer)
                    $(this).attr("data-correct",true);
            });
            $(".questionTitle").html("What is "+items.l+(app.controllers[currentCategory].sign)+items.r+"?");
            //$(".answerList li").shuffle();

        }

        function generateAnswers()
        {
            var response = {
                l:0,
                r:0,
                answer:0
            };
            switch(app.controllers[currentCategory].sign){
                case "+":
                    response.l=getRandomInt(9);
                    response.r=getRandomInt(9);
                    response.answer=response.l+response.r;
                    break;
                case "-":
                    do {
                        response.l=getRandomInt(9);
                        response.r=getRandomInt(9);
                    }
                    while(response.r>response.l);
                    response.answer=response.l-response.r;
                    break;
                case "/":
                    do {
                        response.l=getRandomInt(9);
                        response.r=getRandomInt(9);
                    }
                    while(response.l<response.r||((Number(response.l/response.r)+"").length>1));
                    response.answer=response.l/response.r;
                    break;
                case "*":
                    response.l=getRandomInt(9);
                    response.r=getRandomInt(9);
                    response.answer=response.l*response.r;
                    break;
            }
            return response;
        }
        $(".category").attr("data-grower","#quiz");
        $(".answerList li").attr("data-ignore-pressed",true);
    });


})(jQuery);


