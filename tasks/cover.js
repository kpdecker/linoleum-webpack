import Gulp from 'gulp';
import istanbul from 'gulp-istanbul';
import mocha from 'gulp-mocha';

import {Server as KarmaServer} from 'karma';

import plumber from '@kpdecker/linoleum/src/plumber';

import {BUILD_TARGET, COVERAGE_TARGET} from '@kpdecker/linoleum/config';

// This task hierarchy is to hack around
// https://github.com/sindresorhus/gulp-mocha/issues/112
Gulp.task('cover:server:run', function() {
  global.__coverage__ = {};

  return Gulp.src(`${BUILD_TARGET}/$cover$/*.js`)
      .pipe(plumber())
      .pipe(mocha());
});
Gulp.task('cover:server', ['cover:server:run'], function() {
  return Gulp.src(`${BUILD_TARGET}/$cover$/*.js`)
      .pipe(istanbul.writeReports({
        coverageVariable: '__coverage__',
        dir: COVERAGE_TARGET,
        reporters: [ 'json' ],
        reportOpts: { dir: `${COVERAGE_TARGET}/webpack` }
      }));
});

Gulp.task('cover:web', function(done) {
  new KarmaServer({
    configFile: `${__dirname}/../src/karma.js`,
    singleRun: true
  }, done).start();
});
