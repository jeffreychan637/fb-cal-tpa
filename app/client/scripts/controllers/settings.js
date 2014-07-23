'use strict';

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, init) {
    $scope.settings = {};
    $wix.UI.onChange('*', function (value, key) {
      console.log(key, value);
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
