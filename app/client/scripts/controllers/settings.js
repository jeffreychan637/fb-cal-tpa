'use strict';

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, fbSetup, fbLogin, $timeout) {
    $scope.settings = api.defaults;

    $scope.eventList = [{id: '454', title: 'Wimbledon'},
                        {id: '4567', title: 'Superbowl'},
                        {id: '4548', title: 'World Cup Viewing'}];

    //hello/[^\s]+
    //hello/[0-9]+  use this regex for checking if keys are events 
    //replace hello with something like "event"

    /**
     * Sends the settings to the widget as well as starting the process of
     * saving the settings to the database.
     */
    var sendSettings = function() {
      $wix.Settings.triggerSettingsUpdatedEvent($scope.settings,
                                                $wix.Utils.getOrigCompId());
      //call save to the database function here
    };

    $wix.UI.onChange('*', function (value, key) {
      console.log(key, value);
      if (key === 'corners' || key === 'borderWidth') {
        $scope.settings[key] = Math.ceil(value);
      } else {
        $scope.settings[key] = value;
      }
      sendSettings();
    });

    $scope.handleToggles = function(toggle) {
      // console.log($scope.toggles);
      console.log($scope.view);
      if (toggle === 'view') {
        if ($scope.view) {
          $scope.settings.view = 'Month';
        } else {
          $scope.settings.view = 'List';
        }
      } else if (toggle === 'commenting') {
        $scope.settings.commenting = true;
      } else if (toggle === 'moderating') {
        $scope.settings.moderating = true;
      } else {
        $scope.settings.hostedBy = true;
      }
      sendSettings();
    };

    $scope.login = function() {
      if (fbSetup.getFbReady()) {
        fbLogin.checkLoginState();
      } else {
        $scope.connectError = true;
        $timeout(function() {
          $scope.connectError = false;
        }, 5000);
      }
    };



    // $wix.Settings.refreshApp();

    $wix.UI.initialize();
});
