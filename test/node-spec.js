/*
*
*
*
*/

'use strict';

define(['node'], function(node) {
  describe('node', function() {
    it('can instantiate a node obj', function() {
      expect(new node())
        .toEqual(jasmine.objectContaining({
          data:{},
          ts:{},
          inDegree:0,
          outDegree:0,
          pubCt:0,
          coors:{},
          pmids:[],
          isActive:function(){},
          mesh:[]
        }));
    });
    describe('isActive', function() {
      it('returns true on a mesh term match', function() {
        expect((new node()).isActive({mesh:[],node:[]}))
          .toBeTruthy();
      });

      it('returns false on no mesh term match', function() {
        expect((new node()).isActive({
          mesh:['something'],
          node:[]
        })).toBeFalsy();
      });
    })
  });
});
