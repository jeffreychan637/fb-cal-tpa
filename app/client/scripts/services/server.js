'use strict';
/*global $:false, FB:false, console:false, jQuery:false */

angular.module('fbCal').factory('server', function ($log, $http, $wix, api, $window, $q) {
  
  /**
   * IN PRODUCTION MODE, CHANGE HEADER URLS TO $window.location.hostname INSTEAD
   * OF editor.wix.com
   */
  
  var compId = $wix.Utils.getCompId(); //get orig comp id?;
  var instance = api.getInstance();

  compId = 45;
  instance = 47;

  
  var getSettingsWidgetURL = '/GetSettingsWidget/' + compId;
  var getSettingsSettingsURL = '/GetSettingsSettings/' + compId;
  var getAllEventsURL = '/GetAllEvents/' + compId;
  var getModalEventURL = '/GetModalEvent/' + compId;
  var saveSettingsURL = '/SaveSettings/' + compId;
  var saveAccessTokenURL = '/SaveAccessToken/' + compId;
  var logoutURL = '/Logout/' + compId;

  var defaultSettingsWidget = {settings : api.defaults,
                               fb_event_data : [], active : true};
  var defaultSettingsSettings = {settings : api.defaults, events : [],
                                 active : true, name: "", user_id: ""};

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

  var getHeader = function(from) {
    if (from === 'widget') {
      return {'X-Wix-Instance' : instance};
    } else {
      return {'X-Wix-Instance' : instance, 'URL' : 'editor.wix.com'};
    }
  };

  /**
   * This function makes a call to the backend database to get the
   * latest user settings. It's called whenever the widget or settings panal
   * is first loaded. On errors, the default settings are loaded.
   */
  var getUserInfo = function(from) {
    var deferred = $q.defer();
    $http({
           method: 'GET',
           url: getURL('get', from),
           headers: getHeader(from),
           timeout: 15000
          }).success(function (data, status) {
            if (status === 200) {
              var response = jQuery.parseJSON(jQuery.parseJSON(data));
              if (!response.settings) {
                response.settings = api.defaults;
              }
              if (from === 'settings' && !response.events) {
                response.events = [];
              }
              if (from === 'widget' && !response.fb_event_data) {
                response.fb_event_data = [];
              }
              deferred.resolve(response);
              console.debug("Got Settings for " + from);
            } else {
              console.log('The server is returning an incorrect status.');
              deferred.reject(getDefault(from));
              //i don't really know what the fb_event_data looks like
            }
          }).error(function (message, status) {
            // console.warn(status, message);
            deferred.reject(getDefault(from));
          });
    return deferred.promise;
  };

  var getAllEvents = function() {
    var deferred = $q.defer();
    $http({
           method: 'GET',
           url: getAllEventsURL,
           headers: getHeader('settings'),
           timeout: 15000
          }).success(function (data, status) {
            console.log(status, data);
            if (status === 200) {
              console.log(data); 
              deferred.resolve(jQuery.parseJSON(jQuery.parseJSON(data)));
            } else {
              console.log('The server is returning an incorrect status.');
              deferred.reject();
              //i don't really know what the fb_event_data looks like
            }
          }).error(function (message, status) {
            console.warn(status, message);
            deferred.reject();
          });
    return deferred.promise;
  };

  var getModalEvent = function(eventId, desiredData) {
    var modalHeader = {'X-Wix-Instance' : instance, 
                       'event_id' : eventId.toString(),
                       'desired_data' : desiredData};
    var deferred = $q.defer();
    $http({
           method: 'GET',
           url: getModalEventURL,
           headers: modalHeader,
           timeout: 15000
          }).success(function (data, status) {
            if (status === 200) {
              var response = jQuery.parseJSON(jQuery.parseJSON(data));
              if (!response.settings) {
                response.settings = api.defaults;
              }
              deferred.resolve(response);
            } else {
              console.log('The server is returning an incorrect status.');
              deferred.reject();
              //i don't really know what the fb_event_data looks like
            }
          }).error(function (message, status) {
            console.error(status, message);
            deferred.reject();
          });
    return deferred.promise;
  };

  var saveData = function(data, dataType) {
    var deferred = $q.defer();
    $http({
            method: 'PUT',
            url: getURL('post', dataType),
            headers: {'X-Wix-Instance' : instance, 'URL' : 'editor.wix.com'},
            timeout: 10000,
            data: data
          }).success(function (message, status) {
            if (status === 200) {
              console.debug(dataType + ' saved successfully.');
              deferred.resolve();
            } else {
              console.log('The server is returning an incorrect status.');
              deferred.reject();
            }
          }).error(function (message, status) {
            console.log(dataType + ' failed to save.');
            console.log(status);
            console.log(message);
            deferred.reject();
          });
    return deferred.promise;
  };

  var logout = function() {
    var deferred = $q.defer();
    $http({
            method: 'PUT',
            url: logoutURL,
            headers: {'X-Wix-Instance' : instance, 'URL' : 'editor.wix.com'},
            timeout: 10000,
            data: {}
          }).success(function (message, status) {
            console.log(status, message);
            if (status === 200) {
              console.log('Logged out successfully.');
              deferred.resolve();
            } else {
              console.log('The server is returning an incorrect status.');
              deferred.resolve();
            }
          }).error(function (message, status) {
            console.log('Failed to logout.');
            console.log(status);
            console.log(message);
            deferred.reject();
          });
      return deferred.promise;
  };

  return {
    getUserInfo: getUserInfo,
    getAllEvents: getAllEvents,
    getModalEvent: getModalEvent,
    saveData: saveData,
    logout: logout
  };
});
