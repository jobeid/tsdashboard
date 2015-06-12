/*
* 6/12/2015
* Tom Evans
*
*
*/

'use strict';

var dependencies = [];

define(dependencies, function() {
  return function(s, t) {
    this.source = s;
    this.target = t;
    this.conn = [];

    this.isActive = function(filter) {
      return true;
    };

    this.getVal = function() {
      return this.conn.length;
    };
  }
});
