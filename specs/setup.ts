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
  assertStatus(status: number): IResponseDataSync & IResponseData;
  syncMethod1(arg?: number): IResponseDataSync & IResponseData;
  syncMethod2(arg?: number): IResponseDataSync & IResponseData;
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

function getController() {
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
  return Controller;
}


export {
  getController
};
