/*
* 3/24/3015
* Tom Evans
*
*/

'use strict';

require.config({
  baseUrl: 'src',
  paths: {
    'jquery': '../lib/modules/jquery.min',
    'underscore':'../lib/modules/underscore-min',
    'd3': '../lib/modules/d3.min',
    'queue': '../lib/modules/queue.min',
    'text': '../lib/modules/text',
    'json': '../lib/modules/json',
    'spinner': '../lib/modules/spin.min',
    'slider': '../lib/modules/bootstrap-slider',
    'dropdownCheckbox': '../lib/modules/bootstrap-dropdown-checkbox.min',
    'select2': '../lib/modules/select2.min',
    'app': 'app'
  },
  deps: ['app']

});
