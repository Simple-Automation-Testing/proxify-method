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
  console.log(arg, 'second noop');
  const success = {body: {test: true}, status: 201};
  const error = {body: {test: false}, status: 401};
  const result = arg ? success : error;
  console.log(result, 'second noop result');
  setTimeout(() => {
    const success = {body: {test: true}, status: 201};
    const error = {body: {test: false}, status: 401};
    res(result);
  }, 150);
});


interface ITypicalData {
  status: number;
  body: {[k: string]: any};
}

interface IResponseData extends Promise<ITypicalData> {
  assertStatus(status: number): IResponseData;
  method2(arg: number): IResponseData;
  method1(arg: number): IResponseData;
}

function assertStatus(value, data) {
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

testIt();
async function testIt() {
  console.log('X');
  const resulter = await controller
    .method1(1)
    .assertStatus(200)
    .method2(0);

  console.log('Y');
  // .then((args) => {

  //   console.log(args, 'ARGS');

  //   return args;
  // })
  console.log('here')
  console.log(resulter, 'call result status', '!!!!!!!!!!!!');
}
// controller.method1().then(console.log);
