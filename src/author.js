/*
* 3/24/2014
* Tom Evans
* Defines the properties of the author entity
*/

'use strict';
define(function() {
  return function(name, pid) {
    this.name = name;
    this.pid = pid;
    this.yearsInAuthorship = {};
    this.isEveryYear = function() {
      for (var i = 2006; i < 2014; i++) {
        if (!this.yearsInAuthorship.hasOwnProperty(i.toFixed())) {
          return false;
        }
      }
      return true;
    }
  }
});
