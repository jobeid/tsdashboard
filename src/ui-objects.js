/*
* 3/25/2015
* Tom Evans
* encapsulates all user interface objects in one container attached to
* the properties object.  the init method will link the DOM to the
* container fields and setup UI behaviors.
*/

'use strict';

var dependencies = [
  'jquery',
  'd3',
  'properties',
  'data-parsing',
  'graph-generator',
  'spinner',
  'dropdownCheckbox',
  'slider',
  'heat-map'
];

define(dependencies, function($, d3, properties, parseData, GraphGenerator, Spinner, dropdownCheckbox, Slider, heatmap) {
  var spinnerOpts = {
    lines: 13, // The number of lines to draw
    length: 20, // The length of each line
    width: 10, // The line thickness
    radius: 30, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  },
  meshD = {
    data: [],
    title: 'Mesh Terms',
    btnClass: 'btn btn-info',
    hideHeader: false,
    showNbSelected: true,
    autosearch: true
  },
  nodeD = {
    data: [],
    title: 'Nodes',
    btnClass: 'btn btn-info',
    hideHeader: false,
    showNbSelected: true,
    autosearch: true
  },
  span = '<span class="caret"></span>';

  function render() {
    var data = parseData(properties.pubHash.getData({range:properties.range,mesh:properties.mesh}), properties);


    if (properties.graph) {
      // console.log('graph exists, updating....')
      properties.graph.updateData(data);
    } else {
      // console.log('graph DNE, creating....')

      properties.graph = new GraphGenerator(data, properties);
      properties.graph.propogateUpdate();
    }

    updateFilter('nodeFilter', data.nodes);
    updateFilter('meshTermFilter', data.mesh);
  };

  function updatePerspective() {
    var current = d3.select('#btnNodePerspective').text().trim()
    var next = d3.select(this).text().trim();
    d3.select(this).text(current);
    d3.select('#btnNodePerspective').html(next+uiObjects.span);
    properties.mesh = [];
    this.meshTermFilter.dropdownCheckbox('reset', []);
    properties.nodeFilter = [];
    this.nodeFilter.dropdownCheckbox('reset', []);
    properties.previous = [];
    properties[current] = false;
    properties[next] = true;
    this.render();
  };

  function updateNodeSize() {
    var current = d3.select('#btnNodeSize').text().trim();
    var next = d3.select(this).text().trim();
    properties.nodeSize = next;
    d3.select(this).text(current);
    d3.select('#btnNodeSize').html(next+span);
    properties.graph.propogateUpdate();
  };

  function updateNodeColor() {
    var current = d3.select('#btnNodeColor').text().trim();
    var next = d3.select(this).text().trim();
    properties.nodeColor = next;
    d3.select(this).text(current);
    d3.select('#btnNodeColor').html(next+span);
    properties.graph.propogateUpdate();
  };

  function updateXaxis() {
    var current = d3.select('#btnXaxis').text().trim();
    var next = d3.select(this).text().trim();
    properties.xAxis = next;
    d3.select(this).text(current);
    d3.select('#btnXaxis').html(next+uiObjects.span);
    graph.propogateUpdate();
  };

  function updateYaxis() {
    var current = d3.select('#btnYaxis').text().trim();
    var next = d3.select(this).text().trim();
    properties.yAxis = next;
    d3.select(this).text(current);
    d3.select('#btnYaxis').html(next+uiObjects.span);
    graph.propogateUpdate();
  };

  function transition() {
    if (properties.range.lo != 2013) {
      properties.range.lo = properties.range.hi += 1;
    } else {
      properties.range.lo = 2006;
      properties.range.hi = 2006;
    }
    properties.ui.dateSlider.setValue([properties.range.lo,properties.range.hi]);
    properties.ui.render();
  };

  function applyFilters() {
    properties.mesh = properties.ui.meshTermFilter.dropdownCheckbox('checked');
    properties.nodeFilter = properties.ui.nodeFilter.dropdownCheckbox('checked');

    render();
    //calcTrendData(showTrends);
  };

  function renderHeatMap() {
    var pids = [],
      cohort = {'2006':[]},
      densities = {},
      dat = [],
      raw = parseData(properties.pubHash.getData({range:{lo:2006,hi:2006},mesh:properties.mesh}), properties).nodes;

    var lines = [
        function(x) { return -1.52*x-2325; },
        function(x) { return -1.52*x-900; },
        function(x) { return -1.52*x-187.5; },
        function(x) { return -1.52*x+525; },
        function(x) { return -1.52*x+1950; },
        function(x) { return -1.52*x+3375; },
        function(x) { return -1.52*x+4800; }
    ];

    //
    // raw.forEach(function(node) {
    //   if ((lines[1](node.coors.x) > node.coors.y) || (Number(node.ts.H)<0.2)) {
    //     pids.push(node.data.pid);
    //     cohort['2006'].push(node);
    //   }
    // });

    raw.forEach(function(node) {
      if (lines[2](node.coors.x) > node.coors.y) {
        pids.push(node.data.pid);
        cohort['2006'].push(node);
      }
    });

    for (var i=2007; i<2014; i++) {
      raw = parseData(properties.pubHash.getData({range:{lo:i,hi:i},mesh:properties.mesh}), properties).nodes;
      cohort[i] = [];
      raw.forEach(function(node) {
        if (pids.indexOf(node.data.pid) != -1) {
          cohort[i].push(node);
        }
      });
    }

    for (var year in cohort) {
      if (cohort.hasOwnProperty(year)) {
        densities[year] = [0,0,0,0,0,0,0];
        cohort[year].forEach(function(d) {
          densities[year][calcZone(d.coors)] += 1;
        });
        var z = 0;
        densities[year].forEach(function(d) {
          dat.push({x:z,y:year,d:d})
          z++;
        });
      }
    }

    console.log(cohort);
    console.log(densities);


    new heatmap(dat);

    function calcZone(coors) {

      for (var i=0; i<lines.length; i++) {
        if (lines[i](coors.x) > coors.y) {
          return i;
        }
      }
      return lines.length;
    };
  };

  // function calcTrendData(callback) {
  //   trendMap.clear();
  //
  //   for (var i=0; i < 7; i++) {
  //     trendMap.addData((2006+i).toFixed(), parseData(properties.pubHash.getData({range:{lo:(2006+i),hi:(2006+i)},mesh:properties.mesh}), properties).nodes, null);
  //   }
  //   properties.trendData = trendMap.addData('2013', parseData(properties.pubHash.getData({range:{lo:2013,hi:2013},mesh:properties.mesh}), properties).nodes, trendMap.aggregate);
  //   callback();
  // };
  //
  // function showTrends() {
  //
  //   if (properties.aTrend) {
  //     properties.aTrend.updateData(properties.trendData.A);
  //     properties.aTrend.propogateUpdate();
  //     properties.cTrend.updateData(properties.trendData.C);
  //     properties.cTrend.propogateUpdate();
  //     properties.hTrend.updateData(properties.trendData.H);
  //     properties.hTrend.propogateUpdate();
  //   } else {
  //     properties.aTrend = new TrendChart('A', properties.trendData.A);
  //     properties.cTrend = new TrendChart('C', properties.trendData.C);
  //     properties.hTrend = new TrendChart('H', properties.trendData.H);
  //   }
  // };

  function updateFilter(filter, items) {
    var newList = [],
      persistent = [],
      count = 0;

    properties.ui[filter].dropdownCheckbox('checked').forEach(function(item) {
      persistent.push(item.label);
    });

    items.forEach(function(item) {
      var label = (item.hasOwnProperty('data')) ? item.data.name : item;
      if (persistent.indexOf(label) == -1) {
        newList.push({id:count, label:label, isChecked:false});
        count+=1;
      }

    });

    var arr = newList.concat(properties.ui[filter].dropdownCheckbox('checked')).sort(function(a, b) {
      if(a.label < b.label) return -1;
      if(a.label > b.label) return 1;
      return 0;
    });

    properties.ui[filter].dropdownCheckbox('reset', arr);
  };

  return function() {
    this.properties = properties;
    this.spinner = null;
    this.meshTermFilter = null;
    this.nodeFilter = null;
    this.dateSlider = null;



    this.init = function() {
      properties.ui = this;
      this.spinner = new Spinner(spinnerOpts);
      this.meshTermFilter = $('.mesh-term-filter');
      this.meshTermFilter.dropdownCheckbox(meshD);
      this.nodeFilter = $('.node-filter');
      this.nodeFilter.dropdownCheckbox(nodeD);
      this.dateSlider = new Slider('#date-slider', {});
      this.dateSlider.setValue([2006,2006], true);
      this.dateSlider.on('slideStop', function(d) {
        properties.range.lo = d.value[0];
        properties.range.hi = d.value[1];
        render();
      });

      properties.transform = 'translate('+
        (properties.width* 0.52)+','+
        (properties.height* 0.65)+')scale(0.1)';

      properties.svg = d3.select('.chart').append('svg')
        .attr('width', properties.width)
        .attr('height', properties.height);

      // attach behavior to UI interaction

      // FILTER UPDATE
      d3.select('#btnApplyFilters').on('click', applyFilters);
      // PERSPECTIVE DD
      d3.select('#nodePerspListOne').on('click', updatePerspective);
      // NODE SIZE DD
      d3.select('#nodeSizeListOne').on('click', updateNodeSize);
      d3.select('#nodeSizeListTwo').on('click', updateNodeSize);
      d3.select('#nodeSizeListThree').on('click', updateNodeSize);
      d3.select('#nodeSizeListFour').on('click', updateNodeSize);
      d3.select('#nodeSizeListFive').on('click', updateNodeSize);
      d3.select('#nodeSizeListSix').on('click', updateNodeSize);
      d3.select('#nodeSizeListSeven').on('click', updateNodeSize);

      // X AXIS
      d3.select('#xAxisListOne').on('click', updateXaxis);
      d3.select('#xAxisListTwo').on('click', updateXaxis);
      d3.select('#xAxisListThree').on('click', updateXaxis);

      // Y AXIS
      d3.select('#yAxisListOne').on('click', updateYaxis);
      d3.select('#yAxisListTwo').on('click', updateYaxis);
      d3.select('#yAxisListThree').on('click', updateYaxis);

      // NODE COLOR DD
      d3.select('#nodeColorListOne').on('click', updateNodeColor);
      d3.select('#nodeColorListTwo').on('click', updateNodeColor);
      d3.select('#nodeColorListThree').on('click', updateNodeColor);
      d3.select('#nodeColorListFour').on('click', updateNodeColor);
      d3.select('#nodeColorListFive').on('click', updateNodeColor);
      d3.select('#nodeColorListSix').on('click', updateNodeColor);
      d3.select('#nodeColorListSeven').on('click', updateNodeColor);

      // TOGGLES
      d3.select('#tglEdge').on('click', function() {
        var tog = d3.select(this);
        if (tog.text() == 'On') {
          tog.attr('class', 'btn btn-default').text('Off');
          properties.showEdges = false;
          d3.selectAll('.link.active.nodesActive')
            .attr('class', 'link inactive nodesActive');
        } else {
          tog.attr('class', 'btn btn-info').text('On');
          properties.showEdges = true;
          d3.selectAll('.link.inactive.nodesActive')
            .attr('class','link active nodesActive');
        }

      });
      d3.select('#tglWeber').on('click', function() {
        // var tog = d3.select(this);
        // if (tog.text() == 'On') {
        //   tog.attr('class', 'btn btn-default').text('Off');
        //   d3.select('.digraph')
        //     .transition()
        //     .delay(500)
        //     .attr('transform', 'translate('
        //     + (properties.margin.right+properties.margin.left)
        //     + ',' + properties.margin.top + ')scale(0.1)');
        // } else {
        //   tog.attr('class', 'btn btn-info').text('On');
        //   d3.select('.digraph')
        //     .transition()
        //     .delay(500)
        //     .attr('transform', 'translate(550,500)scale(0.1)');
        // }
        // properties.weber = !properties.weber;
        // render();
      });
      d3.select('#tglTransition').on('click', function() {
        var tog = d3.select(this);

        if (tog.text() == 'On') {
          tog.attr('class', 'btn btn-default').text('Off');
          clearInterval(properties.interval);
          properties.interval = null;
        } else {
          tog.attr('class', 'btn btn-info').text('On');
          properties.interval = setInterval(transition, 2500);
        }
      });
      d3.select('#tglTrails').on('click', function() {
        var tog = d3.select(this);
        if (tog.text() == 'On') {
          tog.attr('class', 'btn btn-default').text('Off');
          properties.Trails = false;
          d3.selectAll('.trails.active').attr('class', 'trails inactive');
        } else {
          tog.attr('class', 'btn btn-info').text('On');
          properties.Trails = true;

        }
      });
    };
    this.render = render;
    this.updatePerspective = updatePerspective;
    this.transition = transition;
    this.updateFilter = updateFilter;
    this.renderHeatMap = renderHeatMap;
    // this.calcTrendData = calcTrendData;
    // this.showTrends = showTrends;
  }
});
