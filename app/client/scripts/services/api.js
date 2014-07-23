'use strict';

angular.module('fbCal').factory('api', function ($wix, $location) {
  var defaults = {
    title: 'This is my title.',
    description: 'This is my description.',
    view: 'List',
    widgetCorners: '20',
    borderWidth: '5',
    borderColor: 'black'
  };

  var getInstance = function() {
    var url = $location.absUrl();
    var instanceRegexp = /.*instance=([\[\]a-zA-Z0-9\.\-_]*?)(&|$|#).*/g;
    var instance = instanceRegexp.exec(url);
    if (instance && instance[1]) {
      var instanceId = instance[1]; //instanceId is actually the unparsed instance
    } else {
      console.log('All hell has broken loose.');
      //BREAK STUFF! THIS SHOULD NEVER HAPPEN.
      var instanceId;
    }
    return instanceId; //returns the unparsed instance
  };

  var getOrigCompId = $wix.Utils.getOrigCompId;
  var getCompId = $wix.Utils.getCompId;

  return {
    defaults: defaults,
    getInstance: getInstance,
    getOrigCompId: getOrigCompId,
    getCompId: getCompId
  };
});
