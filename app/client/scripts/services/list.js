'use strict';
/*global $:false */

angular.module('fbCal').factory('list', function ($log, $wix) {
  var setup = function(borderWidth, eventData) {
    var borderStyle = {'border-bottom-width' : borderWidth + 'px',
                       'margin-bottom' : '0px'
                      };
    $('#header').removeAttr('style');
    $('#header').css(borderStyle);
    $('#header').addClass('header');

    return processEvents(eventData);
  };

  var listStyle = function(last) {
    if (last) {
      return {'border' : 'none'};
    } else {
      return {};
    }
  };

  var processEvents = function(eventData) {
    var eventList = [];
    for (var i = 0; i < eventData.length; i++) {
      eventList[i] = {};
      eventList[i].id = eventData[i].id;
      eventList[i].title = eventData[i].name;
      eventList[i].time = processTime(eventData[i].start_time); 
    }
    return eventList;
  };

  var processTime = function(time) {
    var unixTime = new Date(time).getTime();
    var localTime = new Date(unixTime);
    return formatTime(localTime);
  };

  var formatTime = function(time) {
    var timeString = time.toLocaleTimeString().replace(/:\d\d /, '');
    var dateString = time.toLocaleDateString();
    var dayString = time.toString().replace(/ .+/, ' ');
    return dayString + dateString + ' ' + timeString;
  };

  return {
    setup: setup,
    listStyle : listStyle
  };
});
