'use strict';
/*global $:false */

angular.module('fbCal').factory('desktopCalendar', function ($log, $wix) {

  var setup = function() {
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
              $('.btn-group button').removeClass('active');
              $('button[data-calendar-view="' + view + '"]').addClass('active');
            }
          });
    $('.btn-group button[data-calendar-nav]').each(function() {
      var $this = $(this);
      $this.click(function() {
        calendar.navigate($this.data('calendar-nav'));
        $wix.setHeight($('#desktop').outerHeight());
      });
    });
  };

  return {
    setup: setup
  };
});
