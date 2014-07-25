'use strict';
/*global $:false, FB:false, console:false, jQuery:false */

angular.module('fbCal').factory('server', function ($log, $http, $wix, api, $window) {
  var compId = $wix.Utils.getCompId();
  var instance = api.getInstance();
  
  var getSettingsWidgetURL = '/GetSettingsWidget/' + compId;
  var getSettingsSettingsURL = '/GetSettingsSettings/' + compId;
  var saveSettingsURL = '/SaveSettings/' + compId;
  var saveAccessTokenURL = '/SaveAccessToken/' + compId;

  var defaultSettingsWidget = {settings : api.defaults, eventIds : [],
                               fb_event_data : {}, active : true};
  var defaultSettingsSettings = {settings : api.defaults, eventIds : [],
                                 active : true};

  var getURL = function(requestType, from) {
    if (requestType === 'get') {
      if (from === 'widget') {
        return getSettingsWidgetURL;
      } else {
        return getSettingsSettingsURL;
      }
    } else {
      if (from === 'settings') {
        return saveSettingsURL;
      } else {
        return saveAccessTokenURL;
      }
    }
  };

  var getDefault = function(from) {
    if (from === 'widget') {
      return defaultSettingsWidget;
    } else {
      return defaultSettingsSettings;
    }
  };

  /**
   * This function makes a call to the backend database to get the
   * latest user settings. It's called whenever the widget or settings panal
   * is first loaded. On errors, the default settings are loaded.
   */
  var getUserInfo = function(from) {
  $http({
         method: 'GET',
         url: getURL('get', from),
         headers: {'X-Wix-Instance' : instance},
         timeout: 10000
        }).success(function (status, data) {
          console.log(status, data);
          if (status === 200) {
            console.log(data);
            return jQuery.parseJSON(data);
          } else {
            console.log('The server is returning an incorrect status.');
            return getDefault(from);
            //i don't really know what the fb_event_data looks like
          }
        }).error(function (status, message) {
          $log.warn(status, message);
          return getDefault(from);
        });
  };

  var saveData = function(data, dataType) {
    $http({
            method: 'PUT',
            url: getURL('post', dataType),
            headers: {'X-Wix-Instance' : instance, 'URL' : $window.location.hostname},
            timeout: 10000,
            data: data
          }).success(function (status, message) {
            console.log(status, message);
            if (status === 200) {
              console.log(dataType + ' saved successfully.');
              return true;
            } else {
              console.log('The server is returning an incorrect status.');
              return false;
            }
          }).error(function (status, message) {
            console.log(dataType + ' failed to save.');
            console.log(status);
            console.log(message);
            return false;
          });
    };
});
