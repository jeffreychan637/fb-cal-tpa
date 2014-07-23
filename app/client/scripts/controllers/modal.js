'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $wix, api, $http, $log, $timeout) {
   
   if (!api.modalEvent) {
    console.log('Please open with a valid event');
    $scope.validEvent = false;
    $timeout(function() {
      $wix.closeWindow('Please open with a valid event');
    }, 4000);
   } else {
    //get fb event data
   }

});