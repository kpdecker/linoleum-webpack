var Gulp = require('gulp'),

    Linoleum = require('@kpdecker/linoleum');

var LinoluemWebpack = require('./index');

Gulp.task('build', ['clean', 'lint'], function(done) {
  Linoleum.runTask('webpack', done);
});
Gulp.task('cover', ['build'], function(done) {
  Linoleum.runTask(['cover:untested', 'cover:server', 'cover:web', 'cover:report'], done);
});

Linoleum.watch(Linoleum.jsFiles(), 'cover', {
  onChange: LinoluemWebpack.watchHandler
});

Gulp.task('travis', function(done) {
  Linoleum.runTask(['cover'], done);
});
Gulp.task('default', ['cover']);

require('@kpdecker/linoleum/Gulpfile.local');
