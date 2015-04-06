/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for ui-objects.js to be run by karma.js
*/

'use strict';

var dependencies = [
  'ui-objects'
];

define(dependencies, function(UiObjects) {

  describe('ui-objects', function() {
    it('is not null', function() {
      expect(new UiObjects()).toBeDefined();
    });
  });
});
