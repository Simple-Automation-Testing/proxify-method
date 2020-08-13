
function proxifyResultAsync(resultPromise, chainMehod: {[k: string]: (...args: any[]) => any}, fromResult = false) {
  const callQueue = [];
  const proxed = new Proxy({}, {
    get(_t, p) {
      if (chainMehod[p as string]) {
        return function(...expectation) {
          callQueue.push(
            async function() {
              const resolved = await resultPromise;
              chainMehod[p as string](...expectation, resolved);
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

          let iterationResult;
          for (const queuedCall of callQueue) {

            iterationResult = await queuedCall(fromResult ? iterationResult : undefined).catch((error) => ({error, ____proxed____: true}));
            if (iterationResult && iterationResult.____proxed____) {
              return catcher(iterationResult.error);
            }
          }

          if (fromResult) {
            return iterationResult;
          }

          return resultPromise[p].call(resultPromise, onRes, onRej);
        };
      }
    }
  });
  return proxed;
}

export {
  proxifyResultAsync
};
