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

    graph.vis = properties.svg.attr('class', 'weber')
      .append('g')
      .attr('transform', 'translate(' + (properties.height / 2) + ',' + ((properties.height / 2) + 50) + ')')
      .call(d3.behavior.zoom().x(graph.xScale).y(graph.yScale).scaleExtent([1,16]).on("zoom", zoom))
      .append('g')
      .attr('class', 'digraph');


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
    graph.heatFill = d3.scale.linear().range(['lightgray','red']);
    graph.edgeColorScale = d3.scale.linear().range(['steelblue', 'red']);
    graph.edgeWidthScale = d3.scale.linear().range([0.25,4]);
    graph.radiusScale = d3.scale.linear()
      .range([1,10])
      .clamp(true);

    graph.tsFill = d3.scale.linear()
      .domain([0,1])
      .range([10,255])
      .clamp(true);

    // key function
    graph.keyFunc = function keyFunc(d) { return d.data.name; };

    // value map function for nodes
    graph.valMap = function(d) {
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
        return d.eigen;
      }
      if (graph.properties.nodeSize == 'Publication Count') {
        return d.pubCt;
      }

      if (graph.properties.nodeSize == 'Degree') {
        return (d.data.hasOwnProperty('pmid')) ? d.inDegree: d.inDegree + d.outDegree;
      } else {
        return (graph.properties.nodeSize == 'In Degree') ? d.inDegree: d.outDegree;
      }
    };

    // value map function for edges
    graph.edgeValMap = function(d) {
      var sum;
      if (graph.properties.edgeColor == 'Connection Density') {
        return (d.density) ? d.density : d.conn.length;
      }
      if (graph.properties.edgeColor == '# Publications (both)') {
        sum = d.target.pubCt + d.source.pubCt;
        return sum / 2;
      }
      if (graph.properties.edgeColor == '# Publications (either)') {
        return (d.target.pubCt > d.source.pubCt) ? d.target.pubCt : d.source.pubCt;
      }
      if (graph.properties.edgeColor == 'Human Research') {
        sum = Number(d.target.ts.H) + Number(d.source.ts.H);
        return sum / 2;
      }
      if (graph.properties.edgeColor == 'Cell Research') {
        sum = Number(d.target.ts.C) + Number(d.source.ts.C);
        return sum / 2;
      }
      if (graph.properties.edgeColor == 'Animal Research') {
        sum = Number(d.target.ts.A) + Number(d.source.ts.A);
        return sum / 2;
      }
      if (graph.properties.edgeColor == 'Animal & Cell Research') {
        sum = Number(d.target.ts.A) + Number(d.source.ts.A)
          + Number(d.target.ts.C) + Number(d.source.ts.C);
        return sum / 2;
      }
    }


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
      d3.selectAll('.overlay')
        .attr('transform',
        'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

      graph.vertices.attr('transform', graph.transform);

      d3.selectAll('.link')
        .attr('transform',
        'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');

      d3.selectAll('.trails')
        .attr('transform',
        'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    };

    // window.onresize = function() {
    //   graph.reSizeGraph(graph.vis);
    // }
  }; // END OBJECT CONSTRUCTOR



  GraphGenerator.prototype.propogateUpdate = function() {
    var graph = this;

    // graph.eigenScale = d3.scale.linear().domain(
    //     d3.extent(graph.data.nodes, function(d){ return d.eigen; })
    //   )
    //   .range([20,100]).clamp(true);

    // reset all scale domains
    var val = d3.extent(graph.data.nodes, function(d) {
      return graph.valMap(d);
    });

    graph.heatFill.domain(val);

    graph.radiusScale.domain(val);

    val = d3.extent(graph.data.links, function(d) {
      return graph.edgeValMap(d);
    });

    graph.edgeColorScale.domain(val);

    graph.edgeWidthScale.domain(val);

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
      .on('mouseover', function(d) {
        var label = '<p>Source: ' + d.source.data.name
          + '</p><p>Target: ' + d.target.data.name
          + '</p><p>Publications shared: ' + d.conn.length
          +'</p>';

          graph.tooltip.transition().duration(200).style('opacity', 0.8);

          graph.tooltip.html(label)
            .attr('width', (label.length + 20)+'px')
            .style('left', d3.event.pageX + 'px')
            .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        graph.tooltip.transition().duration(200).style('opacity', 0);
      })
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
      })
      .transition()
      .duration(300)
      .attr('d', function(d) { return getArcSpecs(d); })
      .attr('stroke-width', function(d) {
        return graph.edgeWidthScale(graph.edgeValMap(d));
      })
      .attr('stroke', function(d) {
        return graph.edgeColorScale(graph.edgeValMap(d));
      });

    // // Ex
    graph.edges.exit().remove();

    // // VERTICES/NODES
    graph.vertices = graph.vertices.data(graph.data.nodes, graph.keyFunc);

    // En
    graph.vertices.enter().append('circle')
      .attr('class', 'node');

    // Before vertex-update calculate and animate node trails
    var newPrevious = [],
      tpaths = [];

    graph.data.nodes.forEach(function(node) {
      if (graph.properties.previous[node.data.name]) {

        tpaths.push({
          x1:graph.properties.previous[node.data.name].coors.x,
          y1:graph.properties.previous[node.data.name].coors.y,
          x2:node.coors.x,
          y2:node.coors.y,
          active:node.isActive(graph.properties.filter)
        });
      }
      newPrevious.push(node);
    });

    graph.properties.previous = d3.map(newPrevious,
      function(d) { return d.data.name; })['_'];

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
        if (d.active && graph.properties.Trails) {
          return 'trails active';
        } else {
          return 'trails inactive';
        }
      })
      .transition()
      .duration(1700)
      .attr('stroke-dashoffset', 0);

    // En + U
    graph.vertices
      .on('mouseover', function(d) {

        var label = '<h4>'+
            d.data.name+
            '</h4><h5>'+
            d.pubCt+
            ' total publications</h5><p>C: '+
            (d.ts.C * 100).toFixed()+
            '%</p><p>A: '+
            (d.ts.A * 100).toFixed()+
            '%</p><p>H: '+
            (d.ts.H * 100).toFixed()+
            '%</p>';

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
      .duration(1500)
      .attr('r', function(d) {
        return graph.radiusScale(graph.valMap(d));
      })
      .style('fill', function(d) {
        if(graph.properties.nodeColor == 'Trans Science') {
          return 'RGB('+graph.tsFill(d.ts.A).toFixed()+','+graph.tsFill(d.ts.H).toFixed()+','+graph.tsFill(d.ts.C).toFixed()+')';
        }
        return graph.heatFill(graph.valMap(d));
      })
      .attr('class', function(d) {
        
        if (d.isActive(graph.properties.filter)) {
          return 'node active';
        } else {
          return 'node inactive';
        }

      })
      .attr('transform', graph.transform);


    // // remove old
    graph.vertices.exit().transition().remove();

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
