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
      //append event id to url
      var onClose = function(message) { 
        console.log("modal closed", message);
        api.modalEvent = undefined;
      };
      console.debug('hello open modal');
      $wix.openModal("http://localhost:5000/modal/54", 900, 590, onClose);
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
      if ($scope.settings.view === "Month") {
        desktopCalendar.setup(response.events, response.fb_event_data);
      } else {
        list.setup($scope.settings.borderWidth,
                   response.events, response.fb_event_data);
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
        list.setup(message.borderWidth, message.borderColor);
      }
      $scope.settings = message.settings;
      $scope.$apply();
    });

    getSettings();
});