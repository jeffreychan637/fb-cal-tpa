'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $wix, api, $http, $log, $timeout, eventId) {
    $scope.eventId = eventId;
    console.log($scope.eventId);
    if (!$scope.eventId) {
      console.log('Please open with a valid event');
      $scope.validEvent = false;
      $timeout(function() {
        $wix.closeWindow('Please open with a valid event');
      }, 4000);
    } else {
      //get fb event data
    }

});