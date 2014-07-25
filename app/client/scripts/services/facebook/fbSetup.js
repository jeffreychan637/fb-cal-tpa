'use strict';
/*global FB:false, console:false */

angular.module('fbCal').factory('fbSetup', function ($log, $window) {

  var fbReady = false;

  var getFbReady = function() {
    return fbReady;
  };

  $window.fbAsyncInit = function() {
    FB.init({
      appId      : '790467867660486',
      xfbml      : true,
      version    : 'v2.0'
    });

    $log.log('done');
    fbReady = true;
    FB.login(function() {
      FB.api('/me', function(response) {
        console.log(response);
        console.log('Successful login for: ' + response.name);
      });
      FB.api('/me/permissions', function(response) {
        console.log(response);
      });
    });
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