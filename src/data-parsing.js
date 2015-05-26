/*
* 3/25/2015
* Tom Evans
* This module encapsulates the data monkey functions needed to
* parse the overall data set to the user defined cross-section.
*/

'use strict';

var dependencies = [
  'tran-sci-cats',
  'vectorize'
];

define(dependencies, function(ts, vectorize) {
  return function(rawData, properties) {
    var tempNodes,
      tempLinks,
      meshMap = {},
      data = {nodes:null,links:null,mesh:null};

    if (properties.Authors) {
      tempNodes = {};
      tempLinks = {};
      authorParse();

    }
    if (properties.Departments) {
      tempNodes = {};
      tempLinks = {};
      authorParse();
      departmentParse();

    }

    data.links = d3.map(tempLinks).values();
    data.nodes = d3.map(tempNodes).values();

    if (properties.nodeFilter.length != 0) {
      var nodeNames = [];
      properties.nodeFilter.forEach(function(entry) {
        nodeNames.push(entry.label);
      });
      data.nodes.forEach(function(node) {
        if (nodeNames.indexOf(node.data.name) == -1) {
          node.active = false;
        }
      });
    }

    //getEigen(data);
    //data.nodes = d3.map(tempNodes).values();
    setOutInDegrees(data.links);
    coordinateNodes(data.nodes);
    data.mesh = d3.map(meshMap).values();

    return data;

    // HELPER FUNCTIONS

    function isAuthInRangeIntersection(yearsInAuthorship) {
      // if the author is not in authorship for every year
      // in the range they are not part of the intersection
      for (var i = properties.range.lo; i <= properties.range.hi; i++) {
        if (!yearsInAuthorship[i]) {
          return false;
        }
      }
      return true;
    }

    function coordinateNodes(nodes) {
      var scale = d3.scale.linear().domain([0,1]).range([0, (properties.height / 2)]);

      nodes.forEach(function(node) {
        var t = {},
          sum = 0;

        if (node.hasOwnProperty('pop')) {
          sum = node.pop;
        } else {
          sum = node.pubCt;
        }

        if (sum != 0) {
          node.ts.A = Number((node.ts.A / sum).toFixed(4));
          node.ts.H = Number((node.ts.H / sum).toFixed(4));
          node.ts.C = Number((node.ts.C / sum).toFixed(4));
        }

        t.A = scale(node.ts.A);
        t.H = scale(node.ts.H);
        t.C = scale(node.ts.C);

        node.coors = vectorize(t);
      });
    }

    function setOutInDegrees(links) {
      if (links.length > 0) {
        links.forEach(function(link) {
          if (link.hasOwnProperty('mesh')) {
            link.source.inDegree = link.source.inDegree + 1 || 1;
            link.source.outDegree = link.source.outDegree + 1 || 1;
          } else {
            link.source.outDegree = link.source.outDegree + 1 || 1;
            link.target.inDegree = link.target.inDegree + 1 || 1;
          }
        });
      }
    }

    function meshParse(subMesh) {
      if (Array.isArray(subMesh)) {
        subMesh.forEach(function(mesh) {
          if (!meshMap[mesh]) {
            meshMap[mesh] = mesh;
          }
        });
      } else {
        if (subMesh && !meshMap[subMesh]) {
          meshMap[subMesh] = subMesh;
        }
      }

    }



    function authorParse() {
      // for each publication:
      // create nodes out of the authors
      // aggregate the nodes TS vals by this publications TS vals
      // every node should have a radius and fill attribute...

      rawData.forEach(function(pub) {
        // for each prime author create node if DNE
        // add this pubs TS val to the prime authors
        var secAuthors = [];
        meshParse(pub.mesh);

        for (var pAuth in pub.primeAuthor) {
          if (isAuthInRangeIntersection(pub.primeAuthor[pAuth].yearsInAuthorship)) {
            if (!tempNodes[pAuth]) {
              // DNE init
              tempNodes[pAuth] = {};
              tempNodes[pAuth].data = pub.primeAuthor[pAuth];
              tempNodes[pAuth].ts = new ts();
              tempNodes[pAuth].inDegree = 1;
              tempNodes[pAuth].outDegree = 1;
              tempNodes[pAuth].pubCt = 0;
              tempNodes[pAuth].coors = {x:0,y:0};
              tempNodes[pAuth].pmids = [];
              tempNodes[pAuth].active = true;
            }

            tempNodes[pAuth].ts.plus(pub.ts);
            tempNodes[pAuth].pmids.push(pub.pmid);
            tempNodes[pAuth].pubCt += 1;
            // for each sec author create node if DNE
            // add this pubs TS val to the sec authors
            // create a link from prime auth to sec auth if DNE
            for (var sAuth in pub.secAuthor) {
              if (isAuthInRangeIntersection(pub.secAuthor[sAuth].yearsInAuthorship)) {
                if (!tempNodes[sAuth]) {
                  // DNE init
                  tempNodes[sAuth] = {};
                  tempNodes[sAuth].data = pub.secAuthor[sAuth];
                  tempNodes[sAuth].ts = new ts();
                  tempNodes[sAuth].inDegree = 1;
                  tempNodes[sAuth].outDegree = 1;
                  tempNodes[sAuth].pubCt = 0;
                  tempNodes[sAuth].coors = {x:0,y:0};
                  tempNodes[sAuth].pmids = [];
                  tempNodes[sAuth].active = true;
                }
                var linkKey = sAuth+'-'+pAuth;
                if(!tempLinks[linkKey]) {
                  tempLinks[linkKey] = {source:tempNodes[sAuth], target:tempNodes[pAuth], conn:[pub]};
                } else {
                  tempLinks[linkKey].conn.push(pub);
                }
                if(secAuthors.indexOf(sAuth) == -1) {
                  secAuthors.push(sAuth);
                }
              }
            }  // end sAuth for
          }
        } // end pAuth for
        secAuthors.forEach(function(sAuth) {
          tempNodes[sAuth].ts.plus(pub.ts);
          tempNodes[sAuth].pmids.push(pub.pmid);
          tempNodes[sAuth].pubCt += 1;
        });
      }); // end foreach
    }

    function departmentParse() {
      var departmentNodes = {}, departmentLinks = {};

      // group the author nodes on department
      d3.map(tempNodes).values().forEach(function(author) {
        var name = getDeptName(author);

        if (!departmentNodes[name]) {

          departmentNodes[name] = {};
          departmentNodes[name].ts = new ts();
          departmentNodes[name].coors = {x:0,y:0};
          departmentNodes[name].data = {name:name};
          departmentNodes[name].outDegree = 0;
          departmentNodes[name].inDegree = 0;
          departmentNodes[name].intercom = 0;
          departmentNodes[name].pop = 0;
          departmentNodes[name].pubCt = 0;
          departmentNodes[name].active = true;

        }

        departmentNodes[name].ts.plus(author.ts);
        departmentNodes[name].pop++;
        departmentNodes[name].pubCt += author.pubCt;

      });

      // coalesce the authorship links into department links

      d3.map(tempLinks).values().forEach(function(link) {
        var sDep = getDeptName(link.source), tDep = getDeptName(link.target);

        if (sDep != tDep) {
          var linkName = sDep + '-' + tDep;
          if (!departmentLinks[linkName]) {
            departmentLinks[linkName] = {
              source:departmentNodes[sDep],
              target:departmentNodes[tDep],
              density:1
            };
          } else {
            departmentLinks[linkName].density += 1;
          }
        } else {
          departmentNodes[sDep].intercom += 1;
        }
      });


      tempLinks = departmentLinks;
      tempNodes = departmentNodes;

      function getDeptName(author) {
        var instID = properties.deptData.personel[author.data.pid].instID;
        var depID = properties.deptData.personel[author.data.pid].deptID;

        if (instID == 14) {
          return properties.deptData.departments[depID];
        } else {
          return properties.deptData.institutions[instID];
        }
      }
    }

    function getEigen(data) {
      var eigen = [],
      count = 0,
      sum = 0,
      names = [],
      linksTo = [],
      vals = [];


      data.links.forEach(function(link) {
        if (names.indexOf(link.source.data.name) === -1) {
        	names.push(link.source.data.name);
        	linksTo.push([]);
        	vals.push(1);
        } else {
        	vals[names.indexOf(link.source.data.name)].value+=1;
        }
        if (names.indexOf(link.target.data.name) === -1) {
        	names.push(link.target.data.name);
        	linksTo.push([]);
        	vals.push(1);
        } else {
        	vals[names.indexOf(link.target.data.name)].value+=1;
        }
        linksTo[names.indexOf(link.source.data.name)].push(link.target.data.name);
        linksTo[names.indexOf(link.target.data.name)].push(link.source.data.name);
      });

      for (var i = 0; i < 5; i++) {
      var cent = initArray(vals.length);

      for (var j = 0; j < vals.length; j++) {

      	for (var k = 0; k < linksTo[j].length; k++) {
      		var index = names.indexOf(linksTo[j][k]);
      		cent[index] = cent[index] + vals[j];
      	}
      }

      vals = cent.slice();
      }

      vals.forEach(function(val) {
        sum += val;
      });
      vals.forEach(function(val, i) {
        var newVal = val / sum;
        eigen.push({name:names[i],value:newVal});
      });

      eigen.forEach(function(val) {
        tempNodes[val.name].eigen = val.value;
      });
    };

    function initArray(length) {
      var array = [length];
      for (var i = 0; i < length; i++) {
        array[i] = 0;
      }
      return array;
    };
  };
});
