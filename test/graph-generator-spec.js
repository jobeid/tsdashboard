/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for graph-generator.js to be run by karma.js
*/

'use strict';

var dependencies = [
  'graph-generator'
];

define(dependencies, function(GraphGenerator) {

  describe('graph-generator', function() {
    var graph;

    // beforeAll(function() {
    //   graph = new GraphGenerator([],null)
    // });

    xit('is defined', function() {
      expect(graph).toBeDefined();
    });

  });
});
