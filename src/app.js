/*
* 3/24/3015
* Tom Evans
*
*
*/

'use strict';

var dependencies = [
  'queue',
  'd3',
  'ui-objects'
];

require(dependencies, function(queue, d3, ui) {
  var app = new ui();

  queue(1)
    .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2006.csv')
    .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2006alpha.csv')
    .awaitAll(initialize);

  function loadPub(file, callback) {
    d3.csv(file, function(error, csv) {
      if(error) {
        console.log(error);
        callback(error, false);
      }
      if(app.properties.pubHash.loadPublications(csv)) {
        callback(null, true);
      }
    });
  };

  function loadMesh(file, callback) {
    d3.csv(file, function(error, csv) {
      if(error) {
        console.log(error);
        callback(error, false);
      }
      if(app.properties.pubHash.loadMesh(csv)) {
        callback(null, true);
      }
    });
  };

  function initialize() {
    app.init();
    app.fetchData();
    app.render();
    finishLoad();
  }

  function finishLoad() {
    queue(1)
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2007.csv')
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2008.csv')
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2009.csv')
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2010.csv')
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2011.csv')
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2012.csv')
      .defer(loadPub, './dat/musc_csv/auth/pubAuthDat2013.csv')
      .awaitAll(reportOnRequest);

    queue(1)
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2007alpha.csv')
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2008alpha.csv')
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2009alpha.csv')
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2010alpha.csv')
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2011alpha.csv')
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2012alpha.csv')
      .defer(loadMesh, './dat/musc_csv/mesh/pubMeshDat2013alpha.csv')
      .awaitAll(reportFinal);


    function reportOnRequest() {
      console.log('Queue has loaded all author files...');
    };

    function reportFinal() {
      console.log('Queue has loaded all mesh files, file loading complete...');
      //app.calcTrendData(app.showTrends);
      app.renderHeatMap();
    }
  }

});
