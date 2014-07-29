'use strict';
/*global FB:false, console:false */

angular.module('fbCal').factory('fbEvents', function ($log, $q) {
  var getUserEventDetails = function() {
    var deferred = $q.defer();
    FB.api('/me', function(response) {
      if (response && !response.error) {
        console.log(response);
        getAllEvents(deferred, response.id);
      } else {
        deferred.reject();
      }
    });
    return deferred.promise;
  };

  var getAllEvents = function(deferred, userId) {
    var curTime = Math.round(new Date().getTime() / 1000);
    var secondsInThreeMonths = 60 * 60 * 24 * 90;
    var threeMonthsAgo = (curTime - secondsInThreeMonths).toString();
    FB.api('/me/events/created?since=' + threeMonthsAgo, function(response) {
      console.info(response);
      if (response && !response.error) {
        if (response.paging) {
          if (response.paging.next) {
            //DEAL WITH PAGINATION
            deferred.resolve({data: response.data, userId: userId});
          } else {
            deferred.resolve({data: response.data, userId: userId});
          }
        } else {
          deferred.resolve({data: response.data, userId: userId});
        }
      } else {
        deferred.reject();
      }
    });
  };

  var post = function() {

  };

  var comment = function() {

  };

  var like = function() {

  };

  var changeAttendingStatus = function() {

  };

  return {
    getUserEventDetails: getUserEventDetails
  };
});