'use strict';
/*global FB:false, console:false */

angular.module('fbCal').factory('fbSetup', function ($log, $window, server, $rootScope) {

  var fbReady = false;

  var validHosts = ['editor.wix.com', 'localhost'];

  var  checkValidHost = function(currentHost) {
   return validHosts.indexOf(currentHost) > 0;
  };

  var getFbReady = function() {
    console.log(fbReady);
    return fbReady;
  };

  $window.fbAsyncInit = function() {
    FB.init({
      appId      : '790467867660486',
      xfbml      : true,
      version    : 'v2.0'
    });

    FB.getLoginStatus(function(response) {
      fbReady = true;
      $rootScope.$apply();
      if (response && !response.error && response.status === 'connected' &&
          checkValidHost($window.location.hostname)) {
        server.saveData({access_token: response.authResponse.accessToken}, "access token");
      }
    });

    $log.log('done');
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