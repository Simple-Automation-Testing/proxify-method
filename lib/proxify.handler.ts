import {sleep} from './utils';
import {isPromise, isFunction, logger} from 'sat-utils';
const {LOG_LEVEL = 'VERBOSE'} = process.env;

logger.setLogLevel(LOG_LEVEL);
/**
 * @info
 * @resulter can be a promise or any data
 */

function proxifyHadler(originalCaller, context, chainers: {[k: string]: (...args: any[]) => any}, config: any = {}) {
  const {fromResult = false} = config;
  /**
   * @info
   * this is required for sync call execution
   */
  let proxifiedResult = originalCaller();

  let proxed = new Proxy(proxifiedResult, {

    get(_t, p) {
      if (p === 'toJSON') {
        return function() {
          return proxifiedResult;
        };
      }

      if (chainers[p as string] && isPromise(proxifiedResult)) {
        /** @info logging */
        logger.info('add to chain chainers function: ', p as string);
        return function(...expectation) {
          async function handler() {
            const resolved = await proxifiedResult;
            return chainers[p as string](...expectation, resolved);
          }
          proxifiedResult = handler();
          return proxed;
        };
      } else if (chainers[p as string] && !isPromise(proxifiedResult)) {
        /** @info logging */
        logger.info('add sync call to chain chainers function: ', p as string);
        return function(...expectation) {
          const result = chainers[p as string](...expectation, proxifiedResult);
          /** @info for sync proxing approach */

          if (fromResult) {
            proxifiedResult = result;
          }
          return proxed;
        };
      } else if (isFunction(context[p])) {
        /** @info logging */
        const handler = this;
        logger.info('add to chain context function: ', p as string);
        return function(...args) {
          proxifiedResult = context[p].call(context, ...args);


          /** @info this is required for sync execution and context */
          proxed = new Proxy(proxifiedResult, handler);
          return proxed;
        };
      } else if (p === 'then' || p === 'catch') {
        /** @info logging */
        logger.info('start call promise: ', p as string);
        if (!isPromise(proxifiedResult)) {
          return proxifiedResult;
        }
        return async function(onRes, onRej) {
          const catcher = p === 'catch' ? onRes : onRej;

          proxifiedResult = await proxifiedResult
            .catch((error) => ({error, ____proxed____error: true}));

          if (proxifiedResult && proxifiedResult.____proxed____error) {
            return catcher(proxifiedResult.error);
          }

          const promised = Promise.resolve(proxifiedResult);
          return promised[p].call(promised, onRes, onRej);
        };
      } else if (proxifiedResult[p]) {
        return proxifiedResult[p];
      }
    },

    /** @info basics */

    getPrototypeOf(_t) {
      return Object.getPrototypeOf(proxifiedResult);
    },
    ownKeys(_t) {
      return Object.getOwnPropertyNames(proxifiedResult);
    },
    getOwnPropertyDescriptor(_t, p) {
      return Object.getOwnPropertyDescriptor(proxifiedResult, p);
    }
  });

  return proxed;
}

export {
  proxifyHadler
};
