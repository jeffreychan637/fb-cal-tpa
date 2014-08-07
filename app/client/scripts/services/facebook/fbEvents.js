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

  var commentIdRegex = /\/([0-9_]+)\/comments/;
  var afterRegex = /after=([0-9a-zA-Z=]+)/;
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
//look for after and until
  var parseUrl = function(url, gettingFeed) {
    var commentId;
    var afterPattern = url.match(afterRegex);
    if (afterPattern) {
      if (gettingFeed) {
        return {after : afterPattern[1]};
      } else {
        commentId = parseCommentId(url);
        return {id : commentId, after : afterPattern[1]};
      }
    } else {
      var untilPattern = url.match(untilRegex);
      if (untilPattern) {
        if (gettingFeed) {
          return {until : untilPattern[1]};
        } else {
          commentId = parseCommentId(url);
          return {id : commentId, until : untilPattern[1]};
        }
      } else {
        console.error('Could not parse Url');
      }
    }
  };

  var parseCommentId = function(url) {
    var commentIdPattern = url.match(commentIdRegex);
    if (commentIdPattern) {
      return commentIdPattern[1];
    } else {
      console.error('Could not parse Url');
    }
  }; 

  var getRsvpStatus = function(eventId) {
    var deferred = $q.defer();
    FB.api('/fql',
          {
            'q' : 'SELECT rsvp_status FROM event_member WHERE eid = ' + eventId + ' AND uid=me()'
          }, 
          function(response) {
            if (response && !response.error) {
              var rsvp_status = response.data[0].rsvp_status;
              if (rsvp_status === 'attending') {
                deferred.resolve('Going');
              } else if (rsvp_status === 'maybe') {
                deferred.resolve('Maybe');
              } else if (rsvp_status === 'declined') {
                deferred.resolve('Declined');
              } else {
                deferred.resolve('RSVP');
              }
            } else {
              deferred.reject();
            }
          });
    return deferred.promise;
  };

  var shareEvent = function(eventId) {
    console.log('running');
    FB.ui({
           method: 'share',
           href: 'https://www.facebook.com/events/' + eventId,
          }, function() {});
  };

  var rsvp = ['attending', 'maybe', 'declined']; 

  var processInteraction = function(action, id, message) {
    console.log('performing ' + action);
    var deferred = $q.defer();
    if (rsvp.indexOf(action) >= 0) {
      changeAttendingStatus(action, id, deferred);
    } else if (action === 'post') {
      post(id, deferred, message, true);
    } else if (action === 'like' || action === 'likeComment') {
      like(id, deferred, true);
    } else if (action === 'unlike' || action === 'unlikeComment') {
      like(id, deferred, false);
    } else if (action === 'comment') {
      post(id, deferred, message, false);
    } else {
      deletePost(id, deferred);
    }
    return deferred.promise;
  };

  var post = function(id, deferred, message, post) {
    var link;
    console.log(message);
    if (post) {
      link = '/feed';
    } else {
      link = '/comments';
    }
    FB.api('/' + id + link,
           'POST',
           {
              'message': message
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

  var deletePost = function(id, deferred) {
    FB.api('/' + id,
           'DELETE',
           function (response) {
            if (response && !response.error) {
              deferred.resolve(true);
            } else {
              deferred.reject();
            }
          });
  };

  var like = function(id, deferred, like) {
    console.log(id);
    var method;
    if (like) {
      method = 'POST';
    } else {
      method = 'DELETE';
    }
    FB.api('/' + id + '/likes',
           method,
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
    FB.api('/' + id + '/' + action,
           'POST',
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
    shareEvent: shareEvent,
    getUserEventDetails: getUserEventDetails,
    processInteraction: processInteraction,
    getRsvpStatus: getRsvpStatus,
    parseUrl: parseUrl
  };
});