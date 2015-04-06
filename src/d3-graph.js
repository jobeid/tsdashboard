/*
* 3/25/2015
* Tom Evans
* Generates a scatterplot using multi-foci force vector to
* manage overplotting.
*/

'use strict';

var dependencies = [
  'd3'
];

define(dependencies, function(d3) {

  function D3Graph(data, properties) {
    var margin = {top: 20, right: 20, bottom: 30, left: 80},
        width = properties.width - margin.left - margin.right,
        height = properties.height - margin.top - margin.bottom,
        padding = 1, // separation between nodes
        radius = 6;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = properties.svg;
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr('class', 'chartaria')
      .append("g")
        .attr("transform", "translate(" + (margin.left+margin.right) + "," + margin.top + ")scale(.1)");

    var controls = d3.select("div#jitter").append("label")
        .attr("id", "controls");
    var checkbox = controls.append("input")
        .attr("id", "collisiondetection")
        .attr("type", "checkbox");

    var force = d3.layout.force()
        .nodes(data)
        .size([width, height])
        .on("tick", tick)
        .charge(-1)
        .gravity(0)
        .chargeDistance(20);

    x.domain([0,1]);
    y.domain([0,1]);

    console.log(data);

    data.forEach(function(d) {
      d.x = x(d.ts.A);
      d.y = y(d.ts.H);
      d.color = 'red';
      d.radius = radius;
    });

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("X axis");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", 'translate('+margin.right+',0)rotate(-90)')
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Y axis")

    var node = svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", radius)
        .attr("cx", function(d) { return x(d.ts.A); })
        .attr("cy", function(d) { return y(d.ts.H); })
        .style("fill", function(d) { return d.color; });

        d3.select("#collisiondetection").on("change", function() {
        if (this.checked) {
          console.log('its checked!');
          force.start();
        } else {
          console.log('it aint no check`um here suh');
          force.resume();
          force.stop();
        }
      });

      //force.start();

      function tick(e) {

        node.each(moveTowardDataPosition(e.alpha));

        if (checkbox.node().checked) node.each(collide(e.alpha));

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }

      function moveTowardDataPosition(alpha) {
        return function(d) {
          d.x += (x(d.ts.A) - d.x) * 0.1 * alpha;
          d.y += (y(d.ts.H) - d.y) * 0.1 * alpha;
        };
      }

      // Resolve collisions between nodes.
      function collide(alpha) {
        var quadtree = d3.geom.quadtree(data);
        return function(d) {
          var r = d.radius + radius + padding,
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + padding;
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      }
  }

  return D3Graph;

























  //var jitter, dat, node;

  // function D3Graph(data, properties) {
  //   this.svg = properties.svg;
  //   this.xMap = properties.xMap;
  //   this.yMap = properties.yMap;
  //   this.rMap = properties.rMap;
  //   this.fillMap = properties.fillMap;
  //   jitter = this.jitter = false;
  //   dat = this.data = data || {nodes:[],links:[]};
  //   this.svg.append('g')
  //     .attr('transform', properties.transform)
  //     .attr('class', 'digraph');
  //   this.nodes = d3.select('.digraph').append('g')
  //     .attr('class', 'nodes')
  //     .selectAll('.nodes');
  //   this.links = d3.select('.digraph').append('g')
  //     .attr('class', 'links')
  //     .selectAll('.links');
  //
  //   this.data.nodes.forEach(function(d) {
  //     d.r = 40;
  //     d.x = d.coors.x;
  //     d.y = d.coors.y;
  //     d.color = 'red';
  //   });
  //
  //   var force = this.force = d3.layout.force()
  //     .nodes(this.data.nodes)
  //     .size([properties.width, properties.height])
  //     .gravity(0)
  //     .charge(-1)
  //     .on('tick', this.tick)
  //     .chargeDistance(20);
  //
  //   d3.select('#tglJitter').on('click', function() {
  //     if (d3.select(this).text() == 'Off') {
  //       d3.select(this).text('On')
  //         .attr('class', 'btn btn-info');
  //     } else {
  //       d3.select(this).text('Off')
  //         .attr('class', 'btn btn-default');
  //     }
  //     jitter = !jitter;
  //     if (jitter) {
  //       console.log("jitter active");
  //     }
  //     force.resume();
  //   });
  // };
  //
  // D3Graph.prototype.updateData = function(newData) {
  //
  //
  // };
  //
  // D3Graph.prototype.propogateUpdate = function() {
  //   node = this.nodes = this.nodes.data(this.data.nodes, function(d) { return d.data.name; });
  //
  //   // node enter
  //   this.nodes.enter().append('circle')
  //     .attr('class', 'node');
  //
  //   // node enter + update
  //   this.nodes
  //     .attr('cx', function(d) { return d.x; })
  //     .attr('cy', function(d) { return d.y; })
  //     .attr('r', function(d) { return d.r; })
  //     .style('fill', function(d) { return d.color; });
  //
  //   this.force.start();
  // };
  //
  // D3Graph.prototype.tick = function(e) {
  //
  //   node = d3.selectAll('.node');
  //   console.log(node);
  //   node.each(moveTowardDataPosition(e.alpha));
  //
  //   if (true) node.each(collide(e.alpha));
  //
  //   node.attr("cx", function(d) { return d.coors.x; })
  //       .attr("cy", function(d) { return d.coors.y; });
  //
  //     function moveTowardDataPosition(alpha) {
  //       return function(d) {
  //         d.x += (d.coors.x - d.x) * 0.1 * alpha;
  //         d.y += (d.coors.y - d.y) * 0.1 * alpha;
  //       };
  //     }
  //
  //     // Resolve collisions between nodes.
  //     function collide(alpha) {
  //       var quadtree = d3.geom.quadtree(dat.nodes);
  //
  //       return function(d) {
  //         var r = d.r + d.r + 2,
  //             nx1 = d.x - r,
  //             nx2 = d.x + r,
  //             ny1 = d.y - r,
  //             ny2 = d.y + r;
  //         quadtree.visit(function(quad, x1, y1, x2, y2) {
  //           if (quad.point && (quad.point !== d)) {
  //             var x = d.x - quad.point.x,
  //                 y = d.y - quad.point.y,
  //                 l = Math.sqrt(x * x + y * y),
  //                 r = d.r + quad.point.r + (d.color !== quad.point.color) * 2;
  //             if (l < r) {
  //               l = (l - r) / l * alpha;
  //               d.x -= x *= l;
  //               d.y -= y *= l;
  //               quad.point.x += x;
  //               quad.point.y += y;
  //             }
  //           }
  //           return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  //         });
  //       };
  //     }
  // }
  //
  // return D3Graph;
});
