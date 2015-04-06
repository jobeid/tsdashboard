/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for data-parsing.js to be run by karma.ja
*/

'use strict';

var dependencies = [
  'data-parsing'
];

define(dependencies, function(dataParsing) {

  describe('data-parsing', function() {

    it('is defined', function() {
      expect(dataParsing).toBeDefined();
    });
    

  });
});
