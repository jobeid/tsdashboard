/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for publication.js run with Karma.js
*/

'use strict';

define(['tran-sci-cats', 'publication'], function(ts, pub) {
  describe('publication', function() {
    it('properly instantiates ts obj', function() {
      var t = new pub('test', 'test');
      expect(t.ts).toEqual(jasmine.objectContaining({A:0,C:0,H:0}));
    });
  });
});
