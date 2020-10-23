import {expect} from 'assertior';
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
  expect(status).toEqual(expectedStatus);
}

function assertBodyInclude(expectedBodyPart, {body}) {
  expect(body).arrayIncludesMembers(expectedBodyPart);
}

function assertResponsePropEqual(prop: string, expectedValue: any, resolved) {
  expect(resolved[prop]).toEqual(expectedValue);
}

interface ITypicalData {
  status: number;
  body: any;
  headers: any;
}

interface IResponseData extends Promise<ITypicalData> {
  assertStatus(status: number): IResponseData;
  assertBodyInclude(bodyPart: number): IResponseData;
  assertResponsePropEqual(prop: string, expectedValue: any): IResponseData;
}

interface IDataExtended extends ITypicalData {
  assertStatus(status: number): IDataExtended;
  assertBodyInclude(bodyPart: number): IDataExtended;
  assertResponsePropEqual(prop: string, expectedValue: any): IResponseData;
}


class SomeControllerOwnMethodsApi {
  private req: typeof noop;
  constructor() {
    this.req = noop;
    chainProxify('assertStatus', assertStatus)
      .chainProxify('assertBodyInclude', assertBodyInclude)
      .chainProxify('assertResponsePropEqual', assertResponsePropEqual)
      .initChainModel(this);
  }

  getDataMethod1(): IResponseData {
    return this.req.get() as any;
  }


  getDataMethod1Sync(): IDataExtended {
    return {
      status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}
    } as any;
  }
}

export {
  SomeControllerOwnMethodsApi
};
