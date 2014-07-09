'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
   beforeEach(module('fbCal'));


  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl1 = $controller('WidgetCtrl', { $scope: {} });
    expect(myCtrl1).toBeDefined();
  }));

  // it('should ....', inject(function($controller) {
  //   //spec body
  //   var myCtrl2 = $controller('MyCtrl2', { $scope: {} });
  //   expect(myCtrl2).toBeDefined();
  // }));
});
