import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

import {CLIENT_ENTRY, BUILD_TARGET} from '@kpdecker/linoleum/config';
import BABEL_DEFAULTS from '@kpdecker/linoleum/babel-defaults';

// Every non-relative module is external
// abc -> require("abc")
export function nodeExternals(context, request, cb) {
  if (/^[@a-z\/\-0-9]+$/i.test(request)) {
    // We need to force lookup from the global require here, while avoiding exporting
    // the library type under electron as this fails when trying to assign to module
    // in the renderer context.
    cb(undefined, request, 'commonjs2');
  } else {
    cb();
  }
}

export default function(options = {}) {
  let isProduction = process.env.NODE_ENV === 'production',    // eslint-disable-line no-process-env
      cssLoader,
      cssLoaderPrebuilt,
      stylusLoader,
      cssModuleNames = isProduction ? `[hash:base64:5]` : `[name]---[local]`,
      cssParams = `?modules&localIdentName=${cssModuleNames}`;
  if (options.node) {
    cssLoaderPrebuilt = `${require.resolve('css-loader/locals')}`;
    cssLoader = `${cssLoaderPrebuilt}${cssParams}`;
    stylusLoader = `${cssLoaderPrebuilt}${cssParams}!stylus-loader`;
  } else {
    let baseLoader = `${require.resolve('css-loader')}`;
    cssLoaderPrebuilt = ExtractTextPlugin.extract(
          require.resolve('style-loader'),
          baseLoader);
    stylusLoader = ExtractTextPlugin.extract(
          require.resolve('style-loader'),
          `${baseLoader}${cssParams}!stylus-loader`
        );
    cssLoader = ExtractTextPlugin.extract(
          require.resolve('style-loader'),
          `${baseLoader}${cssParams}`
        );
  }

  let target = 'web',
      babelOptions;
  if (options.node) {
    target = 'node';
  }

  if (options.cover) {
    babelOptions = {
      auxiliaryCommentBefore: 'istanbul ignore start',
      auxiliaryCommentAfter: 'istanbul ignore end'
    };
  }

  let ret = {
    target,
    entry: options.entry || {
      bootstrap: CLIENT_ENTRY
    },
    output: {
      path: options.path || `${BUILD_TARGET}/$client$/`,
      filename: '[name].js',
      publicPath: '/static/',
      libraryTarget: options.node ? 'commonjs2' : 'var',
      pathinfo: !isProduction
    },

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: require.resolve('babel-loader'),
          exclude: /(node_modules(?!\/@kpdecker\/linoleum(?:-[^/]+)?\/src)|bower_components)/,
          query: {
            plugins: [],
            ... BABEL_DEFAULTS,
            ... babelOptions,

            // Babel Loader does not support inline source maps that are being used elsewhere, so
            // we need to reset
            sourceMap: 'source-map'
          },
          babel: true
        },

        {
          test: /\.css$/,
          loader: cssLoader,
          exclude: /node_modules|bower_components/
        },
        {
          test: /(node_modules|bower_components)\/.*\.css$/,
          loader: cssLoaderPrebuilt
        },

        {
          test: /\.styl$/,
          loader: stylusLoader,
          exclude: /node_modules|bower_components/
        },

        {
          test: /\.json$/,
          loader: require.resolve('json-loader')
        },
        {
          test: /\.(?:png|jpe?g|gif|svg)/,
          loader: `${require.resolve('url-loader')}?limit=5000`
        },

        {
          test: /\/sinon\/.*\.js$/,
          loader: `${require.resolve('imports-loader')}?define=>false,require=>false`
        }
      ],

      postLoaders: options.cover ? [{
        test: /\.jsx?$/,
        loader: require.resolve('./istanbul-instrumenter-loader'),
        exclude: /(test|node_modules|linoleum\/src)\//
      }] : []
    },

    plugins: [
      new webpack.NoErrorsPlugin()
    ],

    externals: options.node ? [nodeExternals] : {},

    node: {
      console: false,
      global: true,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false
    },

    resolve: {
      alias: {
        project: process.cwd(),
        sinon: 'sinon/pkg/sinon'
      },
      extensions: options.node
          ? ['', '.server.js', '.jsx', '.js']
          : ['', '.web.js', '.jsx', '.js']
    },

    // Must use inline source maps for proper coverage mapping
    devtool: !options.cover ? 'source-map' : 'inline-source-map'
  };

  if (!options.node) {
    ret.plugins.push(
      new ExtractTextPlugin('[name].css', {allChunks: true})
    );
  }

  // Strip development code
  if (isProduction) {
    ret.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': '"production"'
        }
      })
    );
  } else if (!options.node) {
    ret.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': '"development"'
        }
      })
    );
  }
  if (isProduction && !options.node) {
    ret.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: true,
        mangle: true
      })
    );
  }

  return ret;
}
