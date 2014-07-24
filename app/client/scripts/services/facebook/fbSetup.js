'use strict';

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
    console.log(fbReady);
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