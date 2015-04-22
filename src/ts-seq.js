/*
* 4/8/2015
* Tom Evans
* Translational Science Sequence containing a hash tabled keyed
* by year with aggregate fields for each TS cat denoting the sum
* distance of each node in the dataset from that TS pole.  Contains
* helper functions for aggregating the values and generating the
* % change values for each cat compared to the previous year.
*/

'use strict';

define(function() {
  var poles = {
    C: {x:0,y:-3000},
    H: {x:2600,y:1500},
    A: {x:-2600,y:1500}
  };

  function distanceFormula(c1, c2) {
    return Math.sqrt(Math.pow((c2.y - c1.y), 2) + Math.pow((c2.x - c1.x), 2));
  };


  return function() {
    this.hash = {
      2006: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2007: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2008: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2009: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2010: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2011: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2012: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0},
      2013: {A:0,C:0,H:0,Ac:0,Cc:0,Hc:0}
    };

    this.aggregate = function(year, data) {
      var that = this;
      data.forEach(function(datum) {
        for (var cat in poles) {
          if (poles.hasOwnProperty(cat)) {
            that.hash[year][cat] += Number((distanceFormula(datum.coors, poles[cat])).toFixed());
          }
        }
      });
    };

    this.aggregateChange = function() {
      var that = this;
      for (var i = 2007; i < 2014; i++) {
        that.percentChange('2006', (i).toFixed());
      }
    };

    this.percentChange = function(pre, post) {
      var that = this;
      for (var cat in poles) {
        if (poles.hasOwnProperty(cat)) {
          var t = ((that.hash[pre][cat] - that.hash[post][cat]) / that.hash[pre][cat]) * -100;
          that.hash[post][cat+'c'] = Number(t.toFixed(2));
        }
      }
    };

    this.get = function() {
      var that = this,
      data = {A:[],C:[],H:[]};

      for (var year in this.hash) {
        if (this.hash.hasOwnProperty(year)) {
          data.A.push({year:year,delta:that.hash[year].Ac});
          data.C.push({year:year,delta:that.hash[year].Cc});
          data.H.push({year:year,delta:that.hash[year].Hc});
        }
      }

      return data;
    };

  }
});
