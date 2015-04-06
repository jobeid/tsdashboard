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
  }
});
