'use strict';
/*global $:false, FB:false, console:false */

angular.module('fbCal').factory('fbLogin', function ($log, $q, server) {

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
      testAPI(deferred);
    } else {
      $log.info('logging in');
      login(deferred);
    }
  };

  var testAPI = function(deferred, accessToken) {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log(response);
      if (!response || response.error) {
        console.log(response, 'response');
        console.log(response.error, 'error');
        $log.log('rejected');
        deferred.reject('unknown');
      } else {
        checkPermissions(deferred, response.name, accessToken);
      }
    });
  };

  var checkPermissions = function(deferred, name, accessToken) {
    FB.api('/me/permissions', function(response) {
      console.log(response);
      if (!response || response.error) {
        console.log(response.error, 'error');
        deferred.reject('unknown');
      } else {
        var permissionGranted;
        for (var i = 0; i < response.data.length; i++) {
          var permission = response.data[i];
          if (permission.permission === 'user_events' && permission.status === 'granted') {
            permissionGranted = true;
            server.saveData({access_token: accessToken}, "access token")
              .then(function() {
                  deferred.resolve(name);
                }, function() {
                  logout()['finally'](function() {
                  deferred.reject('unknown');
                });
              });
            break;
          }
        }
        if (!permissionGranted) {
          logout().then(function() {
            deferred.reject('denied');
          }, function() {
            deferred.reject('unknown');
          });
        }
      }
    });
  };

  var login = function(deferred) {
    FB.login(function(response) {
      if (!response.error) {
        if (response.status === 'connected') {
          console.log('login successful');
          testAPI(deferred, response.authResponse.accessToken);
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
    }, {scope: 'public_profile, user_events'});
  };

  var logout = function() {
    var deferred = $q.defer();
    FB.api('/me/permissions', 'DELETE', function(response) {
      if (response && !response.error) {
        $log.info('logged out successful');
        //change back to connect account pane in settings
        deferred.resolve();
      } else if (response.error && response.error.type === 'OAuthException') {
        deferred.reject('login');
      } else {
        deferred.reject('unknown');
      }
    });
    return deferred.promise;
  };

  return {
    checkLoginState: checkLoginState,
    logout: logout,
  };
});