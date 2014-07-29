'use strict';
/*global $:false */

angular.module('fbCal').factory('list', function ($log, $wix) {
  var setup = function(borderWidth, events, eventData) {
    var borderStyle = {'border-bottom-width' : borderWidth + 'px',
                       'margin-bottom' : '0px'
                      };
    $('#header').removeAttr('style');
    $('#header').css(borderStyle);
    $('#header').addClass('header'); //see if there is a way to get this
    //class to overwrite the other css added by calendar setup
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
