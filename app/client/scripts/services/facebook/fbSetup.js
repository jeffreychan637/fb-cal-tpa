'use strict';
/*global FB:false, console:false */

angular.module('fbCal').factory('fbSetup', function ($log, $window, server) {

  var fbReady = false;

  var validHosts = ['editor.wix.com', 'localhost'];

  var  checkValidHost = function(currentHost) {
   return validHosts.indexOf(currentHost) > 0;
  };

  var getFbReady = function() {
    return fbReady;
  };

  $window.fbAsyncInit = function() {
    FB.init({
      appId      : '790467867660486',
      xfbml      : true,
      version    : 'v2.0',
      status     : true
    });

    var auth_response_change_callback = function(response) {
      if (response && !response.error && response.status === 'connected' &&
          checkValidHost($window.location.hostname)) {
        server.saveData({access_token: response.authResponse.accessToken}, "access token");
      }
    };

    FB.Event.subscribe('auth.authResponseChange', auth_response_change_callback);

    $log.log('done');
    fbReady = true;
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));


  return {
    getFbReady: getFbReady
  };
});