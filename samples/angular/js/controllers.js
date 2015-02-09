angular.module('todoaf')
    .controller('TodoCtrl',function TodoCtrl($scope) {
        'use strict';

        var todos=$scope.todos=[];


        $scope.addTodo=function(){
            if(!$scope.todoVal) return;
            todos.push({
                title:$scope.todoVal,
                completed:false
            });
            $scope.todoVal="";
        };

        $scope.removeTodo=function(item){
            todos.splice(todos.indexOf(item),1);
            $scope.$apply();
        };


    });