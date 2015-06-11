/*
* 6/8/2015
* Tom Evans
* node class for encapsulation of author data in d3 friendly node object.
*
*/

'use strict';

var dependencies = [
  'd3',
  'vectorize',
  'tran-sci-cats'
];

define(dependencies, function(d3, vectorize, ts) {
  return function (auth) {
    this.data = auth;
    this.ts = new ts();
    this.inDegree = 1;
    this.outDegree = 1;
    this.pubCt = 0;
    this.coors = {x:0,y:0};
    this.pmids = [];
    this.mesh = [];

    this.isActive = function(filter) {
      var m = true,
        n = true,
        f = false,
        that = this;

      if (filter.mesh.length > 0) {
        // if at least one mesh term matches the filter
        filter.mesh.forEach(function(term) {
          if (that.mesh.indexOf(term.text) != -1) {
            f = true;
          }
        });
        m = f;
      }
      if (filter.node.length > 0) {
        n = filter.node.filter(function(d) {

          return d.text == that.data.dept;

        }).length == 1;
      }

      return m && n;
    };

    this.genCoordinates = function(maxRange) {
      var scale = d3.scale.linear()
        .domain([0,1])
        .range([0, maxRange]),
        t = {},
        sum = this.pubCt;

        if (sum != 0) {
          this.ts.A = Number((this.ts.A / sum).toFixed(4));
          this.ts.H = Number((this.ts.H / sum).toFixed(4));
          this.ts.C = Number((this.ts.C / sum).toFixed(4));
        }

        t.A = scale(this.ts.A);
        t.H = scale(this.ts.H);
        t.C = scale(this.ts.C);

        this.coors = vectorize(t);
    };
  };
});
