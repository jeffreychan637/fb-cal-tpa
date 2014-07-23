'use strict';
/*global $:false */

angular.module('fbCal').factory('list', function ($log, $wix) {

  var setup = function(borderWidth, borderColor) {
    var borderStyle = {'border-bottom-width' : borderWidth + 'px',
                       'border-bottom-color' : borderColor,
                       'margin-bottom' : '0px'
                      };
    $('#header').css(borderStyle);
  };

  var listStyle = function(last) {
    if (last) {
      return {'border' : 'none'};
    } else {
      return {};
    }
  };

  return {
    setup: setup,
    listStyle : listStyle
  };
});
