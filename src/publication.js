/*
* 3/24/2015
* Tom Evans
* Defines the properties of a publication entity
*/

'use strict';

define(['tran-sci-cats'], function(transci) {
  return function(pmid, year) {
		this.pmid = pmid,
		this.year = year,
		this.mesh = [],
		this.meshNums = [],
		this.ts = new transci(),
		this.primeAuthor = {},
		this.secAuthor = {};
  }
});
