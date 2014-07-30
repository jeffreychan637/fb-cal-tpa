'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $wix, $log, $timeout, eventId, server) {
    $scope.eventId = eventId;

    $('#myModal').modal('show');

    if (!$scope.eventId) {
      $timeout(function() {
        $wix.closeWindow('Please open with a valid event');
      }, 4000);
    } else {
      server.getModalEvent($scope.eventId)
        .then(function(response) {
          $scope.eventInfo = response;
          console.debug(response);
        }, function() {
          //show error message
        });
    }

});