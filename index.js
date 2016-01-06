/* eslint-disable no-var */
var Linoleum = require('@kpdecker/linoleum');

require('./tasks/cover');
require('./tasks/karma');

var webpack = require('./tasks/webpack');

// Config values. May be overriden prior to tasks executing.
Linoleum.CLIENT_ENTRY = './src/bootstrap';
Linoleum.KARMA_TEST_FILES = ['test/karma/**/*.js'];

Linoleum.SERVER_PORT = 3000;
Linoleum.DEV_SERVER_PORT = 3001;

var $jsFiles = Linoleum.jsFiles;
Linoleum.jsFiles = function() {
  return $jsFiles().concat(Linoleum.KARMA_TEST_FILES);
};

var $testFiles = Linoleum.testFiles;
Linoleum.testFiles = function() {
  return $testFiles().concat(
    Linoleum.KARMA_TEST_FILES.map(function(file) {
      return '!' + file;    // eslint-disable-line prefer-template
    }));
};

module.exports.watchHandler = webpack.watchHandler;
