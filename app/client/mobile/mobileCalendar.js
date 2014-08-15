'use strict';
/*global $:false, moment:false, console:false */

/**
 * This factory is used for initializing the mobile calendar of events
 * in the widget.
 *
 * @author Jeffrey Chan
 */

angular.module('fbCal').factory('mobileCalendar', function () {

  var setup = function(eventData) {
    $('#mobile-calendar').clndr({
      template: $('#calendar-template').html(),
      events: processEventData(eventData),
      adjacentDaysChangeMonth: true,
      forceSixRows: true,
      multiDayEvents: {
        startDate: 'startDate',
        endDate: 'endDate'
      },
      clickEvents: {
        click: function(target) {
          console.log(target);
          if( $(target.element).hasClass('event') ) {
            console.log('You clicked on a user event!');
          } else {
            console.log('This date does not have an event.');
          }
        }
      }
    });
    console.log($('.event'));
  };

  var processEventData = function(events) {
    var processedEvents = [];
    var processedEvent;
    for (var i = 0; i < events.length; i++) {
      processedEvents[i] = {};
      processedEvents[i].id = events[i].id;
      processedEvents[i].name = events[i].name;
      if (events[i].end_time) {
        processedEvents[i].startDate = moment(events[i].start_time)._d;
        processedEvents[i].endDate = moment(events[i].end_time)._d;
      } else {
        processedEvents[i].date = moment(events[i].start_time)._d.getTime();
      }
      if (events[i].eventColor) {
        processedEvents[i].color = events[i].eventColor;
      } else {
        processedEvents[i].color = '#0088CB';
      }
    }
    console.debug(processedEvents);
    return processedEvents;
  };

  return {
    setup: setup
  };
});