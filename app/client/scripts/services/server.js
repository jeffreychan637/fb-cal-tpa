'use strict';
/*global $:false, FB:false, console:false, jQuery:false */

angular.module('fbCal').factory('server', function ($log, $http, $wix, api) {
  var getSettingsWidgetURL = '/GetSettingsWidget/' + $wix.Utils.getCompId();
  var getSettingsSettingsURL = '//';


  var instance = api.getInstance();
  /**
   * This function makes a call to the backend database to get the
   * latest user settings. It's called whenever the widget is first loaded.
   * On errors, the default settings are loaded.
   */
  var getUserInfo = function() {
  $http({method: 'GET',
         url: getSettingsWidgetURL,
         headers: {'X-Wix-Instance' : instance},
         timeout: 10000
      }).success(function (data, status) {
        if (status === 200) {
          console.log(data);
          return jQuery.parseJSON(data);
        } else {
          console.log('The server is returning an incorrect status.');
          return {settings : api.defaults, eventIds : [],
                  fb_event_data : {}, active : true};
          //i don't really know what the fb_event_data looks like
        }
      }).error(function () {
        return {settings : api.defaults, eventIds : [],
                fb_event_data : {}, active : true};
      });
  };

var obtainSettings = function () {
      $http.get('/api/settings/' + $scope.compId + '?userProfile=true', {
            headers: {
              'Content-type': 'application/json', 
              'X-Wix-Instance': instance
            }
      }).success(function(data, status, headers, config) {
            if (status === 200) {
              if (data.widgetSettings.hasOwnProperty("settings") && data.widgetSettings.settings != null) { //checks to see if there are saved settings
              // if (Object.keys(data.widgetSettings.settings)) { 
                console.log('there are saved settings');
                $scope.settings = data.widgetSettings.settings; //works (this is if everything goes as planned and settings are gotten from the server)
                $wix.UI.initialize($scope.settings);
                $wix.Settings.triggerSettingsUpdatedEvent($scope.settings, 
                  $wix.Utils.getOrigCompId());
              } else {
                console.log('there are no saved settings');
                $scope.settings = api.defaults; // if user does not have any saved settings
                $wix.UI.initialize($scope.settings);
                $wix.Settings.triggerSettingsUpdatedEvent($scope.settings, 
                  $wix.Utils.getOrigCompId());
              }
            } else {
              console.log("status != 200");
              $scope.settings = api.defaults;
              console.log('Initializing Wix UI Settings Panel');
              $wix.UI.initialize($scope.settings);
              $wix.Settings.triggerSettingsUpdatedEvent($scope.settings, 
                $wix.Utils.getOrigCompId());
            }
        $scope.provider = data.widgetSettings.provider;
        if ($scope.provider) {
          $scope.userName = data.widgetSettings.userProfile.displayName;
          $scope.userAccount = data.widgetSettings.userProfile.emails[0].value;
          $scope.userReceiveEmail = $scope.userAccount;
        } else {
          $scope.userReceiveEmail = null;
        }
        previousValidEmail = $scope.userReceiveEmail;
        console.log('provider success: ' + $scope.provider + ' ' + $scope.userReceiveEmail);
        // console.log(data.widgetSettings);
        // console.log(data.widgetSettings.settings);
        // console.log(data.widgetSettings.userProfile);
        // console.log(JSON.stringify(data.widgetSettings.userProfile.emails, null, 4));
      }).error(function(data, status, headers, config) {
          console.log("There was an error obtaining your saved settings from the database.");
          $scope.settings = api.defaults;
          $wix.UI.initialize($scope.settings);
          $wix.Settings.triggerSettingsUpdatedEvent($scope.settings, 
            $wix.Utils.getOrigCompId());
          console.log('provider error: ' + $scope.provider);
          // alert("There was an error obtaining your account settings.");
      });
    }


  var putSettings = function () {
      // Validates email. If invalid, uses last known valid email.
      // var emailToSave = $scope.userReceiveEmail;
      // console.log($scope.userReceiveEmail);
      // console.log(emailRegex.test($scope.userReceiveEmail) === false);
      // if (emailRegex.test($scope.userReceiveEmail) === false) {
      //   emailToSave = previousValidEmail;
      // }
      var combineSettings = {widgetSettings: {settings: $scope.settings}};
      var settingsJson = JSON.stringify(combineSettings);
      var compId = $wix.Utils.getOrigCompId();
      $http.put('/api/settings/' + compId + '?instance=' + instance, 
         settingsJson,  { headers: {
                      'X-Wix-Instance': instance,
                      'Content-Type': 'application/json'
                      }
                    })
          .success(function (data, status, headers, config) {
          })
          .error(function (data, status, headers, config) {
            console.log("There was an error saving settings.");
          })
          .then(function (response) {
            console.log("settings saved: " + response.data);
          });
        // console.log(emailToSave);
      }

});