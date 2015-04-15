/*
* 4/10/2015
* Tom Evans
* Generates a map of nodal distance for the given partition over the
* entire period of data.  Once the map is fully generated it is used to
* generate the specific +/- changes for each translational science category,
* for each year.
*/

'use strict';

var dependencies = [
  'd3' // for d3 mapping functions
];

define(dependencies, function(d3) {
  var map = {},
  hash = {},
  poles = {
    C: {x:0,y:-3000},
    H: {x:2600,y:1500},
    A: {x:-2600,y:1500}
  };

  function distanceFormula(c1, c2) {
    return Math.sqrt(Math.pow((c2.y - c1.y), 2) + Math.pow((c2.x - c1.x), 2));
  };

  function triangulate(entry, point) {
    entry.A = distanceFormula(poles.A, point);
    entry.C = distanceFormula(poles.C, point);
    entry.H = distanceFormula(poles.H, point);
  };

  function check(pre, post) {
    var c = pre - post;
    if (c > 0) {
      return 'pos';
    }
    if (c < 0) {
      return 'neg';
    }
    return 'zero';
  };

  return {
    hash: null,
    addData: function(year, nodes, callback) {
      if (!hash[year]) {
        hash[year] = {nCt:0,A:{pos:0,neg:0,zero:0},C:{pos:0,neg:0,zero:0},H:{pos:0,neg:0,zero:0}};
      }
      hash[year].nCt = nodes.length;

      nodes.forEach(function(node) {
        var id = node.data.pid || node.data.name;
        if (!map[id]) { // node exists in map then update
          map[id] = {};
        }
        map[id][year] = {'A':0,'C':0,'H':0};
        triangulate(map[id][year], node.coors);
      });

      if (callback) {
        return callback();
      }
    },
    aggregate: function() {
      var data = {A:[],C:[],H:[]};

      for (var entry in map) {
        if (map.hasOwnProperty(entry)) {
          for (var i = 2007; i < 2014; i++) {
            var pre = 2006, post = i.toFixed();
            if (map[entry][pre] && map[entry][post]) {

              hash[post].A[check(map[entry][pre].A, map[entry][post].A)] += 1;
              hash[post].H[check(map[entry][pre].H, map[entry][post].H)] += 1;
              hash[post].C[check(map[entry][pre].C, map[entry][post].C)] += 1;
            }
          }
        }
      }

      d3.map(hash).forEach(function(year) {
        d3.map(hash[year]).forEach(function(cat) {

          if (cat != 'nCt') {
            hash[year][cat].pos = Number((hash[year][cat].pos / hash[year].nCt).toFixed(2));
            hash[year][cat].neg = -1 * Number((hash[year][cat].neg / hash[year].nCt).toFixed(2));
          }

        });
      });

      d3.map(hash).entries().forEach(function(year) {
        data.A.push({year:year.key, posDelta:year.value.A.pos, negDelta:year.value.A.neg});
        data.C.push({year:year.key, posDelta:year.value.C.pos, negDelta:year.value.C.neg});
        data.H.push({year:year.key, posDelta:year.value.H.pos, negDelta:year.value.H.neg});
      });

      return data;
    },
    clear: function() {
      map = {};
      hash = {};
    }
  }
});
