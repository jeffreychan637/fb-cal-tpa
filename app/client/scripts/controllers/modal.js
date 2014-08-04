'use strict';
/*global $:false, console:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $sce, $sanitize, $wix, $log, 
                                     $timeout, $window, eventId, server) {
    $scope.eventId = eventId;

    var eventInfo;
    var feedObject;

    $scope.feed = [];

    var nextFeed;

    // $scope.eventId = "1512622455616642";

    var showErrorModal = function() {
      $scope.messageTitle = "Oh no!";
      $('#messageTitle').css('color', 'red');
      $scope.messageBody = 'Something terrible happened. Please exit and try again.';
      $('#message').modal('show');
    };

    // var showPleaseWait = function(message) {
    //   $scope.messageTitle = "Please wait...";
    //   $('#messageTitle').css('color', '#09F');
    //   $scope.messageBody = 'We\'re currently loading your replies.';
    //   $('#message').modal('show');
    // };

    var processEventInfo = function() {
      $scope.id = eventInfo.id;
      $scope.name = eventInfo.name;
      $scope.owner = eventInfo.owner.name;
      $scope.ownerId = eventInfo.owner.id;
      processDesciption();
      processTime();
      processLocation();
      //display modal info here - before this just show some loading screen
    };

    var processDesciption = function() {
      $scope.description = eventInfo.description.replace(/\r?\n/g, "<br>");
      $scope.description = $sanitize($scope.description);
      $sce.trustAsHtml($scope.description);
      $scope.showDescription = true;
    };

    var processTime = function() {
      if (eventInfo.start_time) {
        var startTime = new Date(eventInfo.start_time);
        var startHour = startTime.toLocaleTimeString().toLowerCase();
        startHour = startHour.replace(/:\d\d /, "");
        var startDateString = startTime.toLocaleDateString();
        var startDayString = startTime.toString().replace(/ .+/, ", ");
        if (eventInfo.end_time) {
          var endTime = new Date(eventInfo.end_time);
          var endHour = endTime.toLocaleTimeString().toLowerCase();
          endHour = endHour.replace(/:\d\d /, "");
          
          if (isSameDay(startTime, endTime)) {
            $scope.shortTime = startDayString + startDateString + " at " +
                               startHour + "-" + endHour;
          } else {
            var endDateString = endTime.toLocaleDateString();
            var endDayString = endTime.toString().replace(/ .+/, ", ");
            $scope.shortTime = startDayString + startDateString + " - " + endDayString + endDateString;
            $scope.longTime = startDayString + startDateString + " at " + startHour +
                              " to " + endDayString + endDateString + " at " +
                              endHour;
          }
        } else {
          $scope.shortTime = startDayString + startDateString + " at " +
                             startHour;
        }
      } else {
        $scope.shortTime = 'No time specified';
      }
      $timeout(function() {
        if ($($window).width() > 760) {
          if ($('#time').height() > $('#rsvp').height()) {
            $('#rsvp').height($('#time').height());
          } else {
            $('#time').height($('#rsvp').height());
          }
        }
      }, 1000);
    };

    var isSameDay = function(a, b) {
      return (a.getDate() === b.getDate() &&
              a.getMonth() === b.getMonth() &&
              a.getFullYear() === b.getFullYear());
    };

    var processLocation = function() {
      if (eventInfo.location) {
        $scope.location = eventInfo.location;
        if (eventInfo.venue && (eventInfo.venue.street || eventInfo.venue.city ||
                                eventInfo.venue.state || 
                                eventInfo.venue.country)) {
          $scope.venue = eventInfo.venue.street + ", " + eventInfo.venue.city + 
                           ", " + eventInfo.venue.state + ", " +
                           eventInfo.venue.country + " " + eventInfo.venue.zip;
          $scope.venue = $scope.venue.replace(/, undefined/, "")
                                         .replace(/undefined, /, "")
                                         .replace(/undefined/, "")
                                         .replace(/ $/, "")
                                         .replace(/, $/, "");
        }
      } else {
        $scope.location = "No location specified";
      }
    };

    var processCover = function(coverObject) {
      if (coverObject.cover && coverObject.cover.source) {
        var cover = coverObject.cover;
        var height = 296 + $scope.settings.borderWidth;

        height = 306;
        // cover.source = "https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-xfa1/t31.0-8/q71/s720x720/10286851_801238859907126_3448618267544264515_o.jpg";
        var cssClass = {'background-image' : 'url(' + cover.source + ')',
                        'height' : height + 'px',
                        'background-position' : cover.offset_x + '% ' +
                                                cover.offset_y + '%'
                       };
        $('#header').css(cssClass);
      }
    };

    var processGuest = function(guestObject) {
      if (guestObject.data) {
        var stats = guestObject.data[0];
        console.log('stats', stats);
        stats.attending_count = processNumber(stats.attending_count);
        stats.unsure_count = processNumber(stats.unsure_count);
        stats.not_replied_count = processNumber(stats.not_replied_count);
        console.log(stats);
        $scope.stats = stats;
      } else {
        $scope.guestFailed = true;
      }
      $timeout(function() {
        if ($($window).width() > 760) {
          if ($('#location').height() > $('#guests').height()) {
            $('#guests').height($('#location').height());
          } else {
            $('#location').height($('#guests').height());
          }
        }
      }, 1000);
    };

    var processNumber = function(number) {
      if (number >= 100000) {
        number = (number/1000000).toString().substring(0, 3);
        var index = number.indexOf(".");
        if (!(index === 0 || index === 1)) {
          number = number.substring(0, 2);
        } 
        number += "M";
      } else if (number >= 1000) {
        number = (number/1000).toString().substring(0, 3);
        var decimal = number.indexOf(".");
        if (!(decimal === 0 || decimal === 1)) {
          number = number.substring(0, 2);
        } 
        number += "K";
      }
      return number;
    };

    var processFeed = function() {
      $scope.loadMoreFeed = false;
      console.log(feedObject);
      if (feedObject.paging && feedObject.paging.next) {
        nextFeed = feedObject.paging.next;
        $scope.loadMoreFeed = true;
      } else {
        $scope.endOfFeed = true;
      }
      var data = feedObject.data;
      if (data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].message) {
            var status = { picture : data[i].picture,
                           name: data[i].from.name,
                           link: data[i].link,
                           linkName: data[i].name,
                           caption: data[i].caption,
                           description : data[i].description,
                           id: data[i].id
                         };
            status = processActions(status, data[i]);
            $scope.feed.push(status);
          }
        }
        console.log($scope.feed);
      } else {
        $scope.endOfFeed = true;
      }
    };

    var processActions = function(status, data) {
      var postTime = new Date(data.created_time);
      status.time = postCreatedTime(postTime);
      status.message = $sanitize(data.message.replace(/\r?\n/g, "<br>"));
      $sce.trustAsHtml(status.message);
      if (data.actions) {
        for (var i = 0; i < data.actions.length; i++) {
          if (data.actions[i].name === 'Like') {
            status.like = data.actions[i].link;
          } else if (data.actions[i].name === 'Comment') {
            status.comment = data.actions[i].link;
          }
        }
      }
      if (data.likes) {
        status.numberLikes = data.likes.data.length;
      }
      if (data.sharedposts) {
        status.numberShares = data.sharedposts.data.length;
      }
      if (data.comments) {
        status.comments = [];
        status.extraComments = [];
        var comments = data.comments.data;
        if (comments) {
          for (var j = 0; j < comments.length; j++) {
            var comment = { id : comments[j].id,
                            can_remove : comments[j].can_remove,
                            message : comments[j].message,
                            numberLikes : comments[j].like_count,
                            name: comments[j].from.name,
                            time: postCreatedTime(new Date(comments[j].created_time))
                          };
            if (comments[j].message) {
              comment.message = $sanitize(comments[j].message.replace(/\r?\n/g, "<br>"));
              $sce.trustAsHtml(comment.message);
            }
            if (status.comments.length < 5) { 
              status.comments.push(comment);
            } else {
              status.extraComments.push(comment);
            }
          }
        }
        if (data.comments.paging) {
          if (data.comments.paging.next) {
              status.more = data.comments.paging.next;
          }
        }
        if (status.more || status.extraComments) {
          status.repliesMessage = 'Show more replies';
        }
      }
      return status;
    };

    var postCreatedTime = function(time) {
      var today = new Date();
      if (isSameDay(today, time)) {
        if (today.getHours() - time.getHours()) {
           return (today.getHours() - time.getHours()).toString() + ' hours ago';
        } else if (today.getMinutes() - time.getMinutes()) {
          return (today.getMinutes() - time.getMinutes()).toString() + ' minutes ago';
        } else {
          return 'Just now';
        }
      } else {
        return time.toLocaleString().replace(/:\d\d /, '').toLowerCase();
      }
    };

    $scope.showMoreReplies = function(index) {
      if (!$scope.feed[index].gettingReplies) {
         $scope.feed[index].gettingReplies = true;
         $scope.feed[index].repliesMessage = 'Getting more replies';
        if ($scope.feed[index].extraComments) {
          $scope.feed[index].comments = $scope.feed[index].comments.concat($scope.feed[index].extraComments);
          $scope.feed[index].extraComments = [];
          if (!$scope.feed[index].more) {
            $scope.feed[index].repliesMessage = 'End of post';
          } else {
            $scope.feed[index].repliesMessage = 'Show more replies';
          }
           $scope.feed[index].gettingReplies = false;
        } else {
          //get more replies from server.
        }
      }
    };



    if (!$scope.eventId) {
      showErrorModal();
      $timeout(function() {
        $wix.closeWindow('Closed Modal');
      }, 7000);
    } else {
      server.getModalEvent($scope.eventId, "all")
        .then(function(response) {
          server.getModalEvent($scope.eventId, "cover")
            .then(function(response) {
              server.getModalEvent($scope.eventId, "guests")
                .then(function(response) {
                  server.getModalEvent($scope.eventId, "feed")
                    .then(function(response) {
                      feedObject = response;
                      processFeed();
                    }, function(response) {
                      console.log('could not get feed');
                      $scope.feedFailed = true;
                    });
                  processGuest(response);
                }, function(response) {
                  console.log('could not get guests');
                  $scope.guestFailed = true;
                });
              processCover(response);
            }, function(response) {
              console.log('could not get cover');
            });
          eventInfo = response.event_data;
          $scope.settings = response.settings;
          processEventInfo();
        }, function() {
          showErrorModal();
        });
      // eventInfo = {
      //               "description": "OMG this is the story of my life. Narwhal bicycle rights aesthetic fanny pack, art party ennui Brooklyn twee typewriter polaroid chia lo-fi Carles drinking vinegar pour-over. Chambray Pinterest ethical banjo church-key whatever hashtag XOXO. American Apparel Banksy twee, paleo bicycle rights readymade bitters. Seitan Wes.\n\nHoodie pork belly DIY pug VHS messenger bag, readymade four loko wolf occupy. Pop-up aesthetic Pitchfork Tumblr. Mumblecore hella DIY, McSweeney's lo-fi meggings yr banh mi trust fund Odd Future cardigan disrupt sartorial kale chips. Pitchfork organic keytar, roof party street art PBR&B Tumblr church-key High Life beard +1.", 
      //               "end_time": "2014-08-09T22:00:00-0700", 
      //               "is_date_only": false, 
      //               "location": "The Shark Tank - Sap Center", 
      //               "name": "My Event (Demo for Wix App)", 
      //               "owner": {
      //                 "id": "671074532971418", 
      //                 "name": "Jeffrey Chan"
      //               }, 
      //               "privacy": "SECRET", 
      //               "start_time": "2014-08-08T19:00:00-0700", 
      //               "timezone": "America/Los_Angeles", 
      //               "updated_time": "2014-08-01T23:38:37+0000", 
      //               "venue": {
      //                 "id": "411435258956162", 
      //                 "city": "San Jose", 
      //                 "country": "United States", 
      //                 "latitude": 37.332655187978, 
      //                 "longitude": -121.90106628747, 
      //                 "state": "CA", 
      //                 "zip": "95113"
      //               }, 
      //               "id": "1512622455616642"
      //             };
      // processEventInfo();
    }

});