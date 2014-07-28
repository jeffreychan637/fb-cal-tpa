'use strict';
/*global $:false, , console:false, JSON:false */

angular.module('fbCal')
  .controller('SettingsCtrl', function ($scope, $wix, api, $http, fbSetup,
                                        fbLogin, $timeout, server, $log,
                                        fbEvents) {
    var checkedEventsList;
    var eventsInfoList;
    var userId;
    $scope.allEventsList = [];

    // $scope.allEventsList = [{id: '454', title: 'Wimbledon'},
    //                     {id: '4567', title: 'Superbowl'},
    //                     {id: '4548', title: 'World Cup Viewing'}];

    // $scope.allEventsList.push({id: '4598', title: 'World Cup Viewing'});

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
      saveSettingsDebounce();
    });

    var debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
          $timeout.cancel(timeout);
          timeout = $timeout(function() {
            timeout = null;
            if (!immediate) {
              func.apply();
            }
          }, wait);
          if (immediate && !timeout) func.apply();
        };
      };

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
      saveSettingsDebounce();
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
      } else {
        checkedEventsList = [];
      }
      $scope.loggedIn = response.active;
      $scope.userName = response.name;
      console.log(response);
      userId = response.user_id;
    };

    var saveSettings = function() {
      var data = JSON.stringify({'settings': $scope.settings, 'events' : checkedEventsList});
      server.saveData(data, 'settings');
    };

    var saveSettingsDebounce = debounce(saveSettings, 1000);

    /**
     * These lines of code essentially watch for when we get the access token
     * for the user from Facebook on the client side. Once we get that, we pull
     * all event data and the user's ID from Facebook. Then we compare this user
     * ID with the user ID from the database that is sent with the settings. If
     * they match, we show the event data in the settings panel. If they don't,
     * we make an extra call to the server to get the actual user's event data.
     *
     * For the most part, users tend to stay signed into their Facebook accounts
     * so this technique will result in simultanenous loading of event details
     * from Facebook and settings from the database. In rare cases where this is
     * not the case, we have to make two calls to the server before the settings
     * are ready for the user.
     *
     * All watches are killed after we determine that the components we are
     * waiting for (getting token on client side and settings from server)
     * are received.
     */
    var fbInitWatch = $scope.$watch(function() {
      return fbSetup.getFbReady();
      }, function() {
        if (fbSetup.getFbReady()) {
          fbInitWatch();
          fbEvents.getUserEventDetails()
            .then(function(eventDetailsFromClient) {
              var watchServerforSettings = $scope.$watch('userName', function() {
                console.log('username', $scope.userName);
                if (userId) {
                  watchServerforSettings();
                  if (userId === eventDetailsFromClient.userId) {
                    $scope.allEventsList = eventDetailsFromClient.data;
                    // for (var i = 0; i < eventDetailsFromClient.length; i++) {
                    //   $scope.allEventsList.push(eventDetailsFromClient)
                    // }
                    console.log($scope.allEventsList);
                  } else {
                    getAllEventsFromServer();
                  }
                } else if (userId === "") {
                   $wix.UI.initialize($scope.settings);
                }
              });
            }, function(response) {
              console.warn('called from here');
              getAllEventsFromServer();
            });
        }
    });

    var getAllEventsFromServer = function() {
      server.getAllEvents()
        .then(function(eventDetailsFromServer) {
          $scope.allEventsList = eventDetailsFromServer;
        }, function() {
          console.warn('initializing from here');
          $wix.UI.initialize($scope.settings);
        });
    };

    // $wix.Settings.refreshApp();

    getSettings();
    // $wix.UI.initialize();
});
