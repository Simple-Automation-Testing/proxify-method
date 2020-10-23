import {expect, AssertionError} from 'assertior';
import {SomeControllerOwnMethodsApi} from '../specs_setup/from.chai.from.parent.methods';

describe('Unit tests async parent method', function() {
  const someController = new SomeControllerOwnMethodsApi();

  it('positive default usage', async function() {
    const {status, body, headers} = await someController.getDataMethod1();
    expect(status).toExist;
    expect(body).toExist;
    expect(headers).toExist;
  });

  it('positive chain usage', async function() {
    const {status, body} = await someController.getDataMethod1().assertStatus(200).assertBodyInclude(1);
    expect(status).toEqual(200);
    expect(body).toExist;
  });

  it('positive chain usage without name as an argument', async function() {
    const {status, body} = await someController.getDataMethod1()
      .assertStatus(200);
    expect(status).toEqual(200);
    expect(body).toExist;
  });

  it('positive chain few usage without name as an argument', async function() {
    const {status, body} = await someController.getDataMethod1()
      .assertStatus(200);
    expect(status).toEqual(200);
    expect(body).toExist;
  });

  it('positive chain usage few arguments in asserter', async function() {
    const {status, body} = await someController.getDataMethod1().assertResponsePropEqual('status', 200);
    expect(status).toEqual(200);
    expect(body).toExist;
  });
});