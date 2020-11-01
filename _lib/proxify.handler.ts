import {sleep} from './utils';

/**
 * @info
 * @initialExecutionResult can be a promise or any data
 */

function proxifyHadler(initialExecutionResult, chainers: {[k: string]: (...args: any[]) => any}, originalCaller, config: any = {}) {
  const {fromResult = false} = config;

  let proxifiedResult = initialExecutionResult;

  const callQueue = [];

  const proxed = new Proxy({}, {
    get(_t, p) {
      if (p === 'toJSON') {
        return function() {
          if (fromResult) {
            return proxifiedResult;
          } else {
            return initialExecutionResult;
          }
        };
      }

      if (chainers[p as string]) {
        return function(...expectation) {
          callQueue.push(
            async function() {
              const resolved = await initialExecutionResult;
              return chainers[p as string](...expectation, resolved);
            }
          );
          return proxed;
        };
      } else if (p === 'then' || p === 'catch') {
        if (!callQueue.length) {
          return function(...args) {
            return initialExecutionResult[p].call(initialExecutionResult, ...args);
          };
        } if (callQueue.length === 1) {
          return async function(onRes, onRej) {
            const result = await callQueue[0]().catch(onRej);
            if (fromResult) {
              return result;
            }
            return initialExecutionResult[p].call(initialExecutionResult, onRes, onRej);
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
          return initialExecutionResult[p].call(initialExecutionResult, onRes, onRej);
        };
      }
    }
  });
  return proxed;
}

export {
  proxifyHadler
};
