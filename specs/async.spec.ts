import {expect} from 'chai';
import {SomeControllerApi} from './setup';

describe('Unit tests async end user interface', function() {
  const someController = new SomeControllerApi();

  it('positive default usage', async function() {
    const {status, body, headers} = await someController.getDataMethod1();
    expect(status).to.be.exist;
    expect(body).to.be.exist;
    expect(headers).to.be.exist;
  });

  it('positive chain usage', async function() {
    const {status, body} = await someController.getDataMethod1().assertStatus(200).assertBodyInclude(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  it('positive full chain', async function() {
    const {status, body} = await someController.postDataMethod2()
      .assertStatus(200)
      .assertBodyInclude(1)
      .assertStatus(200)
      .assertBodyInclude(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  it('negative chain', async function() {
    try {
      await someController.postDataMethod2().assertStatus(202);
    } catch (error) {
      expect(error.toString()).to.include('expected 200 to equal 202');
    }
  });

  it('negative chain second call failed', async function() {
    try {
      await someController.postDataMethod2()
        .assertStatus(200)
        // not exists in body
        .assertBodyInclude(10000);
    } catch (error) {
      expect(error.toString()).to.include('to include 10000');
    }
  });

  it('negative chain first call failed', async function() {
    try {
      await someController.postDataMethod2()
        .assertBodyInclude(10000)
        .assertStatus(200);
      // not exists in body
    } catch (error) {
      expect(error.toString()).to.include('to include 10000');
    }
  });
});
