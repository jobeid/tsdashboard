/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for vectorize.js to be run with Karma.js
*/

'use strict';

define(['vectorize'], function(vectorize) {
  describe('vectorize', function() {
    it('can sum vectors of equal magnitude', function() {
      expect(vectorize({A:3000,C:3000,H:3000})).toEqual({x:0,y:0});
    });
    it('can correctly calculate the endpoint of the A vector', function() {
      expect(vectorize({A:3000,C:0,H:0})).toEqual({x:-2598,y:1500});
    });
    it('can correctly calculate the endpoint of the C vector', function() {
      expect(vectorize({A:0,C:3000,H:0})).toEqual({x:0,y:-3000});
    });
    it('can correctly calculate the endpoint of the H vector', function() {
      expect(vectorize({A:0,C:0,H:3000})).toEqual({x:2598,y:1500});
    });
  });
});
