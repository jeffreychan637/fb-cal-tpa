'use strict';

angular.module('fbCal').factory('api', function ($wix, $location) {
  var defaults = {
    title: 'This is my title.',
    description: 'This is my description.',
    addButtonText: '+ Add Files',
    yourNameText: 'Your name',
    emailAddressText: 'Your email address',
    messageText: 'You can add a message to site owner',
    submitButtonText: 'Submit',
    widgetCorners: '20',
    borderWidth: '1',
    buttonCorners: '20'
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

  var getOrigCompId = 2;//$wix.Utils.getOrigCompId;
  var getCompId = 2;///$wix.Utils.getCompId;

  return {
    defaults: defaults,
    getInstance: getInstance,
    getOrigCompId: getOrigCompId,
    getCompId: getCompId
  };
});
