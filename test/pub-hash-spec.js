/*
* 3/25/2015
* Tom Evans
* Jasmine unit tests for pub-hash.js run by Karma.js
*/

'use strict';

var dependencies = ['pub-hash'];

define(dependencies, function(PubHash) {
  describe('pub-hash', function() {
    var hash;

    beforeAll(function() {
      hash = new PubHash();
    });

    afterAll(function() {
      hash = null;
    });

    describe('H (Human) category', function() {

      it('can translate M01.523.445.234', function() {
        var num = 'M01.523.445.234';
        expect(hash.translateMeshNum(num)).toEqual('H');
      });

      it('can translate C01.342.523.523.222', function() {
        var num = 'C01.342.523.523.222';
        expect(hash.translateMeshNum(num)).toEqual('H');
      });

      it('can translate B01.050.150.900.649.801.400.112.400.400', function() {
        var num = 'B01.050.150.900.649.801.400.112.400.400';
        expect(hash.translateMeshNum(num)).toEqual('H');
      });

      it('will not translate B01.050.150.900.649.801.400.112.412.300', function() {
        var num = 'B01.050.150.900.649.801.400.112.412.300';
        expect(hash.translateMeshNum(num)).not.toEqual('H');
      });

    });

    describe('A (Animal) category', function() {

      it('can translate B01.523.623.432', function() {
        var num = 'B01.532.623.432';
        expect(hash.translateMeshNum(num)).toEqual('A');
      });

      it('can translate B01.050.150.900.649.801.400.112.412.300', function() {
        var num = 'B01.050.150.900.649.801.400.112.412.300';
        expect(hash.translateMeshNum(num)).toEqual('A');
      });

    });

    describe('C (Cell) category', function() {

      it('can translate a mesh number to the Weber category C', function() {
        var num = 'B02.234.525.234.234.400';
        expect(hash.translateMeshNum(num)).toEqual('C');
      });

      it('can translate A11.342.533.622.343', function() {
        var num = 'A11.342.533.622.343';
        expect(hash.translateMeshNum(num)).toEqual('C');
      });

      it('can translate B03.444.222', function() {
        var num = 'B03.444.222';
        expect(hash.translateMeshNum(num)).toEqual('C');
      });

      it('can translate B04.223.523.777', function() {
        var num = 'B04.223.523.777';
        expect(hash.translateMeshNum(num)).toEqual('C');
      });

      it('can translate G02.111.570', function() {
        var num = 'G02.111.570';
        expect(hash.translateMeshNum(num)).toEqual('C');
      });

      it('can translate G02.149', function() {
        var num = 'G02.149';
        expect(hash.translateMeshNum(num)).toEqual('C');
      });

      it('will not translate G02.112.570', function() {
        var num = 'G02.112.570';
        expect(hash.translateMeshNum(num)).not.toEqual('C');
      });

      xit('will not translate G02.111.570.555', function() {
        var num = 'G02.111.570.555';
        expect(hash.translateMeshNum(num)).not.toEqual('C');
      });


    });


  });
});
