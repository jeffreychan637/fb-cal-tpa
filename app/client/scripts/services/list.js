'use strict';
/*global $:false */

angular.module('fbCal').factory('list', function ($log, $wix) {
  var setup = function(borderWidth, eventData) {
    console.log(eventData);
    var borderStyle;
    if (eventData.length) {
      borderStyle = {'border-bottom-width' : borderWidth + 'px',
                         'margin-bottom' : '0px'
                        };
      $('#header').removeAttr('style');
      $('#header').css(borderStyle);
      $('#header').addClass('header');

      return processEvents(eventData);
    } else {
      borderStyle = {'border' : 'none'};
      $('#header').css(borderStyle);
      return eventData;
    }
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
      eventList[i].unixTime = new Date(eventData[i].start_time).getTime();
      eventList[i].time = formatTime(eventList[i].unixTime);
    }
    eventList.sort(compare);
    return eventList;
  };

  var compare = function(a, b) {
    if (a.unixTime < b.unixTime) {
      return -1;
    } else if (a.unixTime > b.unixTime) {
      return 1;
    } else {
      return 0;
    }
  };

  var formatTime = function(time) {
    var localTime = new Date(time);
    var timeString = localTime.toLocaleTimeString().replace(/:\d\d /, '');
    var dateString = localTime.toLocaleDateString();
    var dayString = localTime.toString().replace(/ .+/, ' ');
    return dayString + dateString + ' ' + timeString;
  };

  return {
    setup: setup,
    listStyle : listStyle
  };
});
