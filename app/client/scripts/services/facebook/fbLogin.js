'use strict';
/*global $:false, FB:false, console:false */

angular.module('fbCal').factory('fbLogin', function ($log, $window, $q) {

  var checkLoginState = function() {
    var deferred = $q.defer();
    FB.getLoginStatus(function(response) {
      loginCallback(response, deferred);
    });
    return deferred.promise;
  };

  var loginCallback = function(response, deferred) {
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      console.log(response);
      testAPI(deferred);
    } else {
      login(deferred);
    }
  };

  var testAPI = function(deferred) {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      if (!response || response.error) {
        $log.log('rejected');
        deferred.reject('');
      } else {
        $log.log('resolved');
        deferred.resolve();
      }
    });
    // setTimeout(function() {
    //   logout();
    //   FB.api('/me/permissions', function(response) {
    //   console.log(response);
    //   FB.api('/me/permissions', 'DELETE', function(response) {
    //     console.log(response);
    //   if (response && !response.error) {
    //     $log.info('logged out successful');
    //     //change back to connect account pane in settings
    //     return deferred.resolve();
    //   } else {
    //     return deferred.reject('unknown');
    //     //something wrong happened.
    //   }
    // });
    //   });
    // }, 1000);
    deferred.resolve();
  };

  var login = function(deferred) {
    FB.login(function(response) {
      if (!response.error) {
        if (response.status === 'connected') {
          console.log('login successful');
          deferred.resolve();
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
    }, {scope: 'public_profile, email'});
  };

  var logout = function() {
    var deferred = $q.defer();
    FB.api('/me/permissions', 'DELETE', function(response) {
      if (response && !response.error) {
        $log.info('logged out successful');
        //change back to connect account pane in settings
        deferred.resolve();
      } else {
        deferred.reject('unknown');
        //something wrong happened.
      }
    });
    return deferred.promise;
  };

  return {
    checkLoginState: checkLoginState,
    logout: logout,
  };
});