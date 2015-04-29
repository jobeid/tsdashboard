/*
*
*
*
*
*/

'use strict';

var dependencies = [
  'd3'
];

define(dependencies, function(d3) {
  function Heatmap(data) {
    var graph = this;
    graph.data = data || {};

    var properties = graph.properties = {height:450, width:d3.select('.heat-map')[0][0].clientWidth};
    graph.vis = d3.select('.heat-map').append('svg')
      .attr('width', properties.width)
      .attr('height', properties.height)
      .append('g')
      .attr('transform', 'translate(75,50)scale(0.8)');

    graph.heatFill = d3.scale.linear()
      .domain(d3.extent(data, function(d) { return d.d; }))
      .range(['lightgray','red']);

    graph.x = d3.scale.linear()
      .domain([0,7])
      .range([0, properties.width-35]);

    graph.y = d3.scale.linear()
      .domain([2006, 2013])
      .range([properties.height-50, 0]);

    graph.xAxis = d3.svg.axis()
      .scale(graph.x)
      .orient(['bottom'])
      .ticks([0]);

    graph.yAxis = d3.svg.axis()
      .scale(graph.y)
      .orient('left')
      .tickFormat(d3.format(''));

    graph.vis.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ (properties.height-25) + ')')
      .call(graph.xAxis)
      .append('text')
      .attr('y', 45)
      .attr('x', (properties.width/2))
      .style('text-anchor', 'middle')
      .text('Density shift towards Human ->')
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
      .text('Year')
      .attr('class', 'trend-label');

    graph.blocks = graph.vis.selectAll('.block')
      .data(graph.data)
      .enter()
      .append('rect')
      .attr('x', function(d) { return graph.x(d.x); })
      .attr('y', function(d) { return graph.y(d.y)-25; })
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 75)
      .attr('height', 50)
      .attr('fill', function(d) { return graph.heatFill(d.d); });


  };

  return Heatmap;
});
