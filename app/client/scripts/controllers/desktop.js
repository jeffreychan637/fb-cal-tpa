'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('DesktopCtrl', function ($scope, $wix, api, $http, init, $log,
                                       desktopCalendar, list) {
    $scope.settings = api.defaults;

    //things to prepare for events: order them by time and day & get time/day out
    var temp1 = {'title' : 'Concert asds duper awesome ereallt can you make it longer yve dfsdf  fsdfsd more things that are teally important baraberque nt come to omg this is the longest event ever my event to have an awesome adventure', 'time' : 'June 17th, 7:30pm', 'day' : 'Wednesday'};
    var temp2 = {'title' : 'Concert', 'time' : 'June 17th, 9pm', 'day' : 'Wednesday'};
    var temp3 = {'title' : 'Concert', 'time' : 'June 17th, 8pm', 'day' : 'Wednesday'};
    var temp4 = {'title' : 'Concertdas Concert asds duper awesome ereallt can you make it longer yve dfsdf  fsdfsd more things that are teally important baraberque nt come to omg this is the lo', 'time' : 'June 17th, 8pm', 'day' : 'Wednesday'};
    $scope.eventList = [temp1, temp2, temp3, temp4];


    /* PUT THIS IN SETTINGS CALLBACK WHEN WRITTEN */
    if ($scope.settings.view === "Month") {
      desktopCalendar.setup();
    } else {
      list.setup($scope.settings.borderWidth, $scope.settings.borderColor);
    }

    $scope.listStyle = function(last) {
      return list.listStyle(last);
    };

    $scope.openModal = function(index) {
      api.modalEvent = $scope.eventList[index];
      var onClose = function(message) { 
        console.log("modal closed", message);
        api.modalEvent = undefined;
      };
      console.log('hello open modal');
      $wix.openModal("http://localhost:5000/modal.html", 400, 400, onClose);
    };

    /** 
     * When the site owner updates the settings, this added event listener
     * allows the widget to implement these changes immediately.
     */
    $wix.addEventListener($wix.Events.SETTINGS_UPDATED, function(message) {
      console.log('message');
      console.log(message);
      if (message.view === 'Month' && $scope.settings.view === 'List') {
        desktopCalendar.setup();
      } else if (message.view === 'List' && $scope.settings.view === 'Month') {
        list.setup(message.borderWidth, message.borderColor);
      }
      $scope.settings = message;
      $scope.$apply();
    });
});