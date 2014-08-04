'use strict';
/*global $:false, console:false */

angular.module('fbCal')
  .controller('DesktopCtrl', function ($scope, $wix, api, $log,
                                       desktopCalendar, list, fbSetup, server) {

    var eventData;


    $scope.listStyle = function(last) {
      return list.listStyle(last);
    };

    $scope.openModal = function(location) {
      var eventId;
      if ($scope.settings.view === 'Month') {
        console.log(eventData);
        eventId = location;
      } else {
        eventId = $scope.eventList[location].id;
      }
      var url = 'http://localhost:5000/modal/' + eventId;
      var onClose = function(message) { 
        console.log("modal closed", message);
        api.modalEvent = undefined;
      };
      console.debug('hello open modal');
      $wix.openModal(url, 850, 600, onClose);
    };


    $scope.$on('View Loaded', function() {
      for (var i = 0; i < eventData.length; i++) {
        $('#day' + eventData[i].id).click(function() {
          $scope.openModal(this.id.replace(/day/, ''));
        });
      }
    });

    var getSettings = function() {
      server.getUserInfo('widget').then(function(response) {
        setSettings(response);
      }, function(response) {
        console.error("Server failed to get settings");
        setSettings(response);
      });
    };

    var setSettings = function(response) {
      $scope.settings = response.settings;
      /**
       * If you want to prevent the user from using the app if they have not
       * logged in via settings, do it here.
       *
       * if (!response.active) {
       *    Active stuff here to tell user to active app.
       * }
       */
      response.fb_event_data = response.fb_event_data.concat([{name: 'My Event (Demo for Wix App)', start_time: '2014-07-11T19:00:00-0700', location: '', timezone: 'America/Los_Angeles', id: '1512622455616642', end_time: '2014-07-11T22:00:00-0700', eventColor: '#234323'}, 
      {'name': 'IHS INTERACT Second Semester adsdasd asdasd asdasdas Board Applications', start_time: '2014-07-19T23:50:00-0700', location: '', timezone: 'America/Los_Angeles', id: '539472619397830', end_time: '2014-07-19T23:55:00-0700', eventColor: '#87683F'}]);
      console.debug(response.fb_event_data);
      eventData = response.fb_event_data;
      if ($scope.settings.view === "Month") {
        desktopCalendar.setup(eventData);
      } else {
        $scope.eventList = list.setup($scope.settings.borderWidth, eventData);
      }
    };

    /** 
     * When the site owner updates the settings, this added event listener
     * allows the widget to implement these changes immediately.
     */
    $wix.addEventListener($wix.Events.SETTINGS_UPDATED, function(message) {
      console.log('message');
      console.log(message);
      if (message.settings.view === 'Month' && $scope.settings.view === 'List') {
        desktopCalendar.setup(eventData);
      } else if (message.settings.view === 'List' && $scope.settings.view === 'Month') {
        $scope.eventList = list.setup(message.settings.borderWidth, eventData);
      }
      $scope.settings = message.settings;
      $scope.$apply();
    });

    getSettings();
});