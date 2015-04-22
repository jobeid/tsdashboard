/*
* 4/9/2015
* Tom Evans
*
*/

'use strict';

var dependencies = [
  'd3'
];

define(dependencies, function(d3) {
  var baseLine = [
    {year:2006, delta:0},
    {year:2007, delta:0},
    {year:2008, delta:0},
    {year:2009, delta:0},
    {year:2010, delta:0},
    {year:2011, delta:0},
    {year:2012, delta:0},
    {year:2013, delta:0}
  ]


  function TrendChart(category, data) {
    var graph = this;
    graph.data = data || {};

    //console.log(data);

    var properties = graph.properties = {height:450, width:d3.select('.'+category+'-trend-chart')[0][0].clientWidth};
    graph.vis = d3.select('.'+category+'-trend-chart').append('svg')
      .attr('width', properties.width)
      .attr('height', properties.height)
      .append('g')
      .attr('transform', 'translate(75,50)scale(0.8)');

    graph.tooltip = d3.select('.trend-chart')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);


    graph.x = d3.scale.linear()
      .domain([2006, 2013])
      .range([0, properties.width]);

    graph.y = d3.scale.linear()
      .domain([-0.75,0.75])
      .range([properties.height, 0]);

    graph.xAxis = d3.svg.axis()
      .scale(graph.x)
      .orient(['bottom'])
      .tickFormat(d3.format(''));

    graph.yAxis = d3.svg.axis()
      .scale(graph.y)
      .orient('left')
      .tickFormat(d3.format('+%'));


    graph.line = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return graph.x(d.year); })
      .y(function(d) { return graph.y(d.delta); });

    graph.areaPos = d3.svg.area()
      .interpolate('basis')
      .x(function(d) { return graph.x(d.year); })
      .y0(function(d) { return graph.y(0); })
      .y1(function(d) { return graph.y(d.posDelta); });

    graph.areaNeg = d3.svg.area()
      .interpolate('basis')
      .x(function(d) { return graph.x(d.year); })
      .y0(function(d) { return graph.y(d.negDelta); })
      .y1(function(d) { return graph.y(0); });

    graph.vis.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ properties.height + ')')
      .call(graph.xAxis)
      .append('text')
      .attr('y', 45)
      .attr('x', (properties.width/2))
      .style('text-anchor', 'middle')
      .text('Time ->')
      .attr('class', 'trend-label');

    graph.vis.append('g')
      .attr('class', 'y axis')
      .call(graph.yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -75)
      .attr('x', (-1 * (properties.height/2)))
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text('Relative Nodal Movement')
      .attr('class', 'trend-label');

    graph.vis
      .append('g')
      .append('path')
      .datum(baseLine)
      .attr('d', graph.line)
      .attr('class', 'trend baseline');


    graph.vis
      .append('g')
      .append('path')
      .datum(data)
      .attr('d', graph.areaPos)
      .attr('class', 'trend '+category+' pos');

    graph.vis
      .append('g')
      .append('path')
      .datum(data)
      .attr('d', graph.areaNeg)
      .attr('class', 'trend '+category+' neg');

  };

  TrendChart.prototype.updateData = function(raw) {
    var graph = this;

    graph.data.splice(0, graph.data.length);
    raw.forEach(function(d) {
      graph.data.push(d);
    });

  };

  TrendChart.prototype.propogateUpdate = function() {
    var graph = this;

    graph.vis.selectAll('.pos')
      .datum(graph.data, function(d) { return d.year; })
      .transition()
      .duration(250)
      .attr('d', graph.areaPos);

    graph.vis.selectAll('.neg')
      .datum(graph.data, function(d) { return d.year; })
      .transition()
      .duration(250)
      .attr('d', graph.areaNeg);
  };

  TrendChart.prototype.resizeChart = function() {

  };

  // TrendChart.prototype.showTooltip = function(d) {
  //   var graph = this;
  //
  //   graph.tooltip.transition()
  //     .duration(200)
  //     .style('opacity', 0.8);
  //
  //   graph.tooltip.html('Im a tooltip!')
  //     .attr('width', (15 + 20)+'px')
  //     .style('left', d3.event.pageX + 'px')
  //     .style('top', cdd3.event.pageY + 'px');
  // };

  TrendChart.prototype.hideToolTip = function() {
    this.tooltip.transition().duration(300).style('opacity', 0);
  };


  return TrendChart;
});
