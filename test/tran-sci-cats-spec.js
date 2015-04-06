/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for tran-sci-cats.js run with Karma.js
*/

'use strict';

define(['tran-sci-cats'], function(ts) {
  describe('tran-sci-cats', function() {
    it('can instantiate an obj with transci properties', function() {
      expect(new ts()).toEqual(jasmine.objectContaining({A:0,C:0,H:0}));
    });
    it('can add sum itself with an object of same type', function() {
      var o = new ts();
      o.plus({A:2,C:2,H:6});
      expect(o).toEqual(jasmine.objectContaining({A:0.2,C:0.2,H:0.6}));
    });
  });
});
