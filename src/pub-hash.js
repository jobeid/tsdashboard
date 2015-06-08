/*
* 3/25/2015
* Tom Evans
* A hash table object for holding data for publications
* and the authors
*/

'use strict';

var dependencies = [
  'author',
  'publication',
  'dept-data'
];

define(dependencies, function(Author, Publication, deptData) {

  var PubHash = function(props) {
    this.props = props;
    this.publications = {};
    this.authors = {};
    this.meshTrends = {
      '2006':{},
      '2007':{},
      '2008':{},
      '2009':{},
      '2010':{},
      '2011':{},
      '2012':{},
      '2013':{},
      '2014':{}
    };
  }

  // Load the hashes...
  PubHash.prototype.loadPublications = function(file) {

    for (var id in file) {
      var row = file[id];

      if (row.hasOwnProperty('pmid')) {
        var year = row.year.split('-')[0];
        // handle authors for current row
        this.loadAuthors(row.author, row.apid);
        this.loadAuthors(row.coauthor, row.cpid);

        this.authors[row.author].yearsInAuthorship[year] = true;
        this.authors[row.coauthor].yearsInAuthorship[year] = true;

        // create or update publication
        if (!this.publications[row.pmid]) {
          var temp = new Publication(row.pmid, year);
          temp.primeAuthor[row.author] = this.authors[row.author];
          temp.secAuthor[row.coauthor] = this.authors[row.coauthor];
          this.publications[row.pmid] = temp;
        } else {
          if (!this.publications[row.pmid].primeAuthor[row.author]) {
            this.publications[row.pmid].primeAuthor[row.author] = this.authors[row.author];
            if(this.publications[row.pmid].secAuthor[row.author]) {
              delete this.publications[row.pmid].secAuthor[row.author];
            }
          }
          if (!this.publications[row.pmid].secAuthor[row.coauthor] && !this.publications[row.pmid].primeAuthor[row.coauthor]) {
            this.publications[row.pmid].secAuthor[row.coauthor] = this.authors[row.coauthor];
          }
        }
      }
    }
    return true;
  };

  PubHash.prototype.loadMesh = function(file) {
    for (var id in file) {
      var row = file[id];
      if (row.hasOwnProperty('pmid')) {
        if (!this.publications[row.pmid]) {
  				this.publications[row.pmid] = new Publication(row.pmid, row.year.split('-')[0]);
  			}
  			var pub = this.publications[row.pmid];
  			if (pub) {
  				if (pub.mesh.indexOf(row.mesh) == -1) {
  					pub.mesh.push(row.mesh);
  				}

  				pub.meshNums.push({number:row.meshTreeNumber,term:pub.mesh.indexOf(row.mesh)});
  				var t = this.translateMeshNum(row.meshTreeNumber);

          if (this.meshTrends[row.year.split('-')[0]][row.meshTreeNumber]) {
            this.meshTrends[row.year.split('-')[0]][row.meshTreeNumber]++;
          } else {
            this.meshTrends[row.year.split('-')[0]][row.meshTreeNumber] = 1;
          }

  				if (t != '?') {
  					pub.ts[t]++;

  				}

  			} else {
  				console.log('PMID: ' + row.pmid + ' does not appear to exist!');
  			}
      }
    }

    return true;
  };

  PubHash.prototype.loadAuthors = function(author, pid) {
    if(!this.authors[author]) {
      this.authors[author] = new Author(author, pid, deptData.getDeptName(pid));
    }
  };

  PubHash.prototype.getData = function(filter) {
    var result = [];

    // handle year filter FIRST
		for (var pmid in this.publications) {
			var pub = this.publications[pmid];
			if (pub.year >= filter.range.lo && pub.year <= filter.range.hi) {
				result.push(pub);
			}
		}
		// result = publication that fit year filter

		// handle any mesh term matches SECOND
		if (filter.mesh.length != 0) {
			result = result.filter(function(d) {
				for (var i = 0; i < filter.mesh.length; i++) {
					if (d.mesh.indexOf(filter.mesh[i].label) != -1) {
						return true;
					}
				}
				return false;
			});
		}

		return result;
  };

  // this translation algorithm needs to be rewritten
  // with regex...
  PubHash.prototype.translateMeshNum = function(meshNum) {
    var transTerms = ['H', 'A', 'C', '?'],
			termSplit = meshNum.split('.');
		var ab = termSplit[0],
			gOne = termSplit[0] + '.' + termSplit[1] + '.' + termSplit[2],
			gTwo = termSplit[0] + '.' + termSplit[1];
		if (ab.split('')[0] == 'C' || ab == 'M01' || meshNum == 'B01.050.150.900.649.801.400.112.400.400') {
			return transTerms[0];
		}
		if (ab == 'B01') {
			return transTerms[1];
		}

		if (ab == 'A11' || ab == 'B02' || ab == 'B03' || ab == 'B04' || gOne == 'G02.111.570' || gTwo == 'G02.149') {
			return transTerms[2];
		}
		return '?';
  };

  return PubHash;
});
