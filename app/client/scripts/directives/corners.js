'use strict';
/**
 * This directive binds an event listener to all the relevant elements whose
 * border radius can be adjusted by the user. This means all changes in the
 * settings will immediately be reflected in the widget.
 */
angular.module('fbCal')
  .directive('corners', function() {
        return {
          link: function(scope, element) {
            scope.$watch(function() {
                return scope.settings.corners;
              },
              function() {
                element.css('border-radius', scope.settings.corners + 'px');
              });
          }
        };
      });