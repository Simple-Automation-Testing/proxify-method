import {proxifyResultAsync} from './async.proxify';
import {proxifyResultSync} from './sync.proxify';

function proxifyResult(result, chainMehod: {[k: string]: (...args: any[]) => any}, fromResult = false) {
  if ((typeof result).includes('function')) {
    result = result();
  }
  if ((typeof result) === 'object' && result.then) {
    return proxifyResultAsync(result, chainMehod, fromResult);
  }
  return proxifyResultSync(result, chainMehod, fromResult);
}

function initChainModel(ctx, chainMehod, resultFromChain) {
  const ownProps = Object.getOwnPropertyNames(ctx.__proto__);
  const onlyMethods = ownProps.filter((k) => (typeof ctx.__proto__[k]) === 'function' && !(k === 'constructor'));
  onlyMethods.forEach((m) => {
    const currentMethod = ctx.__proto__[m];
    ctx.__proto__[m] = function(...args) {
      return proxifyResult(currentMethod.call(ctx, ...args), chainMehod, resultFromChain);
    };
  });
}

interface ISetUpChain {
  resultFromChain: boolean;
  <T>(name: string, asserter: (expectedValue: any, resolvedMethodData: T) => any): {
    chainProxify: ISetUpChain; initChainModel: (ctx: any) => void
  }
}

function setUpChain<T>(name: string, asserter: (expectedValue: any, resolvedMethodData: T) => any, _chainMehod = {}) {
  if (!(typeof asserter).includes('function')) {
    throw new Error('asserter should be a function');
  }
  _chainMehod[name] = asserter;
  return {
    chainProxify: (name: string, asserter: (...args: any[]) => any) => setUpChain(name, asserter, _chainMehod),
    initChainModel: (ctx) => {
      const resultFromChain = setUpChain.resultFromChain;
      // back to default condition, should be disabled = false
      setUpChain.resultFromChain = false;
      initChainModel(ctx, _chainMehod, resultFromChain);
    }
  };
}
setUpChain.resultFromChain = false;

const chainProxify = setUpChain as ISetUpChain;

export {
  chainProxify
};
