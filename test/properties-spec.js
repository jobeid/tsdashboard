/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for properties.js to be run by karma.js
*/

'use strict';

var dependencies = [
  'properties'
];

define(dependencies, function(properties) {

  describe('properties', function() {
    var fields = [
      'pubHash',
      'svg',
      'graph',
      'transition',
      'height',
      'width',
      'xOffset',
      'yOffset',
      'nodeSize',
      'nodeColor',
      'marker',
      'showEdges',
      'showOverlay',
      'interval',
      'Authors',
      'Departments',
      'Trails',
      'range',
      'mesh',
      'nodeFilter',
      'previous'
    ];

    it('is defined', function() {
      expect(properties).toBeDefined();
    });

    fields.forEach(function(field) {
      it('should have own property: ' + field, function() {
        expect(properties.hasOwnProperty(field)).toEqual(true);
      });
    });
  });
});
