'use strict';
/*global $:false */

angular.module('fbCal')
  .controller('ModalCtrl', function ($scope, $sce, $sanitize, $wix, $log, $timeout, eventId, server) {
    $scope.eventId = eventId;

    $scope.eventId = "1512622455616642";

    var showErrorModal = function() {
      $scope.messageTitle = "Oh no!";
      $('#messageTitle').css('color', 'red');
      $scope.messageBody = "Something terrible happened. Please exit and try again.";
      $('#message').modal('show');
    };

    var prepareEventInfo = function() {
      prepareDesciption();
      prepareTime();
    };

    var prepareDesciption = function() {
      $scope.description = $scope.eventInfo.description.replace(/\r?\n/g, "<br>");
      $scope.description = $sanitize($scope.description);
      $sce.trustAsHtml($scope.description);
      $scope.showDescription = true;
    };

    var prepareTime = function() {
      var startTime = new Date($scope.eventInfo.start_time);
      var endTime = new Date($scope.eventInfo.finishTime);
      //find a way to tell if they're on the same day
      var onSameDay;
      var startHour = startTime.toLocaleTimeString().toLocalCase();
      var endHour = endTime.toLocaleTimeString().toLocalCase();
      startHour = startHour.replace(/:\d\d /, "");
      endHour = endHour.replace(/:\d\d /, "");
      var startDateString = startTime.toLocaleDateString();
      var startDayString = startTime.toString().replace(/ .+/, " ,");
      if (onSameDay) {
        $scope.shortTime = startDayString + startDateString + " at " + startHour + "-" + endHour;
      } else {
        var endDateString = endTime.toLocaleDateString();
        var endDayString = endTime.toString.replace(/ .+/, " ,");
        $scope.shortTime = startDayString + startDateString + " - " + endDayString + endDateString;
        $scope.longTime = 
      }

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
      //     prepareEventInfo();
      //   }, function() {
      //     showErrorModal();
      //   });
      $scope.eventInfo = {description: "OMG this is the story of my life. Narwhal bicycle rights aesthetic fanny pack, art party ennui Brooklyn twee typewriter polaroid chia lo-fi Carles drinking vinegar pour-over. Chambray Pinterest ethical banjo church-key whatever hashtag XOXO. American Apparel Banksy twee, paleo bicycle rights readymade bitters. Seitan Wes.\n\nHoodie pork belly DIY pug VHS messenger bag, readymade four loko wolf occupy. Pop-up aesthetic Pitchfork Tumblr. Mumblecore hella DIY, McSweeney's lo-fi meggings yr banh mi trust fund Odd Future cardigan disrupt sartorial kale chips. Pitchfork organic keytar, roof party street art PBR&amp;B Tumblr church-key High Life beard +1.", 
                          name: 'My Event (Demo for Wix App) I want to see a super duper long title what will it do', 
                          start_time: '2014-07-11T19:00:00-0700', 
                          location: '', 
                          timezone: 'America/Los_Angeles', 
                          id: '1512622455616642', 
                          end_time: '2014-07-11T22:00:00-0700', 
                          eventColor: '#234323'};
      prepareEventInfo();
    }

});