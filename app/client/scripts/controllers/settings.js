'use strict';
/*global $:false, , console:false, JSON:false */

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, fbSetup, fbLogin, $timeout, server, $log) {
    $scope.settings = api.defaults;

    $scope.eventList = [{id: '454', title: 'Wimbledon'},
                        {id: '4567', title: 'Superbowl'},
                        {id: '4548', title: 'World Cup Viewing'}];

    $scope.eventList.push({id: '4598', title: 'World Cup Viewing'});

    // when opening settings, get settings and then save them
    
    $scope.$on('Render Finished', function() {
        console.log("finished");
        for (var i = 0; i < $scope.eventList.length; i++) {
          $('#event' + $scope.eventList[i].id).attr('wix-options', '{checked:true}');
        }
        $wix.UI.initialize($scope.settings);
        for (var j = 0; j < $scope.eventList.length; j++) {
          $('#event' + $scope.eventList[j].id + 'Color .color-box-inner').css('background', 'red');
          // $('#event' + $scope.eventList[i].id).attr('wix-options', '{checked:true}');
        }
    });

    $scope.eventList.push({id: '4500', title: 'World Cupasdasd Viewing'});
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
      console.log($scope.settings);
      console.log(key, value);
      var eventId = key.match(/([0-9]+)$/);
      console.log(eventId);
      if (eventId) {
        //$scope.
        //prefer some kind of hashmap data structure or define an object class.

      } else if (key.match(/event([0-9]+)Color/)) {
        var eventColor = value; //check if this is actually how it works - might be some property of value instead
        $scope.checkedEventList[key] = value; 
      }
      else if (key === 'corners' || key === 'borderWidth') {
        $scope.settings[key] = Math.ceil(value);
      } else {
        $scope.settings[key] = value;
      }
      sendSettings();
      // saveSettings($scope.settings, $scope.checkedEventList);
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
            console.log(response);
            console.log('running');
            $scope.userName = response;
            $scope.loggedIn = true;
          }, 
          function(error) {
            console.log('got login error');
            handlingFbMessages(error);
          })['finally'](function() {
            $scope.connectDisabled = false;
          });
      } else {
        handlingFbMessages('not connected');
        $scope.connectDisabled = false;
      }
    };

    $scope.logout = function(disconnectDisabled) {
      if (!disconnectDisabled) {
        $scope.disconnectDisabled = true;
        console.log('disconnectDisabled');
        fbLogin.logout()
          .then(function() {
            server.logout()
              .then(function() {
                  $scope.loggedIn = false;
                  handlingFbMessages('logout successful');
                  $scope.eventList = [];
              }, function() {
                $scope.loggedIn = false;
                handlingFbMessages('unknown');
              });
          },
          function(error) {
            $scope.loggedIn = false;
            handlingFbMessages(error);
          })['finally'](function() {
            $scope.disconnectDisabled = false;
          });
        }
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
      } else if (message === 'denied') {
        $scope.loginMessage = 'To use this app, you must give access to your' +
                              ' events. Please login again.';
      } else if (message === 'not logged in') {
        $scope.loginMessage = 'You must log into Facebook before you can ' +
                            'connect.';
      }
      $timeout(function() {
          $scope.loginMessage = false; 
        }, 5000);
    };

    var getSettings = function() {
      server.getUserInfo('settings')
        .then(function (response) {
          $log.info('got settings');
          setSettings(response);
        }, function(response) {
          $log.warn('rejected');
          setSettings(response);
        });
    };

    var setSettings = function(response) {
      if (response.settings) {
        $scope.settings = response.settings;
      } else {
        $scope.settings = api.defaults;
      }
      $scope.loggedIn = response.active;
      $scope.userName = response.name;
      //do soemthing with event IDs
      $scope.eventList.push({id: '4600', title: 'World Cuperrr Viewing'});
      // setTimeout(function() {$wix.UI.initialize($scope.settings);}, 3000);
    };

    var saveSettings = function(settings, events) {
      var data = JSON.stringify({'settings': settings, 'events' : events});
      server.saveData(data, 'settings');
    };
    


    // $wix.Settings.refreshApp();

    getSettings();
    // $wix.UI.initialize();
});
