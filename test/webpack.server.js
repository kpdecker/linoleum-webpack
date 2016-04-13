/* eslint-disable no-process-env */
import webpack from '../src/webpack';

import {expect} from 'chai';

describe('webpack config', function() {
  let env;
  beforeEach(() => {
    env = process.env.NODE_ENV;
  });
  afterEach(() => {
    process.env.NODE_ENV = env;
  });

  it('should generate production config', function() {
    process.env.NODE_ENV = 'production';

    let config = webpack();
    expect(config.plugins).to.have.length(5);
  });
  it('should generate hot reload config', function() {
    let {module: {loaders}} = webpack({hotReload: true});
    expect(loaders.filter((loader) => loader.test.exec ? loader.test.exec('foo.global.less') : loader.test('foo.global.less'))).to.have.length(1);
  });

  it('should generate node config', function() {
    let config = webpack({node: true});
    expect(config.target).to.equal('node');
  });

  it('should export proper externals', function(done) {
    let config = webpack({node: true});
    config.externals[0](undefined, 'foo', (err, request, type) => {
      expect(err).to.not.exist;
      expect(request).to.equal('foo');
      expect(type).to.equal('commonjs2');
      done();
    });
  });
  it('should not export internals', function(done) {
    let config = webpack({node: true});
    config.externals[0](undefined, './foo', (err, request, type) => {
      expect(err).to.not.exist;
      expect(request).to.not.exist;
      expect(type).to.not.exist;
      done();
    });
  });
});
