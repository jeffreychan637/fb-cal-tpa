'use strict';
/*global $:false */

angular.module('fbCal').factory('desktopCalendar', function ($log, $wix) {

  var setup = function(events, eventData) { //HAVE A DEFAULT COLOR IN CASE OF DB ERROR
    var calendar = $("#calendar").calendar(
        {
           tmpl_path: "client/bower_components/bootstrap-calendar/tmpls/",
           events_source: 
           [
              {
                "id": 293,
                "title": "Concert",
                "url": "http://example.com",
                "start": 1405811799000, // Milliseconds
                "end": 1405943911000, // Milliseconds
                "color": "#00FF00"
              },
              {
                "id": 293,
                "title": "Concert",
                "url": "http://example.com",
                "start": 1405811799000, // Milliseconds
                "end": 1405943911000, // Milliseconds
                "color": "#00FF00"
              },
              {
                "id": 293,
                "title": "Concert",
                "url": "http://example.com",
                "start": 1405811799000, // Milliseconds
                "end": 1405943911000, // Milliseconds
                "color": "#00FF00"
              }
            ],
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

  return {
    setup: setup
  };
});
