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
  function Heatmap() {
    var graph = this;
    graph.data = [];

    var properties = graph.properties = {height:450, width:d3.select('.heat-map')[0][0].clientWidth};
    graph.vis = d3.select('.heat-map').append('svg')
      .attr('width', properties.width)
      .attr('height', properties.height)
      .append('g')
      .attr('transform', 'translate(75,50)scale(0.8)');

    graph.heatFill = d3.scale.linear()
      .range(['lightgray','red']);

    graph.blocks = graph.vis.append('g').selectAll('g');

    graph.x = d3.scale.linear()
      .domain([0,7])
      .range([0, properties.width-35]);

    graph.y = d3.scale.linear()
      .domain([2006, 2014])
      .range([properties.height-50, 0]);

    graph.xAxis = d3.svg.axis()
      .scale(graph.x)
      .orient(['bottom'])
      .tickValues([1,2,3,4,5,6,7]);

    graph.yAxis = d3.svg.axis()
      .scale(graph.y)
      .orient('left')
      .tickFormat(d3.format(''))
      .tickValues([2006,2007,2008,2009,2010,2011,2012,2013]);

    graph.vis.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,'+ (properties.height-25) + ')')
      .call(graph.xAxis)
      .append('text')
      .attr('y', 45)
      .attr('x', (properties.width/2))
      .style('text-anchor', 'middle')
      .text('Partitions')
      .attr('class', 'trend-label');

    d3.selectAll(".tick text")
      .style("text-anchor", "start")
      .attr("x", -43)
      .attr("y", 6)

    graph.vis.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(0,25)')
      .call(graph.yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -75)
      .attr('x', (-1 * (properties.height/2)))
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text('Year')
      .attr('class', 'trend-label');

      graph.tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
  };

  Heatmap.prototype.updateData = function(data) {
    var graph = this;

    // clean old data
    graph.data.splice(0, graph.data.length);

    // load new data
    data.forEach(function(d) {
      graph.data.push(d);
    });

    // call update
    graph.propogateUpdate();
  };

  Heatmap.prototype.propogateUpdate = function() {
    var graph = this;

    graph.heatFill.domain(d3.extent(graph.data, function(d) { return d.d; }))

    graph.blocks = graph.blocks.data(graph.data);

    graph.blocks.enter().append('rect').attr('class','poly');

    graph.blocks
      .on('mouseover', function(d) {
        var label = '<h3>Partition ' + (d.x+1) +'</h3><p>Density ' + d.d + ' Authors</p>';

        graph.tooltip.transition().duration(200).style('opacity', 0.8);

        graph.tooltip.html(label)
          .attr('width', (label.length + 20)+'px')
          .style('left', d3.event.pageX + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        graph.tooltip.transition().duration(300).style('opacity', 0);
      })
      .attr('x', function(d) { return graph.x(d.x); })
      .attr('y', function(d) { return graph.y(d.y)-25; })
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 75)
      .attr('height', 50)
      .transition()
      .duration(500)
      .attr('fill', function(d) { return graph.heatFill(d.d); });
  };

  return Heatmap;
});
