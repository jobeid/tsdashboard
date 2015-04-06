/*
* 3/25/2015
* Tom Evans
* D3 directed scatter plot generator class.  Supports dynamic update of entity
* dimensionality as well as the dataset itself.  Layout used is determined by
* the properties.weber boolean.  Truthy will yield node placement based on
* my vecorization of the Weber model.  Falsy yeilds a traditional 2D cartesion
* with selectable X / Y axii values.
*/

'use strict';

var dependencies = [
  'd3'
];

define(dependencies, function(d3) {

  function GraphGenerator(data, properties) {
    var graph = this;
    graph.data = data || {nodes:[],links:[]};
    graph.properties = properties;
    graph.vis = properties.svg;
    graph.visGroup = graph.vis.append('g')
      .attr('transform',properties.transform)
      .attr('class', 'digraph')
      .append('g')
      .attr('clip-path', 'url(#clipBox)');
    graph.fill = d3.scale.category20();

    graph.labels = [
      {label:'C', x:0, y:-3000},
      {label:'A', x:-3000, y:1750},
      {label:'H', x:3000, y:1750}
    ];
    // tooltip
    graph.tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

    // bounding box
    graph.visGroup.append('rect').attr('class', 'frame').attr('width', properties.width).attr('height', properties.height);

    // scales
    graph.degreeFill = d3.scale.ordinal().domain([1,250]).range(['blue','green','yellow','orange','red']);
    graph.degreeScale = d3.scale.linear().domain([1,25]).range([10,60]).clamp(true);
    graph.tsFill = d3.scale.linear().domain([0,1]).range([10,255]).clamp(true);

    // x / y scales
    graph.xScale = d3.scale.linear().domain([0, 100]).range([0, (graph.properties.width * 6.5)]).nice();
    graph.yScale = d3.scale.linear().domain([0, 100]).range([((graph.properties.height)* 6.5), 0]).nice();


    // key function
    graph.keyFunc = function keyFunc(d) { return d.data.name; };

    // r val function
    graph.rVal = function(d) {
      if (graph.properties.nodeSize == 'Human') {
        return d.ts.H;
      }
      if (graph.properties.nodeSize == 'Animal') {
        return d.ts.A;
      }
      if (graph.properties.nodeSize == 'Cell') {
        return d.ts.C;
      }
      if (graph.properties.nodeSize == 'Centrality') {
        return graph.eigenScale(d.eigen);
      }
      if (graph.properties.nodeSize == 'Publication Count') {
        return d.pubCt;
      }

      if (graph.properties.nodeSize == 'Degree') {
        return graph.degreeScale((d.data.hasOwnProperty('pmid')) ? d.inDegree: d.inDegree + d.outDegree);
      } else {
        return graph.degreeScale((graph.properties.nodeSize == 'In Degree') ? d.inDegree: d.outDegree);
      }
    };

    // x map function
    graph.xMap = function(d) {
      if (!graph.properties.weber) {
        var x;
        if (graph.properties.xAxis == 'Animal & Cell') {
          x = Number(d.Animal) + Number(d.Cell);
        } else {
          x = d[graph.properties.xAxis];
        }
        return graph.xScale(x * 100);
      } else {
        return d.coors.x;
      }
    }

    // y map function
    graph.yMap = function(d) {
      if (!graph.properties.weber) {
        var y;
        if (graph.properties.yAxis == 'Animal & Cell') {
          y = Number(d.Animal) + Number(d.Cell);
        } else {
          y = d[graph.properties.yAxis];
        }
        return graph.yScale(y * 100);
      } else {
        return d.coors.y;
      }
    }


    // setup groups for edges and vertices
    graph.edges = graph.visGroup.append('g').selectAll('g');
    graph.vertices = graph.visGroup.append('g').selectAll('g');
    graph.trails = graph.visGroup.append('g').selectAll('g');

    // define markers for edges -- note may have to apply the markers to the
    // vis before binding it to the context
    // var arrows = graph.visGroup.append('svg:defs');
    // arrows.append('svg:marker')
    //   .attr('id', graph.properties.marker.id)
    //   .attr('viewBox', graph.properties.marker.view)
    //   // .attr('refX', function(d) {
    //   //   return (graph.calcNRad(d) + 5);
    //   // })
    //   .attr('refX', graph.properties.marker.rX)
    //   .attr('refY', graph.properties.marker.rY)
    //   .attr('markerWidth', graph.properties.marker.width)
    //   .attr('markerHeight', graph.properties.marker.height)
    //   .attr('orient', 'auto')
    //   .attr('class', graph.properties.marker.classString)
    //   .append('svg:path')
    //   .attr('d', 'M0,-5L10,0L0,5');

    // attach axii and labels
    // graph.xAxisG = graph.visGroup.append('g')
    //   .attr('class', 'axis')
    //   .attr('transform', 'translate(' + (properties.margin.left - 50) + ',' + (properties.height * 7) + ')');
    // graph.xAxisG.append('text').attr('class', 'x');
    // graph.yAxisG =	graph.visGroup.append('g')
    //   .attr('class', 'axis')
    //   .attr('transform', 'translate(' + ((properties.margin.left + properties.margin.right) * 2) +',' + (properties.margin.top) + ')');
    // graph.yAxisG.append('text').attr('class', 'y');



    // draw labels
    graph.visGroup.selectAll('.tri-label')
      .data(graph.labels).enter()
      .append('text')
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; })
      .attr('class', 'tri-label overlay active')
      .attr('fill', function(d) {
        if (d.label =='A') {
          return 'RGB('+300+','+0+','+0+')';
        }
        if (d.label == 'H') {
          return 'RGB('+0+','+300+','+0+')';
        }
        if (d.label == 'C') {
          return 'RGB('+0+','+0+','+300+')';
        }
      })
      .text(function(d) { return d.label; });

    // draw overlay and hide
    var overlay = [{x1: 0, y1: -3750, x2: -3750, y2: 1950, cssClass:'overlay-outer overlay'},
      {x1: 0, y1: -3750, x2: 3750, y2: 1950, cssClass:'overlay-outer overlay'},
      {x1: -3750, y1: 1950, x2: 3750, y2: 1950, cssClass:'overlay-outer overlay'},
      {x1: -3750, y1: 1950, x2: 1875, y2: -875, cssClass:'sub-overlay overlay'},
      {x1: 0, y1: -3750, x2: 0, y2: 1950, cssClass:'sub-overlay overlay'},
      {x1: -1875, y1: -875, x2: 1875, y2: -875, cssClass:'sub-overlay overlay'},
      {x1: -1875, y1: -875, x2: 0, y2: 1950, cssClass:'sub-overlay overlay'},
      {x1: 0, y1: 1950, x2: 1875, y2: -875, cssClass:'sub-overlay overlay'},
      {x1: 3750, y1: 1950, x2: -1875, y2: -875, cssClass: 'trans-axis overlay'}];

    graph.visGroup.selectAll('overlay')
      .data(overlay).enter()
      .append('line')
      .attr('x1', function(d){ return d.x1; })
      .attr('y1', function(d){ return d.y1; })
      .attr('x2', function(d){ return d.x2; })
      .attr('y2', function(d){ return d.y2; })
      .attr('class', function(d){ return d.cssClass; });


    graph.title = graph.visGroup.append('text')
      .attr('class', 'graph-title')
      .attr('x', -3000)
      .attr('y', -4000)
      .text('Title');



    window.onresize = function() {
      graph.reSizeGraph(graph.vis);
    }
  }; // END OBJECT CONSTRUCTOR



  GraphGenerator.prototype.propogateUpdate = function() {
    var graph = this;
    graph.eigenScale = d3.scale.linear().domain(
        d3.extent(graph.data.nodes, function(d){ return d.eigen; })
      )
      .range([20,100]).clamp(true);


    // UPDATE TITLE
    graph.title.text(function() {
      if (graph.properties.range.lo == graph.properties.range.hi) {
        return graph.properties.range.lo;
      } else {
        return graph.properties.range.lo + "-" + graph.properties.range.hi;
      }
    });

    // UPDATE AXII
    // graph.xAxis = d3.svg.axis().scale(graph.xScale).orient('bottom');
    // graph.xAxisG
    //   .call(graph.xAxis);
    // d3.selectAll('text.x')
    //   .attr('x', (graph.properties.width/2))
    //   .attr('y', 30)
    //   .attr('dy', '.71em')
    //   .attr('class', 'x title-axis')
    //   .style('text-anchor', 'middle')
    //   .text(function() { return graph.properties.xAxis; });
    // graph.yAxis = d3.svg.axis().scale(graph.yScale).orient('left');
    // graph.yAxisG
    //   .call(graph.yAxis);
    // d3.selectAll('text.y')
    //   .attr('x', ((graph.properties.height - graph.properties.margin.bottom) / 2) * -1)
    //   .attr('y', -60)
    //   .attr('dy', '.71em')
    //   .attr('transform', 'rotate(-90)')
    //   .attr('class', 'y title-axis')
    //   .style('text-anchor', 'middle')
    //   .text(function() { return graph.properties.yAxis; });



    // // // EDGES
    graph.edges = graph.edges.data(graph.data.links);
    // // En
    graph.edges.enter()
      .append('path');

    // // En + U
    graph.edges
      .attr('d', function(d) { return getArcSpecs(d); })
      .attr('class', function(d) {
        var classString = 'link ';

        if (graph.properties.showEdges) {
          classString += 'active ';
        } else {
          classString += 'inactive ';
        }

        if (d.source.active && d.target.active) {
          classString += 'nodesActive';
        }
        return classString;
      });
    // // Ex
    graph.edges.exit().remove();

    // // VERTICES/NODES
    graph.vertices = graph.vertices.data(graph.data.nodes, graph.keyFunc);

    // En
    graph.vertices.enter().append('circle')
      .attr('class', 'node');

    // Before vertex-update calculate and animate node trails
    if (graph.properties.previous.length>0 && graph.properties.Trails) {
      var tpaths = {};

      graph.properties.previous.forEach(function(node) {
        if (tpaths[node.data.name]) {
          tpaths[node.data.name].x1 = node.coors.x;
          tpaths[node.data.name].y1 = node.coors.y;
        } else {
          tpaths[node.data.name] = {x1:node.coors.x, y1:node.coors.y, x2:null, y2:null, active:null};
        }

      });
      graph.data.nodes.forEach(function(node) {

        if (tpaths[node.data.name]) {
          tpaths[node.data.name].x2 = node.coors.x;
          tpaths[node.data.name].y2 = node.coors.y;
          tpaths[node.data.name].active = node.active && tpaths[node.data.name].active;
        } else {
          tpaths[node.data.name] = {x2:node.coors.x, y2:node.coors.y, x1:null, y1:null, active:node.active};
        }

      });

      tpaths = d3.map(tpaths).values();
      graph.trails = graph.trails.data(tpaths);

      graph.trails.enter().append('line')
        .attr('class', 'trails');

      graph.trails
        .attr('x1', function(d) { return d.x1; })
        .attr('y1', function(d) { return d.y1; })
        .attr('x2', function(d) { return d.x2; })
        .attr('y2', function(d) { return d.y2; })
        .attr('stroke-dasharray', (3000 + ', ' + 3000))
        .attr('stroke-dashoffset', 3000)
        .attr('class', function(d) {
          if (d.active) {
            return 'trails active';
          } else {
            return 'trails inactive';
          }
        })
        .transition()
        .duration(1750)
        .attr('stroke-dashoffset', 0);
    }


    // En + U
    graph.vertices
      .on('mouseover', function(d) {
        if (d.active) {

          var label = (d.data.name||d.data.pmid);
          graph.tooltip.transition().duration(200).style('opacity', 0.8);
          graph.tooltip.html('<h4>'+
              label+
              '</h4><h5>'+
              d.pubCt+
              ' total publications</h5><p>C: '+
              (d.ts.C * 100).toFixed()+
              '%</p><p>A: '+
              (d.ts.A * 100).toFixed()+
              '%</p><p>H: '+
              (d.ts.H * 100).toFixed()+
              '%</p>')
            .attr('width', (label.length + 20)+'px')
            .style('left', d3.event.pageX + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
        }

      })
      .on('mouseout', function(d) {
        graph.tooltip.transition().duration(300).style('opacity', 0);
      })
      .transition()
      .duration(1000)
      .attr('r', graph.rVal)
      .style('fill', function(d) {
        if (graph.properties.nodeColor == 'Human') {
          return 'RGB(0,'+ graph.tsFill(d.ts.H).toFixed() +',0)';
        }
        if (graph.properties.nodeColor == 'Animal') {
          return 'RGB('+ graph.tsFill(d.ts.A).toFixed() +',0,0)';
        }
        if (graph.properties.nodeColor == 'Cell') {
          return 'RGB(0,0,'+ graph.tsFill(d.ts.C).toFixed() +')';
        }

        if(graph.properties.nodeColor == 'Trans Science') {
          return 'RGB('+graph.tsFill(d.ts.A).toFixed()+','+graph.tsFill(d.ts.H).toFixed()+','+graph.tsFill(d.ts.C).toFixed()+')';
        }
        if(graph.properties.nodeColor == 'Degree') {
          return (d.data.hasOwnProperty('pmid')) ? graph.fill(d.inDegree): graph.fill(d.inDegree+d.outDegree);
        }
        if(graph.properties.nodeColor == 'Out Degree') {
          return graph.fill(d.outDegree);
        }
        if(graph.properties.nodeColor == 'In Degree') {
          return graph.fill(d.inDegree);
        }
        if(graph.properties.nodeColor == 'Publication Count') {
          return graph.fill(d.pubCt);
        }

      })
      .attr('class', function(d) {
        if (d.active) {
          return 'node active';
        } else {
          return 'node inactive';
        }
      })
      .attr('cx', graph.xMap)
      .attr('cy', graph.yMap);


    // // remove old
    graph.vertices.exit().transition().remove();
    graph.properties.previous = graph.data.nodes.slice(0);

    // if (!graph.properties.weber) {
    //   d3.selectAll('.axis').style('stroke-opacity', 1);
    //   d3.selectAll('.overlay').style('stroke-opacity', 0);
    // } else {
    //   d3.selectAll('.axis').style('stroke-opacity', 0);
    //   d3.selectAll('.overlay').style('stroke-opacity', 1);
    // }

    return true;

    function getArcSpecs(d) {
      var sX = d.source.coors.x,
      tX = d.target.coors.x,
      sY = d.source.coors.y,
      tY = d.target.coors.y,
      dx = tX - sX,
      dy = tY - sY,
      dr = Math.sqrt(dx * dx + dy * dy),
      oX = (dx * graph.calcNRad(d.target)) / dr,
      oY = (dy * graph.calcNRad(d.target)) / dr,
      aX = tX - oX,
      aY = tY - oY;
      if (aX == 'NaN' || aY == 'NaN' || sX == 'NaN' || sY == 'NaN' || tX == 'NaN' || tY == 'NaN') {
        console.log(d);
      }
      return 'M'+sX+','+sY+'A'+dr+','+dr+' 0 0,0 '+tX+','+tY;
    }
  };

  GraphGenerator.prototype.updateData = function(data) {
    var graph = this;

    // clean old data
    graph.data.nodes.splice(0, graph.data.nodes.length);
    graph.data.links.splice(0, graph.data.links.length);

    // load new data
    data.nodes.forEach(function(node) {
      graph.data.nodes.push(node);
    });
    data.links.forEach(function(link) {
      graph.data.links.push(link);
    });

    // call update
    graph.propogateUpdate();
  };

  GraphGenerator.prototype.reSizeGraph = function(vis) {
    // d3 is grabbing the context specific container
    vis.attr('width', d3.select('#chart-panel')[0][0].clientWidth).attr('height', d3.select('#chart-panel')[0][0].clientHeight);
  };

  GraphGenerator.prototype.zoom = function() {
    d3.select('.digraph').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  };

  GraphGenerator.prototype.dragStart = function() {
    d3.event.sourceEvent.stopPropagation();
  };

  GraphGenerator.prototype.dragIt = function(d) {
    var graph = this;
    d.coors.x += d3.event.dx;
    d.coors.y += d3.event.dy;
    graph.propogateUpdate();
  };

  GraphGenerator.prototype.calcNRad = function(datum) {
    var graph = this;
    return graph.properties.nRad;
  };

  return GraphGenerator;
});
