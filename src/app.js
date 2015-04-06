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
    .defer(loadPub, '/dat/musc_csv/pubAuthDat2006.csv')
    .defer(loadMesh, '/dat/musc_csv/pubMeshDat2006.csv')
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
    console.log(app.properties.pubHash);
    app.init();
    app.render();
    finishLoad();
  }

  function finishLoad() {
    queue(1)
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2007.csv')
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2008.csv')
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2009.csv')
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2010.csv')
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2011.csv')
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2012.csv')
      .defer(loadPub, '/dat/musc_csv/pubAuthDat2013.csv')
      .awaitAll(reportOnRequest);

    queue(1)
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2007.csv')
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2008.csv')
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2009.csv')
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2010.csv')
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2011.csv')
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2012.csv')
      .defer(loadMesh, '/dat/musc_csv/pubMeshDat2013.csv')
      .awaitAll(reportOnRequest);


    function reportOnRequest() {
      console.log('Queue has loaded all files...');
    }
  }

});
