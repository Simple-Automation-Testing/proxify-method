import {expect} from 'chai';
import {chainProxify} from '../lib';

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
  expect(status).to.equal(expectedStatus);
}

function assertBody(expectedBodyPart, {body}) {
  expect(body).to.include(expectedBodyPart);
}

function assertHeaders(expectedHeaderKey, {headers}) {
  expect(headers).to.include(expectedHeaderKey);
}

class MainIterface {
  protected req: typeof noop;

  constructor() {
    this.req = noop;
    chainProxify('assertStatus', assertStatus)
      .chainProxify('assertBody', assertBody)
      .chainProxify('assertHeader', assertHeaders)
      .initChainModel(this);
  }
}


interface IResponseData extends Promise<{status: number; body: any; headers: any;}> {
  assertStatus(status: number): IResponseData;
  assertBody(bodyPart: number): IResponseData;
  assertHeader(headerKey: string): IResponseData;
}


class SomeControllerApi extends MainIterface {
  constructor() {
    super();
  }

  getDataMethod1(): IResponseData {
    return this.req.get() as any;
  }

  postDataMethod2(): IResponseData {
    return this.req.post() as any;
  }
}

export {
  SomeControllerApi
};
