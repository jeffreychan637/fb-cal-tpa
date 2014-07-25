'use strict';

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, fbSetup, fbLogin, $timeout) {
    $scope.settings = api.defaults;

    $scope.eventList = [{id: '454', title: 'Wimbledon'},
                        {id: '4567', title: 'Superbowl'},
                        {id: '4548', title: 'World Cup Viewing'}];

    //hello/[^\s]+
    //hello/[0-9]+  use this regex for checking if keys are events 
    //replace hello with something like "event"

    /**
     * Sends the settings to the widget as well as starting the process of
     * saving the settings to the database.
     */
    var sendSettings = function() {
      $wix.Settings.triggerSettingsUpdatedEvent($scope.settings,
                                                $wix.Utils.getOrigCompId());
      //call save to the database function here
    };

    $wix.UI.onChange('*', function (value, key) {
      console.log(key, value);
      if (key === 'corners' || key === 'borderWidth') {
        $scope.settings[key] = Math.ceil(value);
      } else {
        $scope.settings[key] = value;
      }
      sendSettings();
    });

    $scope.handleToggles = function(toggle) {
      if (toggle === 'view') {
        if ($scope.view) {
          $scope.settings.view = 'Month';
        } else {
          $scope.settings.view = 'List';
        }
      } else if (toggle === 'commenting') {
        $scope.settings.commenting = true;
      } else if (toggle === 'moderating') {
        $scope.settings.moderating = true;
      } else {
        $scope.settings.hostedBy = true;
      }
      sendSettings();
    };

    $scope.login = function() {
      $scope.connectDisabled = true;
      $scope.loginMessage = '';
      if (fbSetup.getFbReady()) {
        fbLogin.checkLoginState()
          .then(function(response) {
            $scope.loggedIn = true;
          }, 
          function(error) {
            handlingFbMessages(error);
          })['finally'](function() {
            $scope.connectDisabled = false;
          });
      } else {
        handlingFbMessages('not connected');
        $scope.connectDisabled = false;
      }
    };

    $scope.logout = function() {
      $scope.disconnectDisabled = true;
      console.log('disconnectDisabled');
      fbLogin.logout()
        .then(function() {
          handlingFbMessages('logout successful');
          $scope.loggedIn = false;
          $scope.disconnectDisabled = false;
          $scope.eventList = [];
        },
        function(error) {
          handlingFbMessages(error);
        });
    };

    var handlingFbMessages = function(message) {
      if (message === 'not connected') {
        $scope.loginMessage = "We haven't connected to the Facebook server " +
                             "yet. Try connecting again in a minute or " + 
                             "reload the page.";
      } else if (message === 'logout successful') {
        $scope.loginMessage = 'Logout successful.';
      } else if (message === 'unknown') {
        $scope.loginMessage = 'Oh no! Something went wrong; please try ' +
                            'again.';
      } else if (message === 'declined') {
        $scope.loginMessage = 'To use this app, you must connect it with ' +
                            'your Facebook account.';
      } else if (message === 'not logged in') {
        $scope.loginMessage = 'You must log into Facebook before you can ' +
                            'connect.';
      }
      $timeout(function() {
          $scope.loginMessage = false; 
        }, 5000);
    };



    // $wix.Settings.refreshApp();

    $wix.UI.initialize();
});
