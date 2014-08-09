'use strict';
/**
 * This directive binds an event listener to all the relevant elements whose
 * border radius can be adjusted by the user. This means all changes in the
 * settings will immediately be reflected in the widget.
 *
 * @author Jeffrey Chan
 */
angular.module('fbCal')
  .directive('corners', function() {
        return {
          link: function(scope, element) {
            scope.$watch(function() {
                if (scope.settings) {
                  return scope.settings.corners;
                } else {
                  return false;
                }
              },
              function() {
                if (scope.settings) {
                  element.css('border-radius', scope.settings.corners + 'px');
                }
              });
          }
        };
      });
