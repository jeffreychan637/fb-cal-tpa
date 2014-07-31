'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $wix, $log, $timeout, eventId, server) {
    $scope.eventId = eventId;


    var showErrorModal = function() {
      $scope.messageTitle = "Oh no!";
      $('#messageTitle').css('color', 'red');
      $scope.messageBody = "Something terrible happened. Please exit and try again.";
      $('#message').modal('show');
    };







    if (!$scope.eventId) {
      showErrorModal();
      $timeout(function() {
        $wix.closeWindow('Closed Modal');
      }, 7000);
    } else {
      server.getModalEvent($scope.eventId)
        .then(function(response) {
          $scope.eventInfo = response;
          console.debug(response);
        }, function() {
          showErrorModal();
        });
    }

});