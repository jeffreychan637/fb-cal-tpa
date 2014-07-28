'use strict';
/*global $:false, , console:false, JSON:false */

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, fbSetup, fbLogin, $timeout, server, $log) {
    var checkedEventsList;
    var eventsInfoList;

    $scope.allEventsList = [{id: '454', title: 'Wimbledon'},
                        {id: '4567', title: 'Superbowl'},
                        {id: '4548', title: 'World Cup Viewing'}];

    $scope.allEventsList.push({id: '4598', title: 'World Cup Viewing'});

    // when opening settings, get settings and then save them
    
    $scope.$on('Render Finished', function() {
        console.log("finished");
        for (var i = 0; i < $scope.allEventsList.length; i++) {
          // $('#event' + $scope.allEventsList[i].id).attr('wix-options', '{checked:true}');
        }
        $wix.UI.initialize($scope.settings);
        for (var j = 0; j < $scope.allEventsList.length; j++) {
          $('#event' + $scope.allEventsList[j].id + 'Color .color-box-inner').css('background', '#0088CB');
          // $('#event' + $scope.allEventsList[i].id).attr('wix-options', '{checked:true}');
        }
    });

    $scope.allEventsList.push({id: '4500', title: 'World Cupasdasd Viewing'});
    /**
     * Sends the settings to the widget as well as starting the process of
     * saving the settings to the database.
     */
    var sendSettings = function() {
      $wix.Settings.triggerSettingsUpdatedEvent({settings: $scope.settings,
                                                 events: checkedEventsList,
                                                 eventsInfo: eventsInfoList
                                                },
                                                $wix.Utils.getOrigCompId());
      //call save to the database function here
    };

    $wix.UI.onChange('*', function (value, key) {
      console.log(key, value);
      var eventId = key.match(/([0-9]+)$/);
      if (eventId) {
        if (value) {
          var eventHex = getColor(eventId[1]);
          var eventObj = {eventId: eventId[1], eventColor: eventHex};
          checkedEventsList.push(eventObj);
        } else {
          var eventIndex = checkedEventsList.map(function (elem) {
                                              return elem.eventId;
                                            }).indexOf(eventId[1]);
          checkedEventsList.splice(eventIndex, 1);
        }
      } else if (key.match(/event([0-9]+)Color$/)) {
        eventId = key.match(/([0-9]+)/);
        console.log('value', value.cssColor, eventId);

        for (var i = 0; i < checkedEventsList.length; i++) {
          console.log(i);
          if (checkedEventsList[i].eventId === eventId[1]) {
            checkedEventsList[i].eventColor = value.cssColor;
            break;
          }
        }
      } else if (key === 'corners' || key === 'borderWidth') {
        $scope.settings[key] = Math.ceil(value);
      } else {
        $scope.settings[key] = value;
      }
      sendSettings();
      saveSettings($scope.settings, checkedEventsList);

    });

    /** Hack to get value of colorpicker */
    var getColor = function(eventId) {
      var style = $('#event' + eventId + 'Color .color-box-inner').attr('style');
      var colorRGB = style.match(/rgb\(([0-9]+), ([0-9]+), ([0-9]+)\);$/);
      return convertToHex(parseInt(colorRGB[1], 10), parseInt(colorRGB[2], 10), 
                          parseInt(colorRGB[3], 10));
    };

    var convertToHex = function(r, g, b) {
      return ("#" + componentToHex(r) + componentToHex(g) + componentToHex(b));
    };

    var componentToHex = function(c) {
      var hex = c.toString(16).toUpperCase();
      if (hex.length === 1) {
        return "0" + hex;
      } else {
        return hex;
      }
    };

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
      saveSettings($scope.settings, checkedEventsList);
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
                  $scope.allEventsList = [];
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
      if (response.events && response.events !== "settings") {
        checkedEventsList = response.events;
        console.log(checkedEventsList);
      } else {
        checkedEventsList = [];
      }
      $scope.loggedIn = response.active;
      $scope.userName = response.name;
      console.log(checkedEventsList);
      $scope.allEventsList.push({id: '4600', title: 'World Cuperrr Viewing'});
      // setTimeout(function() {$wix.UI.initialize($scope.settings);}, 3000);
    };

    var saveSettings = function(settings, events) {
      var data = JSON.stringify({'settings': settings, 'events' : events});
      server.saveData(data, 'settings');
    };
    
    // $timeout(function() {
    //   console.debug('a is true!');
    //   $scope.a = true;
    // }, 3000);

    // $timeout(function() {
    //   console.debug('b is true!');
    //   $scope.b = true;
    // }, 5000);

    // $timeout(function() {
    //   console.debug('a is false!');
    //   $scope.a = false;
    // }, 7000);

    // $timeout(function() {
    //   console.debug('b is false!');
    //   $scope.b = false;
    // }, 10000);

    // $timeout(function() {
    //   console.debug('a is true!');
    //   $scope.a = true;
    // }, 12000);

    // $timeout(function() {
    //   console.debug('b is true!');
    //   $scope.b = true;
    // }, 14000);

    // var butt = $scope.$watch('a', function() {
    //   console.debug('watching a!');
    //   if ($scope.a) {
    //      console.debug('I see that a is true!');
    //     if (!$scope.b) {
    //       var c = $scope.$watch('b', function() {
    //         console.debug('watching b!');
    //         if ($scope.b) {
    //           console.debug('I see that b is true!');
    //           c();
    //         } else {
    //            console.debug('b is still false!');
    //         }
    //       });
    //       butt();
    //     } else {
    //       console.debug('b is true!');
    //     }
    //   } else {
    //      console.debug('a is still false!');
    //   }
    // });

    // $wix.Settings.refreshApp();

    getSettings();
    // $wix.UI.initialize();
});
