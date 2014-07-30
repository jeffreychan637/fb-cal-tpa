'use strict';
/*global $:false */

angular.module('fbCal').factory('desktopCalendar', function ($log, $wix) {

  var setup = function(eventData) {
    var processedData = processEventData(eventData);
    var calendar = $("#calendar").calendar(
        {
           tmpl_path: "client/bower_components/bootstrap-calendar/tmpls/",
           events_source: processedData,
            onAfterEventsLoad: function(events) {
              if(!events) {
                return;
              }
              var list = $('#eventlist');
              list.html('');

              $.each(events, function(key, val) {
                $(document.createElement('li'))
                  .html('<a href="' + val.url + '">' + val.title + '</a>')
                  .appendTo(list);
              });
            },
            onAfterViewLoad: function(view) {
              $('#current-view').text(this.getTitle());
              //using ng-click to open modal instead of href here
            }
          });
    $('.btn-group button[data-calendar-nav]').each(function() {
      var $this = $(this);
      $this.click(function() {
        calendar.navigate($this.data('calendar-nav'));
        $wix.setHeight($('#desktop').outerHeight());
      });
    });
    var borderStyle = {'border-bottom-width' :  '1px',
                       'border-bottom-color' : '#eee',
                       'margin-bottom' : '10px'
                      };
    $('#header').css(borderStyle);
    //add something using addAttr to add ng-change to urls
    //remove url atttrubutes too

  };

  var processEventData = function(events) {
    var processedEvents = [];
    var processedEvent;
    for (var i = 0; i < events.length; i++) {
      processedEvents[i] = {};
      processedEvents[i].id = events[i].id;
      processedEvents[i].title = events[i].name;
      processedEvents[i].url = '#';
      //Deal with weird times and events with no end times
      processedEvents[i].start = new Date(events[i].start_time).getTime();
      processedEvents[i].end = new Date(events[i].end_time).getTime();
      if (events[i].eventColor) {
        processedEvents[i].color = events[i].eventColor;
      } else {
        processedEvents[i].color = '#0088CB';
      }
    }
    return processedEvents;
  };

  return {
    setup: setup
  };
});
