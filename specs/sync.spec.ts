import {expect} from 'chai';
import {SomeControllerApi} from './setup';

describe('Unit tests sync end user interface', function() {
  const someController = new SomeControllerApi();

  it('positive default usage', function() {
    const {status, body, headers} = someController.postDataMethod2Sync();
    expect(status).to.be.exist;
    expect(body).to.be.exist;
    expect(headers).to.be.exist;
  });

  it('positive chain usage', function() {
    const {status, body} = someController.getDataMethod1Sync().assertStatus(200).assertBodyInclude(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  it('positive full chain', async function() {
    const {status, body} = await someController.getDataMethod1Sync()
      .assertStatus(200)
      .assertBodyInclude(1)
      .assertStatus(200)
      .assertBodyInclude(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  // it()
});
