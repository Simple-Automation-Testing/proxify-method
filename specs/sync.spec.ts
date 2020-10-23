import {expect} from 'assertior';
import {SomeControllerApi} from '../specs_setup/from.chai.from.parent';

describe('Unit tests sync end user interface', function() {
  const someController = new SomeControllerApi();

  it('positive default usage', function() {
    const {status, body, headers} = someController.getDataMethod1Sync();
    expect(status).toExist;
    expect(body).toExist;
    expect(headers).toExist;
  });

  it('positive chain usage', function() {
    const {status, body} = someController.getDataMethod1Sync().assertStatus(200).assertBodyInclude(1);
    expect(status).toEqual(200);
    expect(body).toExist;
  });

  it('positive full chain', function() {
    const {status, body} = someController.getDataMethod1Sync()
      .assertStatus(200)
      .assertBodyInclude(1)
      .assertStatus(200)
      .assertBodyInclude(1);
    expect(status).toEqual(200);
    expect(body).toExist;
  });

  it('negative chain', function() {
    try {
      someController.getDataMethod1Sync().assertStatus(202);
    } catch (error) {
      expect(error.toString()).stringIncludesSubstring('200 to equal 202');
    }
  });

  it('negative chain second call failed', function() {
    try {
      someController.getDataMethod1Sync()
        .assertStatus(200)
        // not exists in body
        .assertBodyInclude(10000);
    } catch (error) {
      expect(error.toString()).stringIncludesSubstring('to include 10000');
    }
  });

  it('negative chain first call failed', function() {
    try {
      someController.getDataMethod1Sync()
        .assertBodyInclude(10000)
        .assertStatus(200);
      // not exists in body
    } catch (error) {
      expect(error.toString()).stringIncludesSubstring('to include 10000');
    }
  });

  it('negative chain last after few calls', function() {
    try {
      someController.getDataMethod1Sync()
        .assertStatus(200)
        .assertStatus(200)
        .assertBodyInclude(1)
        .assertBodyInclude(1)
        .assertStatus(200)
        .assertBodyInclude(10000);
      // not exists in body
    } catch (error) {
      expect(error.toString()).stringIncludesSubstring('to include 10000');
    }
  });

  it('iteration assertion should not be in for in', function() {
    const result = someController.getDataMethod1Sync();
    const keys = [];
    for (const k in result) {
      keys.push(k);
    }
    expect(keys).toDeepEqual(['status', 'body', 'headers']);
    expect('assertStatus' in result).toEqual(false);
  });

  it('toString', function() {
    const result = someController.getDataMethod1Sync();
    expect(result.toString()).toEqual('[object Object]');
  });
});
