import {sleep} from './utils';
import {isPromise, isFunction, logger, setLogLevel} from 'sat-utils';
const {LOG_LEVEL = 'VERBOSE'} = process.env;
logger.setLogLevel(LOG_LEVEL);
/**
 * @info
 * @resulter can be a promise or any data
 */

function proxifyHadler(originalCaller, context, chainers: {[k: string]: (...args: any[]) => any}, config: any = {}) {
  const {fromResult = false} = config;

  let proxifiedResult = originalCaller();

  const callQueue = [];

  const proxed = new Proxy({}, {
    get(_t, p) {
      console.log(p)
      if (p === 'toJSON') {
        return function() {
          return proxifiedResult;
        };
      }

      if (chainers[p as string]) {
        /** @info logging */
        logger.info('add to chain chainers function: ', p as string);
        return function(...expectation) {
          async function asyncHadler() {
            const resolved = await proxifiedResult;
            return chainers[p as string](...expectation, resolved);
          }

          async function syncHadler() {
            const resolved = proxifiedResult;
            return chainers[p as string](...expectation, resolved);
          }
          const handler = isPromise(proxifiedResult) ? asyncHadler : syncHadler;

          callQueue.push(handler);

          return proxed;
        };
      } else if (isFunction(context[p])) {
        /** @info logging */
        logger.info('add to chain context function: ', p as string);

        return function(...args) {
          function handlerContext() {
            proxifiedResult = context[p].call(context, ...args);
            return proxifiedResult;
          }
          callQueue.push(handlerContext);
          return proxed;
        };
      } else if (p === 'then' || p === 'catch') {
        /** @info logging */
        logger.info('start call promise: ', p as string);
        if (!callQueue.length) {
          return function(...args) {
            return proxifiedResult[p].call(proxifiedResult, ...args);
          };
        }
        return async function(onRes, onRej) {
          const catcher = p === 'catch' ? onRes : onRej;

          for (const queuedCall of callQueue) {
            logger.info('start call chainers: ', queuedCall.name);

            proxifiedResult = await queuedCall(proxifiedResult)
              .catch((error) => ({error, ____proxed____error: true}));

            if (proxifiedResult && proxifiedResult.____proxed____error) {
              return catcher(proxifiedResult.error);
            }
          }

          const promised = Promise.resolve(proxifiedResult);
          return promised[p].call(promised, onRes, onRej);
        };
      }

      console.log('here');
    }
  });
  return proxed;
}

export {
  proxifyHadler
};
