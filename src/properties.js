/*
* 3/25/2015
* Tom Evans
* properties object encapsulating app state
*/

'use strict';

var dependencies = [
  'd3',
  'pub-hash',
  'dept-data'
];

define(dependencies, function(d3, PubHash, deptData) {
  var properties = {
    pubHash: new PubHash(),
    deptData: deptData,
    data: [],
    svg: null,
    graph: null,
    dhm: null, // dynamic heat map
    shm: null, // static heat map
    trendData: null,
    aTrend: null,
    hTrend: null,
    cTrend: null,
    transition: null,
    transform: null,
    height: 600, // this will need to be dynamically updated
    width: 600, // '' '' '' '' '' ''
    xOffset: 600 / 2, // obsolete?
    yOffset: 600 / 2, // obsolete?
    cohort: {min:0,max:1,data:null},
    nodeSize: 'Degree',
    nodeColor: 'Trans Science',
    edgeColor: 'Connection Density',
    // marker: { // obsolete?
    //   id: 'arrow',
    //   classString: 'arrow',
    //   width: 6,
    //   height: 6,
    //   rX: 20,
    //   rY: 0,
    //   view: '0 -5 10 10'
    // },
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
    // Authors: true,
    // Departments: false,
    Trails: false,
    range: {
      lo: 2006,
      hi: 2006
    },
    mesh: [],
    nodeFilter: [],
    filter: {mesh:[],node:[]},
    previous: {}
  };

  return properties;
});
