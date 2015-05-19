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

    graph.xScale = d3.scale.linear()
      .domain([0, graph.properties.height])
      .range([0, graph.properties.height]);

    graph.yScale = d3.scale.linear()
      .domain([0, graph.properties.height])
      .range([0, graph.properties.height]);

    graph.transform = function transform(d) {
      return 'translate(' + graph.xScale(d.coors.x) + ',' + graph.yScale(d.coors.y) + ')';
    }

    graph.vis = properties.svg.append('g')
      .attr('transform', 'translate(' + (properties.height / 2) + ',' + ((properties.height / 2) + 50) + ')')
      .call(d3.behavior.zoom().x(graph.xScale).y(graph.yScale).scaleExtent([1,8]).on("zoom", zoom))
      .append('g')
      .attr('class', 'digraph');
      // .attr('clip-path', 'url(#clipBox)');

    graph.fill = d3.scale.category20();

    graph.labels = [
      {label:'C', x:0, y:-310},
      {label:'A', x:-280, y:170},
      {label:'H', x:280, y:170}
    ];

    // tooltip
    graph.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // bounding box
    graph.vis.append('rect')
      .attr('class', 'frame')
      .attr('width', properties.width)
      .attr('height', properties.height)
      .attr('x', (properties.height/-2))
      .attr('y', (properties.height/-2));

    // scales
    graph.heatFill = d3.scale.linear().range(['gray','red']);

    graph.degreeScale = d3.scale.linear()
      .range([1,9])
      .clamp(true);

    graph.tsFill = d3.scale.linear()
      .domain([0,1])
      .range([10,255])
      .clamp(true);

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


    // setup groups for edges and vertices
    graph.edges = graph.vis.append('g').selectAll('g');
    graph.vertices = graph.vis.append('g').selectAll('g');
    graph.trails = graph.vis.append('g').selectAll('g');


    // draw labels
    graph.vis.selectAll('.tri-label')
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
    var overlay = [
      {x1: 0, y1: -300, x2: 0, y2: 0, cssClass:'overlay'},
      {x1: -260, y1: 150, x2: 0, y2: 0, cssClass:'overlay'},
      {x1: 260, y1: 150, x2: 0, y2: 0, cssClass:'trans-axis overlay'},
      // {x1: 0, y1: 130, x2: 0, y2: 0, cssClass:'overlay'},
      {x1: -260, y1: 150, x2: 260, y2: 150, cssClass:'overlay'},
      {x1: 0, y1: -300, x2: 260, y2: 150, cssClass:'overlay'},
      {x1: 0, y1: -300, x2: -260, y2: 150, cssClass:'overlay'}];

    graph.vis.selectAll('overlay')
      .data(overlay).enter()
      .append('line')
      .attr('x1', function(d){ return d.x1; })
      .attr('y1', function(d){ return d.y1; })
      .attr('x2', function(d){ return d.x2; })
      .attr('y2', function(d){ return d.y2; })
      .attr('class', function(d){ return d.cssClass; });

    graph.title = graph.vis.append('text')
      .attr('class', 'graph-title')
      .attr('x', -250)
      .attr('y', -250)
      .text('Title');

    function zoom() {
      d3.selectAll('.overlay').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
      graph.vertices.attr('transform', graph.transform);
    };

    // window.onresize = function() {
    //   graph.reSizeGraph(graph.vis);
    // }
  }; // END OBJECT CONSTRUCTOR



  GraphGenerator.prototype.propogateUpdate = function() {
    var graph = this;

    graph.eigenScale = d3.scale.linear().domain(
        d3.extent(graph.data.nodes, function(d){ return d.eigen; })
      )
      .range([20,100]).clamp(true);

    graph.heatFill.domain(d3.extent(graph.data.nodes, function(d) {
      if(graph.properties.nodeColor == 'Degree') {
        return d.inDegree+d.outDegree;
      }
      if(graph.properties.nodeColor == 'Out Degree') {
        return d.outDegree;
      }
      if(graph.properties.nodeColor == 'In Degree') {
        return d.inDegree;
      }
      if(graph.properties.nodeColor == 'Publication Count') {
        return d.pubCt;
      }

    }));

    graph.degreeScale.domain(d3.extent(graph.data.nodes, function(d) {
      return d.inDegree + d.outDegree;
    }));

    // UPDATE TITLE
    graph.title.text(function() {
      if (graph.properties.range.lo == graph.properties.range.hi) {
        return graph.properties.range.lo;
      } else {
        return graph.properties.range.lo + "-" + graph.properties.range.hi;
      }
    });


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
          //console.log(d);
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
          return (d.data.hasOwnProperty('pmid')) ? graph.heatFill(d.inDegree): graph.heatFill(d.inDegree+d.outDegree);
        }
        if(graph.properties.nodeColor == 'Out Degree') {
          return graph.heatFill(d.outDegree);
        }
        if(graph.properties.nodeColor == 'In Degree') {
          return graph.heatFill(d.inDegree);
        }
        if(graph.properties.nodeColor == 'Publication Count') {
          return graph.heatFill(d.pubCt);
        }

      })
      .attr('class', function(d) {
        if (d.active) {
          return 'node active';
        } else {
          return 'node inactive';
        }
      })
      // .attr('cx', graph.xMap)
      // .attr('cy', graph.yMap);
      .attr('transform', graph.transform);


    // // remove old
    graph.vertices.exit().transition().remove();
    graph.properties.previous = graph.data.nodes.slice(0);

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
    var p = this.properties;
    p.width = window.innerWidth * 0.9;
    //p.height = window.innerHeight * 0.9;
    vis.attr('width', p.width).attr('height', p.height);
    d3.select('.digraph').attr('transform', 'translate('+
      (p.width* 0.52)+','+
      (p.height* 0.65)+')scale(0.1)');
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
