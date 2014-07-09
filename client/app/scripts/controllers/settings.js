'use strict';

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http) {

    $wix.UI.onChange('*', function (value, key) {
      if (key === 'widgetCorners' || key === 'buttonCorners' || key === 'borderWidth') { // if the settings changed is a button etc
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
