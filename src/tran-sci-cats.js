/*
* 3/24/2015
* Tom Evans
* encapsulates and entity's translational science categories
* as per the Weber method.
* internal plus method for easily aggregating TS values
*/

'use strict';

define(function() {
  return function() {
    this.A = 0.0;
    this.C = 0.0;
    this.H = 0.0;
    this.plus = function(ts) {
      // converts the publications ts values to ratios
      // before aggregating on this ts object
      this.sum = ts.A + ts.C + ts.H;
      if (this.sum != 0) {
        this.A += (ts.A / this.sum);
        this.C += (ts.C / this.sum);
        this.H += (ts.H / this.sum);
      }
    };
  }
});
