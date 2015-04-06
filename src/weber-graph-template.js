
define(['underscore', 'jquery', 'd3'], function() {
  var showName = function(n) {
    var temp = _.template('Hello <%= name %>');
    d3.select('body').html(temp({name: n}));
  };
  return {
    showName: showName
  };
});
