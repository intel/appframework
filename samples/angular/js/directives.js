angular.module('todoaf')
.directive("li",function(){
    return {
        restrict:"E",
        link:function($scope,$element,attrs){
            $element.on("longTap",function(event){
                if(!confirm("Are you sure you want to delete this todo")) return;
                $(event.target).off("longTap");
                $scope.$eval(attrs.longPress);
            });
        }
    };
});