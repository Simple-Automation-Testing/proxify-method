import {sleep} from './utils';
import {isPromise, isFunction} from 'sat-utils';
/**
 * @info
 * @resulter can be a promise or any data
 */

function proxifyHadler(resulter, originalCaller, context, chainers: {[k: string]: (...args: any[]) => any}, config: any = {}) {
  const {fromResult = false} = config;

  let proxifiedResult = resulter;

  const callQueue = [];

  const proxed = new Proxy({}, {
    get(_t, p) {
      if (p === 'toJSON') {
        return function() {
          if (fromResult) {
            return proxifiedResult;
          } else {
            return resulter;
          }
        };
      }

      if (chainers[p as string]) {
        return function(...expectation) {
          async function asyncHadler() {
            const resolved = await resulter;
            return chainers[p as string](...expectation, resolved);
          }

          async function syncHadler() {
            const resolved = resulter;
            return chainers[p as string](...expectation, resolved);
          }
          const handler = isPromise(resulter) ? asyncHadler : syncHadler;

          callQueue.push(handler);
          return proxed;
        };
      } else if (isFunction(context[p])) {
        return function() {
          const hadler = function(...args) {
            proxifiedResult = context[p].call(context, ...args);
            return proxifiedResult;
          };

          callQueue.push(hadler);
          return proxed;
        };
      } else if (p === 'then' || p === 'catch') {
        if (!callQueue.length) {
          return function(...args) {
            return resulter[p].call(resulter, ...args);
          };
        }
        return async function(onRes, onRej) {
          const catcher = p === 'catch' ? onRes : onRej;

          for (const queuedCall of callQueue) {

            proxifiedResult = await queuedCall(fromResult ? proxifiedResult : undefined)
              .catch((error) => ({error, ____proxed____error: true}));

            if (proxifiedResult && proxifiedResult.____proxed____error) {
              return catcher(proxifiedResult.error);
            }
          }
          if (fromResult) {
            return proxifiedResult;
          }
          return resulter[p].call(resulter, onRes, onRej);
        };
      }
    }
  });
  return proxed;
}

export {
  proxifyHadler
};
