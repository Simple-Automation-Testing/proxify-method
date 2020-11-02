import {proxifyIt} from '../lib';
import {expect} from 'assertior';

const firstNoop = (arg): any => new Promise((res) => {
  const success = {body: {test: true}, status: 200};
  const error = {body: {test: false}, status: 404};
  const result = arg ? success : error;
  setTimeout(() => {
    res(result);
  }, 150);
});
const secondNoop = (arg): any => new Promise((res) => {
  const success = {body: {test: true}, status: 201};
  const error = {body: {test: false}, status: 401};
  const result = arg ? success : error;
  setTimeout(() => res(result), 150);
});

interface ITypicalData {
  status: number;
  body: {[k: string]: any};
}

interface IResponseData extends Promise<ITypicalData> {
  assertStatus(status: number): IResponseData;
  method2(arg?: number): IResponseData;
  method1(arg?: number): IResponseData;
}

interface IResponseDataSync extends ITypicalData {
  assertStatus(status: number): IResponseDataSync;
  syncMethod1(arg?: number): IResponseDataSync;
  syncMethod2(arg?: number): IResponseDataSync;
}

function assertStatus(value, data) {
  console.log('HERE');
  expect(value).toEqual(data.status);
  return data;
}


class Controller {
  private item: any;
  constructor() {
    //
  }

  set _item(val) {
    this.item = val;
  }

  get _item() {
    return this.item;
  }

  syncMethod1(arg): IResponseDataSync {
    const success = {body: {test: true}, status: 200};
    const error = {body: {test: false}, status: 404};
    const result = arg ? success : error;
    return result as any;
  }

  syncMethod2(arg): IResponseDataSync {
    const success = {body: {test: true}, status: 201};
    const error = {body: {test: false}, status: 401};
    const result = arg ? success : error;
    return result as any;
  }

  method2(arg?): IResponseData {
    return secondNoop(arg);
  }
  method1(arg?): IResponseData {
    return firstNoop(arg);
  }
}

proxifyIt()
  .addChain(assertStatus)
  .baseOnPrototype()(Controller);

const controller = new Controller();

// testIt();
async function testIt() {
  const resulter = await controller
    .method1(1)
    .assertStatus(200)
    .method2(0)
    .assertStatus(401);
  expect(resulter.status).toEqual(401);
}

testItSync();
function testItSync() {
  const test = controller
    .syncMethod1(1)
    .assertStatus(200)
    .syncMethod2();

  console.log(test.status);
}
