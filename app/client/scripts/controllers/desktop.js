'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('DesktopCtrl', function ($scope, $wix, api, $log,
                                       desktopCalendar, list, fbSetup, server) {

    //things to prepare for events: order them by time and day & get time/day out
    var temp1 = {'title' : 'Concert asds duper awesome ereallt can you make it longer yve dfsdf  fsdfsd more things that are teally important baraberque nt come to omg this is the longest event ever my event to have an awesome adventure', 'time' : 'June 17th, 7:30pm', 'day' : 'Wednesday'};
    var temp2 = {'title' : 'Concert', 'time' : 'June 17th, 9pm', 'day' : 'Wednesday'};
    var temp3 = {'title' : 'Concert', 'time' : 'June 17th, 8pm', 'day' : 'Wednesday'};
    var temp4 = {'title' : 'Concertdas Concert asds duper awesome ereallt can you make it longer yve dfsdf  fsdfsd more things that are teally important baraberque nt come to omg this is the lo', 'time' : 'June 17th, 8pm', 'day' : 'Wednesday'};
    $scope.eventList = [temp1, temp2, temp3, temp4];

    $scope.listStyle = function(last) {
      return list.listStyle(last);
    };

    $scope.openModal = function(index) {
      var eventId = $scope.eventList[index].id;
      var url = 'http://localhost:5000/modal/' + eventId;
      var onClose = function(message) { 
        console.log("modal closed", message);
        api.modalEvent = undefined;
      };
      console.debug('hello open modal');
      $wix.openModal(url, 900, 590, onClose);
    };

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
      response.fb_event_data = [{name: 'My Event (Demo for Wix App)', start_time: '2014-09-11T19:00:00-0700', location: '', timezone: 'America/Los_Angeles', id: '1512622455616642', end_time: '2014-09-11T22:00:00-0700', eventColor: '#234323'}, 
      {'name': 'IHS INTERACT Second Semester adsdasd asdasd asdasdas Board Applications', start_time: '2013-01-19T23:50:00-0800', location: '', timezone: 'America/Los_Angeles', id: '539472619397830', end_time: '2013-01-19T23:55:00-0800', eventColor: '#87683F'}];
      console.debug(response.fb_event_data);
      if ($scope.settings.view === "Month") {
        desktopCalendar.setup(response.fb_event_data);
      } else {
        list.setup($scope.settings.borderWidth,
                   response.fb_event_data);
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
        desktopCalendar.setup();
      } else if (message.settings.view === 'List' && $scope.settings.view === 'Month') {
        $scope.eventList = list.setup(message.borderWidth, message.borderColor);
      }
      $scope.settings = message.settings;
      $scope.$apply();
    });

    getSettings();
});