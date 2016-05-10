import {expect} from 'chai';

describe('test', function() {
  it('should handle browser flag', function() {
    expect(process.browser).to.be.true;
  });
});
