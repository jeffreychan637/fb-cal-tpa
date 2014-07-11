'use strict';

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http) {
    $scope.settings = {};
    $wix.UI.onChange('*', function (value, key) {
      if (key === 'corners') {
        console.log(Math.ceil(value));//browser will round
        $scope.settings[key] = value.value;
      } else {
        $scope.settings[key] = value;
      }
      $wix.Settings.triggerSettingsUpdatedEvent($scope.settings,
        $wix.Utils.getOrigCompId());
    });

    $wix.Settings.refreshApp();

    $wix.UI.initialize();
});
