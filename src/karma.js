import karmaWebpack from 'karma-webpack';
import karmaSourcemap from 'karma-sourcemap-loader';
import karmaMocha from 'karma-mocha';
import karmaChrome from 'karma-chrome-launcher';
import karmaFirefox from 'karma-firefox-launcher';
import karmaCoverage from 'karma-coverage';
import karmaMochaReporter from 'karma-mocha-reporter';
import loadWebpackConfig from './webpack';

import {MOCHA_TIMEOUT, WATCHING} from '@kpdecker/linoleum/config';

import {resolve} from 'path';

let sourceFile = `${__dirname}/webpack-web-test.js`;

module.exports = function(config) {
  let webpack = loadWebpackConfig({cover: true});

  // We only need the test asset here
  delete webpack.entry;

  config.set({
    browsers: [process.env.KARMA_BROWSER || 'Firefox'],    // eslint-disable-line no-process-env
    reporters: ['mocha', 'coverage'],

    files: [
      sourceFile
    ],

    preprocessors: {
      [sourceFile]: ['webpack', 'sourcemap']
    },

    webpack,

    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: !WATCHING
      }
    },

    client: {
      mocha: {
        timeout: MOCHA_TIMEOUT
      }
    },
    mochaReporter: {
      output: 'minimal'
    },
    coverageReporter: {
      type: 'json',
      dir: resolve('coverage/karma/')
    },

    plugins: [
      karmaWebpack,
      karmaSourcemap,
      karmaMocha,
      karmaChrome,
      karmaFirefox,
      karmaCoverage,
      karmaMochaReporter
    ],
    frameworks: ['mocha']
  });
};
