'use strict';

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, init) {

    $scope.settings = api.defaults;

    //hello/[^\s]+
    //hello/[0-9]+  use this regex for checking if keys are events 
    //replace hello with something like "event"

    $wix.UI.onChange('*', function (value, key) {
      if (key === 'corners' || key === 'borderWidth') {
        $scope.settings[key] = Math.ceil(value);
      } else {
        $scope.settings[key] = value;
      }
      sendSettings();
    });

    /**
     * Sends the settings to the widget as well as starting the process of
     * saving the settings to the database.
     */
    var sendSettings = function() {
      $wix.Settings.triggerSettingsUpdatedEvent($scope.settings,
                                                $wix.Utils.getOrigCompId());
      //call save to the database function here
    };

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



    // $wix.Settings.refreshApp();

    $wix.UI.initialize();
});
