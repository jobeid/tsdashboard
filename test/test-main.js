/*
* 3/25/2015
* Tom Evans
* RequireJS config for Karma unit testing
*/

'use strict';

var tests = [], re = /\-spec\.js$/;

for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (re.test(file)) {
      tests.push(file);
    }
  }
}

require.config({
  // Karma serves files from '/base'
  baseUrl: '/base/src',

  paths: {
    'jquery': '../lib/modules/jquery.min',
    'underscore': '../lib/modules/underscore-min',
    'd3': '../lib/modules/d3.min',
    'queue': '../lib/modules/queue.min',
    'text': '../lib/modules/text',
    'json': '../lib/modules/json',
    'spinner': '../lib/modules/spin.min',
    'slider': '../lib/modules/bootstrap-slider',
    'dropdownCheckbox': '../lib/modules/bootstrap-dropdown-checkbox.min'
  },

  shim: {
    'd3': {
      exports: 'd3'
    },
    'underscore': {
      exports: '_'
    }
  },
  // sets the timeout, default is 7sec, 0 disables timeout
  waitSeconds:0,

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
