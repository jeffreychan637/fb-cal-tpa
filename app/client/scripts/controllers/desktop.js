'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('DesktopCtrl', function ($scope, $wix, api, $http, init, $log, $window) {
    $scope.settings = api.defaults;

    var curHeight = $($window).height();


    $log.log('hello world!!!!');

    /* PUT THIS IN SETTINGS CALLBACK WHEN WRITTEN */
    if ($scope.settings.view === "Month") {
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
          $log.log($('#calendar').height());
          $log.log($('#desktop').height());
          $wix.setHeight($('#desktop').outerHeight());


        });
      });
    }





    /** 
     * When the site owner updates the settings, this added event listener
     * allows the widget to implement these changes immediately.
     */
    $wix.addEventListener($wix.Events.SETTINGS_UPDATED, function(message) {
      $scope.settings = message;
      $scope.$apply();
    });
});