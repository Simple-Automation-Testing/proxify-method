import {expect} from 'chai';
import {SomeControllerApi} from './setup';

describe('Unit tests', function() {
  const someController = new SomeControllerApi();

  it('positive default usage', async function() {
    const {status, body, headers} = await someController.getDataMethod1();
    expect(status).to.be.exist;
    expect(body).to.be.exist;
    expect(headers).to.be.exist;
  });

  it('positive chain usage', async function() {
    const {status, body} = await someController.getDataMethod1().assertStatus(200).assertBody(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

  it('positive full chain', async function() {
    const {status, body} = await someController.postDataMethod2()
      .assertStatus(200)
      .assertBody(1)
      .assertStatus(200)
      .assertBody(1);
    expect(status).to.eql(200);
    expect(body).to.be.exist;
  });

});
