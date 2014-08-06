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

  var rsvp = ['attending', 'maybe', 'declined']; 

  var processInteraction = function(action, id, message) {
    console.log('performing ' + action);
    var deferred = $q.defer();
    if (rsvp.indexOf(action) >= 0) {
      changeAttendingStatus(action, id, deferred);
    } else if (action === 'post') {
      post(id, deferred, message);
    } else if (action === 'like' || action === 'likeComment') {
      if (id) {
        like(id, deferred);        
      }
    } else {
      console.log(id);
      if (id) {
        comment(id, deferred, message);
      }
    }
    return deferred.promise;
  };

  var post = function(id, deferred, message) {
    console.log(message);
    FB.api("/" + id + "/feed",
           "POST",
           {
              "message": message
           },
           function(response) {
             if (response && !response.error) {
               FB.api("/" + response.id,
                      function(response) {
                        if (response && !response.error) {
                          deferred.resolve(response);
                        } else {
                          console.log(response.error);
                          deferred.reject();
                        }
                      });
             } else {
              console.log(response.error);
               deferred.reject();
             }
           });
  };

  var comment = function(id, deferred, message) {
    console.log(message);
    FB.api("/" + id + "/comments",
           "POST",
           {
              "message": message
           },
           function(response) {
             if (response && !response.error) {
               FB.api("/" + response.id,
                      function(response) {
                        if (response && !response.error) {
                          deferred.resolve(response);
                        } else {
                          deferred.reject();
                        }
                      });
             } else {
               console.log(response.error);
               deferred.reject();
             }
           });
  };

  var like = function(id, deferred) {
    FB.api("/" + id + "/likes",
           "POST",
           function (response) {
             if (response && !response.error) {
               deferred.resolve(true);
             } else {
               console.log(response.error);
               deferred.reject();
             }
           });

  };

  var changeAttendingStatus = function(action, id, deferred) {
    FB.api("/" + id + "/" + action,
           "POST",
           function(response) {
             if (response && !response.error) {
               deferred.resolve(true);
             } else {
               console.log(response.error);
               deferred.reject();
             }
           });
  };

  return {
    getUserEventDetails: getUserEventDetails,
    processInteraction: processInteraction,
  };
});