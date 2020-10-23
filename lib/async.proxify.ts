import {sleep} from './utils';

function proxifyAsync(resultPromise, chainMehod: {[k: string]: (...args: any[]) => any}, fromResult = false, originalCaller) {
  let proxifiedResult = resultPromise;
  let wasRecallableInit = false;
  let callableCount = null;
  let callableInterval = null;

  const callQueue = [];

  const proxed = new Proxy({}, {
    get(_t, p) {

      if (p === 'asyncCallable') {
        return function(count: number, interval = 500) {
          wasRecallableInit = true;
          if (typeof count !== 'number' || count < 1) {
            throw new Error('"count" should be number with value more than 1');
          }
          if (typeof interval !== 'number' || interval < 1) {
            throw new Error('"interval" should be number with value more than 1');
          }
          callableCount = count;
          callableInterval = interval;
          return proxed;
        };
      }

      if (p === 'toJSON') {
        return function() {
          if (fromResult) {
            return proxifiedResult;
          } else {
            return resultPromise;
          }
        };
      }

      if (chainMehod[p as string]) {
        return function(...expectation) {
          callQueue.push(
            async function() {
              const resolved = await resultPromise;
              return chainMehod[p as string](...expectation, resolved);
            }
          );
          return proxed;
        };
      } else if (p === 'then' || p === 'catch') {
        if (!callQueue.length) {
          return function(...args) {
            return resultPromise[p].call(resultPromise, ...args);
          };
        } if (callQueue.length === 1) {
          return async function(onRes, onRej) {
            const result = await callQueue[0]().catch(onRej);
            if (fromResult) {
              return result;
            }
            return resultPromise[p].call(resultPromise, onRes, onRej);
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
          return resultPromise[p].call(resultPromise, onRes, onRej);
        };
      }
    }
  });
  return proxed;
}

export {
  proxifyAsync
};
