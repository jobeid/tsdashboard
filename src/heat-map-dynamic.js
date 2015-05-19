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
    graph.data = {};
    graph.year = '2006';
    graph.props = {
      side:d3.select('.chart')[0][0].clientWidth,
      buffer: 50,
      n: 7,  // this needs to be dynamically set!
      q: Math.sqrt(Math.pow((0-260),2)+Math.pow((-300-150),2))
    };

    graph.svg = d3.select('.dynamic-hm')
      .append('svg')
      .attr('width', graph.props.side+graph.props.buffer)
      .attr('height', graph.props.side+graph.props.buffer)
      .append('g')
      .attr('transform',
        'translate('+(graph.props.side/2)+','+((graph.props.side/2) + 50)+')');

    graph.fillScale = d3.scale.linear().range(['lightgray', 'red']);

    graph.polys = graph.svg.append('g').selectAll('g');

    graph.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    /*
      needs window resize!

      needs dynamic poly drawing based on size of data set being passed in

      propogateUpdate should rbind the data and polys arrays so density is
      attached to each poly

    */

  };

  Heatmap.prototype.updateData = function(data) {
    var graph = this;

    graph.fillScale.domain(d3.extent(data, function(d) { return d.d; }));

    // load new data
    data.forEach(function(d) {
      if (!graph.data[d.y]) {
        graph.data[d.y] = [];
      }
      if (graph.data[d.y].length != 0) {
        graph.data[d.y][d.x] = d;
      } else {
        graph.data[d.y].push(d);
      }
    });

    // call update
    graph.propogateUpdate();
  };

  Heatmap.prototype.propogateUpdate = function() {
    var graph = this;
    var polys = definePolys(graph.props.q, graph.props.n);

    // console.log(graph.data[graph.year]);

    graph.data[graph.year].forEach(function(d) {
      polys[d.x].p = d.x;
      polys[d.x].d = d.d;
    });

    // console.log(polys);

    graph.polys = graph.polys.data(polys);

    graph.polys.enter().append('path').attr('class', 'poly');

    graph.polys
      .on('mouseover', function(d) {
        var label = '<h3>Partition ' + d.p +'</h3><p>Density ' + d.d + ' Authors</p>';

        graph.tooltip.transition().duration(200).style('opacity', 0.8);

        graph.tooltip.html(label)
          .attr('width', (label.length + 20)+'px')
          .style('left', d3.event.pageX + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function(d) {
        graph.tooltip.transition().duration(300).style('opacity', 0);
      })
      .transition()
      .duration(500)
      .attr('d', pathGen)
      .attr('fill', function(d) {
        return graph.fillScale(d.d);
      });
  };

  function pathGen(d) {
    return 'M '+d.c1.x+' '+d.c1.y
      +' L '+d.c2.x+' '+d.c2.y
      +' L '+d.c3.x+' '+d.c3.y
      +' L '+d.c4.x+' '+d.c4.y
      +' L '+d.c1.x+' '+d.c1.y;
  };

  function definePolys(q, n) {
    // q = side of triangle
    // n = num of partitions

    var lx1 = 0,
      ly1 = -300,
      lx2 = -260,
      ly2 = 150,
      x1,
      y1,
      x2,
      y2,
      n0,
      x0 = 10,
      polys = [];

      for (var i=1; i<n; i++) {
        n0 = (q/n) * i;


        x1 = Math.sin(Math.PI/6) * n0;
        y1 = -300 + Math.sqrt(Math.pow(n0, 2) - Math.pow(x1, 2));
        x2 = -260 + n0;
        y2 = 150;

        polys.push({c1:{x:lx2,y:ly2},c2:{x:lx1,y:ly1},c3:{x:x1,y:y1},c4:{x:x2,y:y2},d:Math.floor(Math.random() * 51)});

        lx1 = x1 + x0;
        ly1 = y1 + x0;
        lx2 = x2 + x0;
        ly2 = y2;
      }

      polys.push({c1:{x:lx2,y:ly2},c2:{x:lx1,y:ly1},c3:{x:260,y:150},c4:{x:260,y:150},d:Math.floor(Math.random() * 51)});

      return polys;
  };

  return Heatmap;
});
