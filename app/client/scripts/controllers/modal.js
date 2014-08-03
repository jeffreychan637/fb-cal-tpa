'use strict';
/*global $:false, console:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $sce, $sanitize, $wix, $log, $timeout, eventId, server) {
    $scope.eventId = eventId;

    var eventInfo;
    var feedObject;

    $scope.eventId = "1512622455616642";

    var showErrorModal = function() {
      $scope.messageTitle = "Oh no!";
      $('#messageTitle').css('color', 'red');
      $scope.messageBody = "Something terrible happened. Please exit and try again.";
      $('#message').modal('show');
    };

    var processEventInfo = function() {
      $scope.id = eventInfo.id;
      $scope.name = eventInfo.name;
      $scope.owner = eventInfo.owner.name;
      console.log($scope.name);
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
      var startTime = new Date(eventInfo.start_time);
      var endTime = new Date(eventInfo.end_time);
      //find a way to tell if they're on the same day
      var onSameDay;
      var startHour = startTime.toLocaleTimeString().toLowerCase();
      var endHour = endTime.toLocaleTimeString().toLowerCase();
      startHour = startHour.replace(/:\d\d /, "");
      endHour = endHour.replace(/:\d\d /, "");
      var startDateString = startTime.toLocaleDateString();
      var startDayString = startTime.toString().replace(/ .+/, ", ");
      if (onSameDay) {
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
    };

    var processLocation = function() {
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
    };

    var processCover = function(coverObject) {
      console.log('processing cover');
      console.log(coverObject);
    };

    var processGuest = function(guestObject) {
      console.log('processing guest');
      console.log(guestObject);

    };

    var processFeed = function() {
      console.log('processing feed');
      console.log(feedObject);
      //if feedFromServer is empty, display end of feed message
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
          eventInfo = response;
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