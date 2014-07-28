'use strict';

angular.module('fbCal')
    .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true  && scope.allEventsList.length === 4) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    };
});