'use strict';

angular.module('fbCal').factory('api', function ($wix, $location, $log) {
  var defaults = {
    title: 'This is my title.',
    description: 'This is my description.',
    view: 'List',
    commenting: true,
    moderating: false,
    hostedBy: true,
    corners: '25',
    borderWidth: '5',
  };

  var getInstance = function() {
    var instanceId;
    var url = $location.absUrl();
    var instanceRegexp = /.*instance=([\[\]a-zA-Z0-9\.\-_]*?)(&|$|#).*/g;
    var instance = instanceRegexp.exec(url);
    if (instance && instance[1]) {
      instanceId = instance[1]; //instanceId is actually the unparsed instance
    } else {
      $log.error('Getting Instance ID failed');
      //BREAK STUFF! THIS SHOULD NEVER HAPPEN.
      //Probably in a hacker situation - disable functions and display error message
      //display none the entire app
    }
    return instanceId; //returns the unparsed instance
  };

  return {
    defaults: defaults,
    getInstance: getInstance
  };
});
