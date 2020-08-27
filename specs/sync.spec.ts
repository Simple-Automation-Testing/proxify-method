import {expect} from 'chai';
import {SomeControllerApi} from './_setup.from.chai.from.parent';

describe('Unit tests sync end user interface', function() {
  const someController = new SomeControllerApi();

  it('positive default usage', function() {
    const {status, body, headers} = someController.postDataMethod2Sync();
    expect(status).to.be.exist;
    expect(body).to.be.exist;
    expect(headers).to.be.exist;
  });

  it('positive chain usage', function() {
    const {status, body} = someController.postDataMethod2Sync().assertStatus(200).assertBodyInclude(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  it('positive full chain', function() {
    const {status, body} = someController.postDataMethod2Sync()
      .assertStatus(200)
      .assertBodyInclude(1)
      .assertStatus(200)
      .assertBodyInclude(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  it('negative chain', function() {
    try {
      someController.postDataMethod2Sync().assertStatus(202);
    } catch (error) {
      expect(error.toString()).to.include('expected 200 to equal 202');
    }
  });

  it('negative chain second call failed', function() {
    try {
      someController.postDataMethod2Sync()
        .assertStatus(200)
        // not exists in body
        .assertBodyInclude(10000);
    } catch (error) {
      expect(error.toString()).to.include('to include 10000');
    }
  });

  it('negative chain first call failed', function() {
    try {
      someController.postDataMethod2Sync()
        .assertBodyInclude(10000)
        .assertStatus(200);
      // not exists in body
    } catch (error) {
      expect(error.toString()).to.include('to include 10000');
    }
  });

  it('negative chain last after few calls', function() {
    try {
      someController.postDataMethod2Sync()
        .assertStatus(200)
        .assertStatus(200)
        .assertBodyInclude(1)
        .assertBodyInclude(1)
        .assertStatus(200)
        .assertBodyInclude(10000);
      // not exists in body
    } catch (error) {
      expect(error.toString()).to.include('to include 10000');
    }
  });

  it('iteration assertion should not be in for in', function() {
    const result = someController.postDataMethod2Sync();
    const keys = [];
    for (const k in result) {
      keys.push(k);
    }
    expect(keys).to.eql(['status', 'body', 'headers']);
    expect('assertStatus' in result).to.equal(false);
  });

  it('toString', function() {
    const result = someController.postDataMethod2Sync();
    expect(result.toString()).to.eql('[object Object]');
  });

  it('array data', function() {
    const result = someController.getArrayData();
    expect(result[0]).to.eql(1);
    const resultReduce = result.reduce((acc, item) => {
      acc += item;
      return acc;
    });
    expect(resultReduce).to.eql(15);
    expect(Array.isArray(result)).to.equal(true);
  });

  it('array data chain', function() {
    const result = someController.getArrayData().assertArray(1);
    expect(Array.isArray(result)).to.equal(true);
  });

  it('array data chain negative', function() {
    try {
      someController.getArrayData().assertArray(1000);
    } catch (error) {
      expect(error.toString()).to.include('to include 1000');
    }
  });
});
