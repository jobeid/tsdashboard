/*
* 3.25.2015
* Tom Evans
* Jasmine unit tests for department-data.js run by Karma.js
*/

'use strict';

define(['d3','dept-data'], function(d3, deptData) {
  describe('deptData', function() {
    it('has loaded the institutions hash', function() {
      var t = d3.map(deptData.institutions).values().length;
      expect(t).toBeGreaterThan(0);
    });
    it('has loaded the personel hash', function() {
      var t = d3.map(deptData.personel).values().length;
      expect(t).toBeGreaterThan(0);
    });
    it('has loaded the departments hash', function() {
      var t = d3.map(deptData.departments).values().length;
      expect(t).toBeGreaterThan(0);
    });
  });
});
