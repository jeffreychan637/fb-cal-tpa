'use strict';
/*global $:false, FB:false, console:false */

angular.module('fbCal').factory('modalFbLogin', function ($log, $q) {
  var grantedPermissions = [];

  var checkPermission = function(permission) {
    return grantedPermissions.indexOf(permission) >= 0;
  };

  var checkFirstTime = function() {
    return grantedPermissions === [];
  };

  var checkLoginState = function() {
    var deferred = $q.defer();
    FB.getLoginStatus(function(response) {
      loginCallback(response, deferred);
    }, true);
    return deferred.promise;
  };

  var loginCallback = function(response, deferred) {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      console.log(response);
      checkPermissions(deferred, false);
    } else {
      $log.info('logging in');
      login(deferred);
    }
  };

  var checkPermissions = function(deferred, specificPermission) {
    FB.api('/me/permissions', function(response) {
      console.log(response);
      if (!response || response.error) {
        console.log(response.error, 'error');
        deferred.reject('unknown');
      } else {
        for (var i = 0; i < response.data.length; i++) {
          var permission = response.data[i];
          if (permission.status === 'granted') {
            grantedPermissions.push(permission.permission);
          }
        }
        if (specificPermission) {
          if (checkPermission(specificPermission)) {
            deferred.resolve();
          } else {
            deferred.reject('denied permission');
          }
        } else {
          deferred.resolve();
        }
      }
    });
  };

  var login = function(deferred) {
    FB.login(function(response) {
      if (!response.error) {
        if (response.status === 'connected') {
          console.log('login successful');
          checkPermissions(deferred, false);
        } else if (response.status === 'not_authorized') {
          console.log('login declined');
          //show you must authorize to use this app message
          deferred.reject('declined');
        } else {
          //tell user that they have to be logged into facebook to authorize app
          deferred.reject('not logged in');
        }
      } else {
        //show something went wrong message
        deferred.reject('unknown');
      }
    }, {scope: 'public_profile, publish_actions, rsvp_event'});
  };

  var loginWithPermission = function(permission) {
    var deferred = $q.defer();
    FB.login(function(response) {
      if (!response.error) {
        if (response.status === 'connected') {
          console.log('login successful');
          checkPermissions(deferred, permission);
        } else if (response.status === 'not_authorized') {
          console.log('login declined');
          //show you must authorize to use this app message
          deferred.reject('declined');
        } else {
          //tell user that they have to be logged into facebook to authorize app
          deferred.reject('not logged in');
        }
      } else {
        //show something went wrong message
        deferred.reject('unknown');
      }
    }, {scope: permission});
  };

  return {
    checkLoginState: checkLoginState,
    checkPermission: checkPermission,
    checkFirstTime: checkFirstTime,
    loginWithPermission: loginWithPermission
  };
});