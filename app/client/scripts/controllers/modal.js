'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $wix, $log, $timeout, eventId, server) {
    $scope.eventId = eventId;

    $scope.eventId = "1512622455616642";

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
      // server.getModalEvent($scope.eventId)
      //   .then(function(response) {
      //     $scope.eventInfo = response;
      //     console.debug(response);
      //   }, function() {
      //     showErrorModal();
      //   });
      $scope.eventInfo = {name: 'My Event (Demo for Wix App)', start_time: '2014-07-11T19:00:00-0700', location: '', timezone: 'America/Los_Angeles', id: '1512622455616642', end_time: '2014-07-11T22:00:00-0700', eventColor: '#234323'};
    }

});