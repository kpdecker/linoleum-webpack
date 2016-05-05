import Gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';

import {Server as KarmaServer} from 'karma';

import plumber from '@kpdecker/linoleum/src/plumber';

import {BUILD_TARGET, COVERAGE_TARGET, MOCHA_TIMEOUT} from '@kpdecker/linoleum/config';

// This task hierarchy is to hack around
// https://github.com/sindresorhus/gulp-mocha/issues/112
Gulp.task('test:server:run', function() {
  global.__coverage__ = {};

  return Gulp.src(`${BUILD_TARGET}/$test$/*.js`)
      .pipe(plumber())
      .pipe(mocha({reporter: 'dot', timeout: MOCHA_TIMEOUT}));
});
Gulp.task('test:server', ['test:server:run'], function() {
  if (process.env.NO_COVER) {   // eslint-disable-line no-process-env
    return;
  }

  return Gulp.src(`${BUILD_TARGET}/$test$/*.js`)
      .pipe(istanbul.writeReports({
        coverageVariable: '__coverage__',
        dir: COVERAGE_TARGET,
        reporters: [ 'json' ],
        reportOpts: { dir: `${COVERAGE_TARGET}/webpack` }
      }));
});

Gulp.task('test:web', function(done) {
  new KarmaServer({
    configFile: `${__dirname}/../src/karma.js`,
    singleRun: true
  }, done).start();
});
