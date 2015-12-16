import Gulp from 'gulp';
import GUtil from 'gulp-util';
import {statSync} from 'fs';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import {CLIENT_ENTRY, BUILD_TARGET, SERVER_PORT, DEV_SERVER_PORT, WATCHING} from '@kpdecker/linoleum/config';
import BABEL_DEFAULTS from '@kpdecker/linoleum/babel-defaults';

import loadWebpackConfig from '../src/webpack';

Gulp.task('webpack', function(done) {
  let configs = [],
      web = loadWebpackConfig({
        entry: {bootstrap: './src/bootstrap'}
      }),
      server = loadWebpackConfig({
        node: true,
        entry: {index: './src/index'},
        path: `${BUILD_TARGET}/`
      }),
      cover = loadWebpackConfig({
        node: true,
        cover: true,
        entry: {cover: require.resolve('../src/webpack-server-test')},
        path: `${BUILD_TARGET}/$cover$/`
      });

  if (entryExists('./src/bootstrap.js') || entryExists('./src/bootstrap.web.js')) {
    configs.push(web);
  }
  if (entryExists('./src/index.js') || entryExists('./src/index.server.js')) {
    configs.push(server);
  }
  configs.push(cover);

  webpack(configs, handleWebpack(done));
});

function entryExists(path) {
  try {
    statSync(path);
    return true;
  } catch (err) {
    return false;
  }
}

function handleWebpack(done) {
  return function(err, stats) {
    if (err) {
      throw new GUtil.PluginError('webpack', err);
    }
    GUtil.log('[webpack]', stats.toString({
      chunks: !WATCHING
    }));

    let hasErrors = (stats.stats || [stats]).reduce((prev, stat) => prev || stat.hasErrors(), false);
    if (hasErrors) {
      done(new GUtil.PluginError('webpack', 'Build completed with errors'));
    } else {
      done();
    }
  };
}

Gulp.task('webpack:dev-server', function(done) {
  // Inject the hot reloader transform into the webpack config
  BABEL_DEFAULTS.plugins = BABEL_DEFAULTS.plugins || [];
  BABEL_DEFAULTS.plugins.push([require.resolve('babel-plugin-react-transform'), {
    transforms: [{
      transform: require.resolve('react-transform-hmr'),
      imports: ['react'],
      locals: ['module']
    }]
  }]);

  let devServer = `http://localhost:${DEV_SERVER_PORT}/`,
      config = loadWebpackConfig({
        entry: {
          bootstrap: [
            `${require.resolve('webpack-dev-server/client')}?${devServer}`,
            require.resolve(`webpack/hot/only-dev-server`),
            CLIENT_ENTRY
          ]
        }
      });
  config.plugins.unshift(
    new webpack.HotModuleReplacementPlugin()
  );

  config.output.path = '/static/';
  config.output.publicPath = `${devServer}static/`;

  let server = new WebpackDevServer(webpack(config), {
    // webpack-dev-server options
    contentBase: 'http://localhost:3000/',

    hot: true,
    proxy: {
      '*': `http://localhost:${SERVER_PORT}`
    },

    // webpack-dev-middleware options
    // NOTE: We can not use lazy here as this conflicts with the proxy
    lazy: false,
    quiet: false,
    noInfo: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    },
    publicPath: '/static/',
    stats: {
      colors: true,
      chunks: false,
      version: false
    }
  });
  server.listen(DEV_SERVER_PORT, 'localhost', function() {
    console.log(`Dev server listening on ${devServer}`);    // eslint-disable-line no-console
    done();
  });
});
