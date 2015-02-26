(function(){


    "use strict";

    var todos=[];
    var app=Backbone.View.extend({
        el: '#main',
        events: {
            'click #addTodo': 'addTodo',
            'longTap li': 'removeTodo'
        },
        template:_.template($('#todoTemplate').html()),
        addTodo:function(){
            var item=$("#todoVal");
            var val=item.val();
            if(val.length<2) return;

            todos.push(val);
            item.val('');
            $("#todoList").append(this.template({title:val}));
        },
        removeTodo:function(e){
            var item=$(e.target);
            todos.splice(todos.indexOf(item.html()),1);
            $(item).remove();
        },
        initialize:function(){
        }
    });

    $.afui.ready(function(){
        new app();
    });
})(jQuery);