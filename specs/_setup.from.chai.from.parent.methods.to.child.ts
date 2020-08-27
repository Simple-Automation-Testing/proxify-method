import {expect} from 'chai';
// import {chainProxify} from 'proxify-method';
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


function assertArray(expectedArrayPart, arr) {
  expect(arr).to.include(expectedArrayPart);
}

function assertStatus(expectedStatus, {status}) {
  expect(status).to.equal(expectedStatus);
}

function assertBodyInclude(expectedBodyPart, {body}) {
  expect(body).to.include(expectedBodyPart);
}

function assertResponsePropEqual(prop: string, expectedValue: any, resolved) {
  expect(resolved[prop]).to.equal(expectedValue);
}

function assertHeaders(expectedHeaderKey, {headers}) {
  expect(headers).to.include(expectedHeaderKey);
}

function assertHeadersToBeExist({headers}) {
  expect(headers).to.exist;
}

function assertStatusEqual200({status}) {
  expect(status).to.equal(200);
}

interface ITypicalData {
  status: number;
  body: any;
  headers: any;
}

interface IResponseData extends Promise<ITypicalData> {
  assertStatus(status: number): IResponseData;
  assertBodyInclude(bodyPart: number): IResponseData;
  assertHeader(headerKey: string): IResponseData;
  assertResponsePropEqual(prop: string, expectedValue: any): IResponseData;
  assertStatusEqual200(): IResponseData;
  assertHeadersToBeExist(): IResponseData;
}

interface IDataExtended extends ITypicalData {
  assertStatus(status: number): IDataExtended;
  assertBodyInclude(bodyPart: number): IDataExtended;
  assertHeader(headerKey: string): IDataExtended;
}

interface IDataExtendedArray extends Array<number> {
  assertArray(arrPart: number): IDataExtendedArray;
}

class SomeControllerOwnMethodsApi {
  private req: typeof noop;
  private __proto__;
  constructor() {
    this.req = noop;
    chainProxify(assertStatusEqual200)
      .chainProxify(assertHeadersToBeExist)
      .chainProxify('assertStatus', assertStatus)
      .chainProxify('assertBodyInclude', assertBodyInclude)
      .chainProxify('assertHeader', assertHeaders)
      .chainProxify('assertArray', assertArray)
      .chainProxify('assertResponsePropEqual', assertResponsePropEqual)
      .initChainModel(this.__proto__, this);
  }

  getDataMethod1(): IResponseData {
    return this.req.get() as any;
  }

  postDataMethod2(): IResponseData {
    return this.req.post() as any;
  }

  getDataMethod1Sync(): IDataExtended {
    return {
      status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}
    } as any;
  }

  postDataMethod2Sync(): IDataExtended {
    return {
      status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}
    } as any;
  }

  getArrayData(): IDataExtendedArray {
    return [1, 2, 3, 4, 5] as IDataExtendedArray;
  }
}

class ChildExpectedDecorated extends SomeControllerOwnMethodsApi {
  constructor() {
    super();
  }
}

export {
  ChildExpectedDecorated
};
