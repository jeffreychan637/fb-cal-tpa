'use strict';
/*global $:false, console:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $sce, $sanitize, $wix, $log, 
                                     $timeout, $window, eventId, server,
                                     fbSetup, fbEvents, modalFbLogin) {
    $scope.eventId = eventId;

    var eventInfo;
    var feedObject;

    $scope.feed = [];
    $scope.extraFeed = [];

    var nextFeed;
    var notGettingMoreFeed = true;

    $scope.rsvpStatus = 'RSVP'; //change this as appropriate (cancelled watch)
    //make fql query

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
        stats.attending_count = processNumber(stats.attending_count);
        stats.unsure_count = processNumber(stats.unsure_count);
        stats.not_replied_count = processNumber(stats.not_replied_count);
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
      if (feedObject.paging && feedObject.paging.next) {
        nextFeed = feedObject.paging.next;
        $scope.moreFeedMessage = "Load more posts";
      } else {
        $scope.moreFeedMessage = "";
      }
      var data = feedObject.data;
      if (data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].message) {
            var status = processStatus(data[i]);
            if ($scope.feed.length < 5) {
              $scope.feed.push(status);
            } else {
              $scope.extraFeed.push(status);
            }
          }
        }
        if ($scope.extraFeed.length > 0) {
          $scope.moreFeedMessage = "Load more posts";
        }
        console.log($scope.feed);
      } else {
        $scope.moreFeedMessage = "";
      }
    };

    var processStatus = function(data) {
      var status = { picture : data.picture,
                     name: data.from.name,
                     link: data.link,
                     linkName: data.name,
                     caption: data.caption,
                     description : data.description,
                     id: data.id
                   };
      status = processActions(status, data);
      return status;
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
            var comment = processComments(comments[j]);
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
        if (status.more || status.extraComments.length > 0) {
          status.repliesMessage = 'Show more replies';
        }
      }
      return status;
    };

    var processComments = function(data) {
      var comment = {id : data.id,
                     can_remove : data.can_remove,
                     message : data.message,
                     numberLikes : data.like_count,
                     name: data.from.name,
                     time: postCreatedTime(new Date(data.created_time))
                    };
      return comment;
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
        if ($scope.feed[index].extraComments.length > 0) {
          $scope.feed[index].comments = $scope.feed[index].comments.concat($scope.feed[index].extraComments);
          $scope.feed[index].extraComments = [];
          if (!$scope.feed[index].more) {
            $scope.feed[index].repliesMessage = '';
          } else {
            $scope.feed[index].repliesMessage = 'Show more replies';
          }
           $scope.feed[index].gettingReplies = false;
        } else {
          // var info = fbEvents.parseFbUrl($scope.feed.more);
          //get more replies from server.
        }
      }
    };

    $scope.showMoreFeed = function() {
      if (notGettingMoreFeed) {
        notGettingMoreFeed = false;
        $scope.moreFeedMessage = "Getting more posts";
        if ($scope.extraFeed.length > 0) {
          $scope.feed = $scope.feed.concat($scope.extraFeed);
          $scope.extraFeed = [];
          if (nextFeed) {
            $scope.moreFeedMessage = 'Show more posts';
          } else {
            $scope.moreFeedMessage = '';
          }
          notGettingMoreFeed = true;
        } else {
          // var info = fbEvents.parseFbUrl(nextFeed);
          //make server call
        }
      }
    };

    var rsvp = ['attending', 'maybe', 'declined']; 

    $scope.interactWithFb = function(action, key, message) {
      if ($scope.settings.commenting) {
        if (rsvp.indexOf(action) >= 0 || action === 'post') {
          key = $scope.eventId;
          if (action === 'post') {
            message = $sanitize(message);
          }
        } else if (action === 'like' || action === 'comment') {
            key = $scope.feed[key].id;
        }
        if (fbSetup.getFbReady()) {
          if (modalFbLogin.checkFirstTime()) {
            modalFbLogin.checkLoginState()
              .then(function() {
                handleFbInteraction(action, key, message);
              }, function(response) {
                handleFailedFbLogin(response);
              });
          } else {
            var permission;
            if (rsvp.indexOf(action) >= 0) {
              permission = 'rsvp_event';
            } else {
              permission = 'publish_actions';
            }
            if (modalFbLogin.checkPermission(permission)) {
              console.log('all permissions met');
              handleFbInteraction(action, key, message);
            } else {
              modalFbLogin.loginWithPermission(permission)
                .then(function() {
                  handleFbInteraction(action, key, message);
                }, function(response) {
                  handleFailedFbLogin(response);
                });
            }
          }
        } else {
          //open please wait modal
        }
      }
    };

    var handleFbInteraction = function(action, key, message) {
      fbEvents.processInteraction(action, key, message)
        .then(function(response) {
          if (response) {
            console.log('Successful!  ' + action);
            if (rsvp.indexOf(action) >= 0) {
              //tell user they have been succesfully rsvp or declined or maybe
              if (action === 'attending') {
                $scope.rsvpStatus = 'Going';
              } else if (action === 'maybe') {
                $scope.rsvpStatus = 'Maybe';
              } else {
                $scope.rsvpStatus = 'Declined';
              }
            } else if (action === 'post') {
              //append user's to front of feed array
              var status = processStatus(response);
              $scope.feed.unshift(status);
            } else if (action === 'like') {
              //update like
            } else if (action === 'unlike') {
              //update like
            } else {
              //update comment
            }
          }
        }, function() {
          showErrorModal(); 
        });
    };

    var handleFailedFbLogin = function(response) {
      if (response === 'declined') {
        //user declined login
      } else if (response === 'not logged in') {
        //user is not logged in
      } else if (response === 'denied permission') {
        //user did not grant permission - explain permission
      } else {
        showErrorModal();
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