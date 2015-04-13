/*
* 4/9/2015
* Tom Evans
* Generates a time sequence line chart showing the translational
* science category trends as a function of Weber's algorithim for
* grouping publications.
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


  function TrendChart(data) {
    var graph = this;
    graph.data = data || {};

    var properties = graph.properties = {height:450, width:d3.select('.trend-chart')[0][0].clientWidth};
    graph.vis = d3.select('.trend-chart').append('svg')
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
      .domain([-40,40])
      .range([properties.height, 0]);

    graph.xAxis = d3.svg.axis()
      .scale(graph.x)
      .orient(['bottom']);

    graph.yAxis = d3.svg.axis()
      .scale(graph.y)
      .orient('left');

    graph.line = d3.svg.line()
      .interpolate('basis')
      .x(function(d) { return graph.x(d.year); })
      .y(function(d) { return graph.y(d.delta); });

    graph.vis.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ properties.height + ')')
      .call(graph.xAxis)
      .append('text')
      .attr('y', properties.height/2)
      .attr('x', (properties.width/2))
      .style('text-anchor', 'middle')
      .text('Time ->');

    graph.vis.append('g')
      .attr('class', 'y axis')
      .call(graph.yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('% Change');

    graph.vis
      .append('g')
      .append('path')
      .datum(baseLine)
      .attr('d', graph.line)
      .attr('class', 'trend baseline');

    graph.vis
      .append('g')
      .append('path')
      .datum(data.A)
      .attr('d', graph.line)
      .attr('class', 'trend A')
      .on('mouseover', function(d) {
        graph.showTooltip(d)
      })
      .on('mouseout', function() {
        graph.hideToolTip();
      });

    graph.vis
      .append('g')
      .append('path')
      .datum(data.C)
      .attr('d', graph.line)
      .attr('class', 'trend C')
      .on('mouseover', function(d) {
        graph.showTooltip(d);
      })
      .on('mouseout', function() {
        graph.hideToolTip();
      });

    graph.vis
      .append('g')
      .append('path')
      .datum(data.H)
      .attr('d', graph.line)
      .attr('class', 'trend H')
      .on('mouseover', function(d) {
        graph.showTooltip(d);
      })
      .on('mouseout', function() {
        graph.hideToolTip();
      });

  };

  TrendChart.prototype.updateData = function(raw) {

  };

  TrendChart.prototype.propogateUpdate = function() {

  };

  TrendChart.prototype.resizeChart = function() {

  };

  TrendChart.prototype.showTooltip = function(d) {
    var graph = this;

    graph.tooltip.transition()
      .duration(200)
      .style('opacity', 0.8);

    graph.tooltip.html('Im a tooltip!')
      .attr('width', (15 + 20)+'px')
      .style('left', d3.event.pageX + 'px')
      .style('top', cdd3.event.pageY + 'px');
  };

  TrendChart.prototype.hideToolTip = function() {
    this.tooltip.transition().duration(300).style('opacity', 0);
  };


  return TrendChart;
});
