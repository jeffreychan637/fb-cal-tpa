'use strict';
/*global $:false, FB:false, console:false */

angular.module('fbCal').factory('fbLogin', function ($log, $window) {

  var checkLoginState = function() {
    FB.getLoginStatus(function(response) {
      loginCallback(response);
    });
  };

  var loginCallback = function(response) {
    console.log('loginCallback');
    console.log(response);
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else {
      login();
    }
  };

  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
    });
    FB.api('/me/permissions', function(response) {
      console.log(response);
    });
  }

  var login = function() {
    FB.login(function(response) {
      console.log(response);
    }, {scope: 'public_profile, email'});
  };


  return {
    checkLoginState: checkLoginState
  };
});