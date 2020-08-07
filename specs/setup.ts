import {expect} from 'chai';
import {setUpChain} from '../lib';

const noop = {
  // noop http method get
  get: () => new Promise((res) => setTimeout(() => res({
    status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}
  }), 100)),
  // noop http method post
  post: () => new Promise((res) => setTimeout(() => res({
    status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}
  }), 250)),
};


function assertStatus(expectedStatus, {status}) {
  expect(status).to.equal(expectedStatus)
}

function assertBody(expectedBodyPart, {body}) {
  expect(body).to.include(expectedBodyPart);
}

function assertHeaders(expectedHeaderKey, {headers}) {
  expect(headers).to.include(expectedHeaderKey)
}

class MainIterface {
  protected req: typeof noop;

  constructor() {
    this.req = noop;

    setUpChain('assertStatus', assertStatus)
      .setUpChain('assertBody', assertBody)
      .setUpChain('assertHeader', assertHeaders)
      .initChainModel(this);
  }
}


class SomeControllerApi extends MainIterface {
  constructor() {
    super();
  }

  getDataMethod1() {
    return this.req.get();
  }

  postDataMethod2() {
    return this.req.post();
  }
}

export {
  SomeControllerApi
};
