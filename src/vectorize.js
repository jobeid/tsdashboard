/*
* 3/24/2015
* Tom Evans
* Given an object := datum defined as {A:number,H:number,C:number} where
* each property is a vector magnitude, vectorization will calculate the
* vector sum and return the coordinates of the ENDPOINT FROM (0,0).
*
* note: the direction of each endpoint is assumed as per the Weber
* translational triangle maping scheme.
*    C: due north  A: SW  H: SE
*
*/

'use strict';
define([], function() {
  var RADIANS = 0.523598776; // ratio deg to rads

  var vectorize = function(datum) {
    var vectors = [],
			coor = {x:0,y:0};
		vectors.push(getVectorA(datum.A));
		vectors.push(getVectorH(datum.H));
		vectors.push(getVectorC(datum.C));
		vectors.forEach(function(vector) {
			coor.x += vector[0];
			coor.y += vector[1];
		});
		coor.x = Number((coor.x).toFixed());
		coor.y = Number((coor.y).toFixed());
		return coor;
  };

  var getVectorA = function(val) {
		var aX = null, aY = null;
		aY = Math.sin(RADIANS) * val;
		aX = Math.sqrt(Math.pow(val,2) - Math.pow(aY,2));
		return [(-1 * aX),aY];
	};

	var getVectorH = function(val) {
		var aX = null, aY = null;
		aY = Math.sin(RADIANS) * val;
		aX = Math.sqrt(Math.pow(val,2) - Math.pow(aY,2));
		return [aX,aY];
	};

	var getVectorC = function(val) {
		return [0,(-1 * val)];
	};

  return vectorize;
});
