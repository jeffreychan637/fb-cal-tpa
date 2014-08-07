'use strict';
/*global $:false, console:false, location:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $sce, $sanitize, $wix, $log, $q, 
                                     $timeout, $window, eventId, server,
                                     fbSetup, fbEvents, modalFbLogin) {
    $scope.eventId = eventId;

    var eventInfo = {};
    var feedObject = {};

    $scope.feed = [];
    $scope.extraFeed = [];

    var nextFeed = '';
    var notGettingMoreFeed = true;

    $scope.rsvpStatus = 'RSVP';
    
    var curErrorType = '';
    var interactionParams = {};

    // $scope.eventId = "1512622455616642";

    var watchFb = $scope.$watch(function() {
                    return fbSetup.getFbReady();
                  }, function() {
                      if (fbSetup.getFbReady()) {
                        watchFb();
                        fbEvents.getRsvpStatus($scope.eventId)
                        .then(function(response) {
                          $scope.rsvpStatus = response;
                        });
                      }
                  });

    $scope.shareFbEvent = function() {
      if (fbSetup.getFbReady()) {
        fbEvents.shareEvent($scope.eventId);
      } else {
        interactionParams.action = 'share';
        $scope.showModal('wait');
      }
    };
    
    var errorTypes = ['facebook', 'facebook login', 'load'];

    var errorModal = {title: 'Oh no!',
                      css: {'color' : 'red'},
                      message: 'Something terrible happened. Please try again or reload the page.',
                      modalButton: 'Try Again'
                     };

    var waitModal = {title: 'Please wait...',
                     message: 'We are still connecting to Facebook. Please wait a few seconds and then click try again.',
                     modalButton: 'Try Again'
                    };

    var permissionModal = {title: 'Hello there!',
                           modalButton: 'Grant Permission',
                           declinedMessage: 'We can’t perform your request regarding this Facebook event unless you don’t give us permission to.',
                           notLoggedInMessage: 'We need your permission to fulfill your request regarding this Facebook event. If you’re not logged in, you can’t grant your permission.',
                           declinedPermissionMessage: 'You might be wondering why we need these permissions to fulfill your request.'
                          };

    var solveModal = {title: 'Trying again...',
                      message: 'Giving our best effort!'
                     };

    var linkModal = {title: 'Share'};

    $scope.showModal = function(type, message) {
      $('#messageTitle').css({'color' : '#09F'});
      curErrorType = type;
      $scope.showLink = false;
      $scope.postError = false;
      $scope.permissionError = false;
      if (errorTypes.indexOf(type) >= 0) {
        $scope.messageTitle = errorModal.title;
        $('#messageTitle').css(errorModal.css);
        $scope.messageBody = errorModal.message;
        $scope.modalButton = errorModal.modalButton;
        if (message) {
          $scope.postError = true;
          $scope.userPost = message;
        }
      } else if (type === 'link') {
        $scope.messageTitle = linkModal.title;
        $scope.showLink = true;
      }
        else if (type === 'wait') {
        $scope.messageTitle = waitModal.title;
        $scope.messageBody = waitModal.message;
        $scope.modalButton = waitModal.modalButton;
      } else {
        $scope.permissionError = true;
        $scope.messageTitle = permissionModal.title;
        $scope.modalButton = permissionModal.modalButton;
        switch(type) {
          case 'declined permission':
            $scope.messageBody = permissionModal.declinedPermissionMessage;
            break;
          case 'declined':
            $scope.messageBody = permissionModal.declinedMessage;
            break;
          case 'not logged in':
            $scope.messageBody = permissionModal.notLoggedInMessage;
        }
      }
      $timeout(function() {
        $('#message').modal('show');
      }, 500);
    };

    $scope.solveError = function() {
      $scope.postError = false;
      $scope.permissionError = false;
      $scope.messageTitle = solveModal.title;
      $('#messageTitle').css({'color' : '#09F'});
      $scope.messageBody = solveModal.message;
      if (curErrorType === 'declined permission') {
        getDeniedPermission();
      } else if (curErrorType === 'load') {
        location.reload();
      } else if (curErrorType === 'wait') {
        if (interactionParams.action === 'share') {
          $('#message').modal('hide');
          $timeout(function() {
            $scope.shareFbEvent();
          }, 1500);
        } else {
          $timeout(function() {
            tryInteractionAgain();
          }, 1500);
        }
      } else {
        tryInteractionAgain();
      }
    };

    var getDeniedPermission = function() {
      var permission;
      if (rsvp.indexOf(interactionParams.action) >= 0) {
        permission = 'rsvp_event';
      } else {
        permission = 'publish_actions';
      }
      modalFbLogin.loginWithPermission(permission, true)
        .then(function() {
          tryInteractionAgain();
        }, function() {
          $('#message').modal('hide');
          $timeout(function() {
            $scope.showModal('declined permission');
          }, 1000);
        });
    };

    var tryInteractionAgain = function() {
      $scope.interactWithFb(interactionParams.action, interactionParams.key,
                            interactionParams.message)
        .then(function() {
          $scope.messageBody = 'Success!';
        }, function() {
          $('#message').modal('hide');
        });
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
      $scope.displayModal = true;
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
          if ($('#time').outerHeight() > $('#rsvp').outerHeight()) {
            $('#rsvp').outerHeight($('#time').outerHeight());
          } else {
            $('#time').outerHeight($('#rsvp').outerHeight());
          }
        }
      }, 500);
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
        $('#title').addClass('name');
        $('#host').addClass('name');
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
          if ($('#location').outerHeight() > $('#guests').outerHeight()) {
            $('#guests').outerHeight($('#location').outerHeight());
          } else {
            $('#location').outerHeight($('#guests').outerHeight());
          }
        }
      }, 100);
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
        $scope.moreFeedMessage = "Show more posts";
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
          $scope.moreFeedMessage = "Show more posts";
        }
      } else {
        $scope.moreFeedMessage = "";
      }
      $scope.displayFeed = true;
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
      } else {
        status.numberLikes = 0;
      }
      if (data.sharedposts) {
        status.numberShares = data.sharedposts.data.length;
      } else {
        status.numberShares = 0;
      }
      status.comments = [];
      status.extraComments = [];
      if (data.comments) {
        var comments = data.comments.data;
        if (comments) {
          for (var j = 0; j < comments.length; j++) {
            var comment = processComments(comments[j]);
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
                     numberLikes : data.like_count,
                     name: data.from.name,
                     time: postCreatedTime(new Date(data.created_time))
                    };
      if (data.message) {
        comment.message = $sanitize(data.message.replace(/\r?\n/g, "<br>"));
        $sce.trustAsHtml(comment.message);
      }
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
        } else if ($scope.feed[index].more){
          // var info = fbEvents.parseFbUrl($scope.feed.more);
          //get more replies from server.
          $scope.feed[index].gettingReplies = false;
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

    //explain what key does for different actions (e.g. key is comment id when liking a comment)
    //message is usally message except for like/unlike commment where it is the index
    $scope.interactWithFb = function(action, key, message) {
      var deferred = $q.defer();
      console.log(message);
      var index;
      if ($scope.settings.commenting) {
        console.log('running');
        var processed = processAction(action, key, message);
        if (!processed) {
          deferred.reject();
          return;
        } else {
          key = processed.key;
          index = processed.index;
          console.log('got to here');
          if (fbSetup.getFbReady()) {
            if (modalFbLogin.checkFirstTime()) {
              modalFbLogin.checkLoginState()
                .then(function() {
                  handleFbInteraction(action, key, message, index, deferred);
                }, function(response) {
                  deferred.reject();
                  setParams(action, key, message, index);
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
                handleFbInteraction(action, key, message, index, deferred);
              } else {
                modalFbLogin.loginWithPermission(permission, false)
                  .then(function() {
                    handleFbInteraction(action, key, message, index, deferred);
                  }, function(response) {
                    deferred.reject();
                    setParams(action, key, message, index);
                    handleFailedFbLogin(response);
                  });
              }
            }
          } else {
            deferred.reject();
            setParams(action, key, message, index);
            $scope.showModal('wait');
          }
        }
      } else {
        deferred.reject();
        location.reload();
      }
      return deferred.promise;
    };

    var processAction = function(action, key, message) {
      var index;
      if (action === 'like' || action === 'unlike') {
        if($scope.feed[key].liking) {
        //prevents problems if user mashes like button
          return false;
        } else {
          $scope.feed[key].liking = true;
        }
      } else if (action === 'post' || action === 'comment') {
        if (!message) {
          return false;
        }
      } else if (action === 'deletePost') {
        index = key;
      }
      if (rsvp.indexOf(action) >= 0 || action === 'post') {
        key = $scope.eventId;
      } else if (action === 'like' || action === 'unlike' ||
                action === 'comment' || action === 'deletePost') {
          index = key;
          key = $scope.feed[key].id;
      } else if (action === 'likeComment' || action === 'unlikeComment' ||
                 action === 'deleteComment') {
        for (var i = 0; i < $scope.feed.length; i++) {
          if ($scope.feed[i].comments[message] &&
              $scope.feed[i].comments[message].id === key) {
            index = i;
            break;
          }
        }
        if ($scope.feed[index].comments[message].liking) {
          return false;
        } else {
          $scope.feed[index].comments[message].liking = true;
        }
      }
      return {key: key, index: index};
    };

    var handleFbInteraction = function(action, key, message, index, deferred) {
      fbEvents.processInteraction(action, key, message)
        .then(function(response) {
          if (response) {
            console.log('Successful!  ' + action);
            if (rsvp.indexOf(action) >= 0) {
              switch(action) {
                case 'attending':
                  $scope.rsvpStatus = 'Going';
                  break;
                case 'maybe':
                  $scope.rsvpStatus = 'Maybe';
                  break;
                case 'declined':
                  $scope.rsvpStatus = 'Declined';
              }
            } else {
              switch(action) {
                case 'post':
                  var status = processStatus(response);
                  status.appPosted = true;
                  $scope.feed.unshift(status);
                  break;
                case 'like':
                  $scope.feed[index].numberLikes++;
                  $scope.feed[index].userLiked = true;
                  break;
                case 'unlike':
                  $scope.feed[index].numberLikes--;
                  $scope.feed[index].userLiked = false;
                  break;
                case 'likeComment':
                  $scope.feed[index].comments[message].numberLikes++;
                  $scope.feed[index].comments[message].userLiked = true;
                  break;
                case 'unlikeComment':
                  $scope.feed[index].comments[message].numberLikes--;
                  $scope.feed[index].comments[message].userLiked = false;
                  break;
                case 'comment':
                  $scope.showMoreReplies(index);
                  var comment = processComments(response);
                  comment.appPosted = true;
                  if ($scope.$$phase) {
                    $scope.feed[index].comments.push(comment);
                  } else {
                    $scope.$apply($scope.feed[index].comments.push(comment));
                  }
                  break;
                case 'deletePost':
                  $scope.feed.splice(index, 1);
                  break;
                case 'deleteComment':
                  $scope.feed[index].comments.splice(message, 1);
              }
            }
            deferred.resolve();
          }
        }, function() {
          setParams(action, key, message, index);
          deferred.reject();
          if (action === 'post' || action === 'comment') {
            $scope.showModal('facebook', message);
          } else {
            $scope.showModal('facebook');
          }
        })['finally'](function() {
            if (action.match(/likeComment/)) {
              $scope.feed[index].comments[message].liking = false;
            } else if (action.match(/like/)) {
              $scope.feed[index].liking = false;
            }
        });
    };

    var setParams = function(action, key, message, index) {
      var changedKeyActions = ['like' , 'unlike', 'comment', 'deletePost'];
      if (changedKeyActions.indexOf(action) >= 0) {
        interactionParams = {action: action,
                             key: index,
                             message: message
                            };
      } else {
        interactionParams = {action: action,
                             key: key,
                             message: message
                            };
      }
    };

    var handleFailedFbLogin = function(response) {
      if (['declined', 'not logged in', 'declined permission'].indexOf(response) >= 0) {
        $scope.showModal(response);
      } else {
        $scope.showModal('facebook login');
      }
    };



    if (!$scope.eventId) {
      $scope.showModal('load');
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
          $scope.showModal('load');
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