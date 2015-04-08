/*
* 3/25/2015
* Tom Evans
* properties object encapsulating app state
*/

'use strict';

var dependencies = [
  'd3',
  'pub-hash'
];

define(dependencies, function(d3, PubHash) {
  var properties = {
    pubHash: new PubHash(),
    svg: null,
    graph: null,
    transition: null,
    transform: null,
    height: 600, // this will need to be dynamically updated
    width: window.innerWidth * 0.9, // '' '' '' '' '' ''
    xOffset: 600 / 2, // obsolete?
    yOffset: 600 / 2, // obsolete?
    nRad: 15, // obsolete?
    nodeSize: 'Degree',
    nodeColor: 'Trans Science',
    marker: { // obsolete?
      id: 'arrow',
      classString: 'arrow',
      width: 6,
      height: 6,
      rX: 20,
      rY: 0,
      view: '0 -5 10 10'
    },
    margin: {
      top: 40,
      bottom: 40,
      left: 60,
      right: 40
    },
    showEdges: false,
    showOverlay: false,
    weber: true,
    interval: null,
    Authors: true,
    Departments: false,
    Trails: false,
    xAxis: 'Human',
    yAxis: 'Animal & Cell',
    range: {
      lo: 2006,
      hi: 2006
    },
    mesh: [],
    nodeFilter: [],
    previous: []
  };

  return properties;
});
