'use strict';
/*global FB:false, console:false, $:false */

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

  var afterRegex = /after=([0-9=]+)/;
  var untilRegex = /until=([0-9a-zA-Z]+)/;

  var getAllEvents = function(deferred, userId) {
    var curTime = Math.round(new Date().getTime() / 1000);
    var secondsInThreeMonths = 60 * 60 * 24 * 90;
    var threeMonthsAgo = (curTime - secondsInThreeMonths).toString();
    var finalEvents = [];
    getEventsData(threeMonthsAgo, userId, deferred, finalEvents, '');
  };

  var getEventsData = function(seconds, userId, deferred, finalEvents, pagingData) {
    FB.api('/me/events/created?since=' + seconds + pagingData, function(response) {
      if (response && !response.error) {
        finalEvents = $.merge(finalEvents, response.data);
        if (response.paging) {
          if (response.paging.cursors) {
            if (response.paging.cursors.after) {
              pagingData = '&after=' + response.paging.cursors.after;
              getEventsData(seconds, userId, deferred, finalEvents, pagingData);
            } else {
              deferred.resolve({data: finalEvents, userId: userId});
            }
          } else {
            var next = response.paging.next;
            var afterPattern = next.match(afterRegex);
            if (afterPattern) {
              pagingData = '&' + afterPattern[0];
              getEventsData(seconds, userId, deferred, finalEvents, pagingData);
            } else {
              var untilPattern = next.match(untilRegex);
              if (untilPattern) {
                pagingData = '&' + untilPattern[0];
                getEventsData(seconds, userId, deferred, finalEvents, pagingData);

              } else {
                console.error('Regex is not working');
                deferred.reject();
              }
            }
          }
        } else {
          deferred.resolve({data: finalEvents, userId: userId});
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