'use strict';
/**
 * This directive binds an event listener to all the relevant elements whose
 * border width can be adjusted by the user. This means all changes in the
 * settings will immediately be reflected in the widget.
 */
angular.module('fbCal')
  .directive('borderWidth', function() {
        return {
          link: function(scope, element) {
            scope.$watch(function() {
                if (scope.settings) {
                  return scope.settings.borderWidth;
                } else {
                  return false;
                }
              },
              function() {
                if (scope.settings) {
                  element.css('border-width', scope.settings.borderWidth + 'px');
                }
              });
          }
        };
      });

angular.module('fbCal')
  .directive('borderWidthHeader', function() {
        return {
          link: function(scope, element) {
            scope.$watch(function() {
                if (scope.settings) {
                  return scope.settings.borderWidth;
                } else {
                  return false;
                }
              },
              function() {
                if (scope.settings && scope.settings.view === 'List') {
                  element.css('border-width', 
                              scope.settings.borderWidth + 'px');
                }
              });
          }
        };
      });