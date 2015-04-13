/*
* 4/8/2015
* Tom Evans
* Jasmine unit tests for ts-seq.js to be run by Karma
*/

'use strict';

var dependencies = [
  'ts-seq'
];

define(dependencies, function(Tss) {
  var dat06 = [
    {coors:{x:0, y:0}},
    {coors:{x:500, y:500}},
    {coors:{x:-500, y:750}}
  ],
  dat07 = [
    {coors:{x:0, y:0}},
    {coors:{x:0, y:-1500}},
    {coors:{x:250, y:700}}
  ],
  dat08 = [
    {coors:{x:0, y:0}},
    {coors:{x:500, y:750}},
    {coors:{x:-750, y:500}}
  ];

  describe('ts-seq', function() {

    describe('Cell distance', function() {
      var tss;

      beforeAll(function() {
        tss = new Tss();
        tss.aggregate('2006', dat06);
        tss.aggregate('2007', dat07);
        tss.aggregate('2008', dat08);
        tss.aggregateChange();
      });

      afterAll(function() {
        tss = null;
      });

      it('aggregate can be calculated for 2006', function() {
        expect(tss.hash['2006'].C).toEqual(10319);
      });

      it('aggregate can be calculated for 2007', function() {
        expect(tss.hash['2007'].C).toEqual(8208);
      });

      it('aggregate can be calculated for 2008', function() {
        expect(tss.hash['2008'].C).toEqual(10362);
      });

      it('% change can be calculated for 2006->2007', function() {
        expect(tss.hash['2007'].Cc).toBeCloseTo(-20.46);
      });

      it('% change can be calculated for 2007->2008', function() {
        expect(tss.hash['2008'].Cc).toBeCloseTo(26.24);
      });

    });

    describe('Human distance', function() {
      var tss;

      beforeAll(function() {
        tss = new Tss();
        tss.aggregate('2006', dat06);
        tss.aggregate('2007', dat07);
        tss.aggregate('2008', dat08);
        tss.aggregateChange();
      });

      afterAll(function() {
        tss = null;
      });

      it('aggregate can be calculated for 2006', function() {
        expect(tss.hash['2006'].H).toEqual(8517);
      });

      it('aggregate can be calculated for 2007', function() {
        expect(tss.hash['2007'].H).toEqual(9454);
      });

      it('aggregate can be calculated for 2008', function() {
        expect(tss.hash['2008'].H).toEqual(8728);
      });

      it('% change can be calculated for 2006->2007', function() {
        expect(tss.hash['2007'].Hc).toBeCloseTo(11.0);
      });

      it('% change can be calculated for 2007->2008', function() {
        expect(tss.hash['2008'].Hc).toBeCloseTo(-7.68);
      });
    });

    describe('Animal distance', function() {
      var tss;

      beforeAll(function() {
        tss = new Tss();
        tss.aggregate('2006', dat06);
        tss.aggregate('2007', dat07);
        tss.aggregate('2008', dat08);
        tss.aggregateChange();
      });

      afterAll(function() {
        tss = null;
      });

      it('aggregate can be calculated for 2006', function() {
        expect(tss.hash['2006'].A).toEqual(8489);
      });

      it('aggregate can be calculated for 2007', function() {
        expect(tss.hash['2007'].A).toEqual(9932);
      });

      it('aggregate can be calculated for 2008', function() {
        expect(tss.hash['2008'].A).toEqual(8294);
      });

      it('% change can be calculated for 2006->2007', function() {
        expect(tss.hash['2007'].Ac).toBeCloseTo(17.0);
      });

      it('% change can be calculated for 2007->2008', function() {
        expect(tss.hash['2008'].Ac).toBeCloseTo(-16.49);
      });

    });

  });
});
