
function proxifyResultAsync(resultPromise, chainMehod: {[k: string]: (...args: any[]) => any}, fromResult = false) {
  const callQueu = [];
  const proxed = new Proxy({}, {
    get(_t, p) {
      if (chainMehod[p as string]) {
        return function(expected) {
          callQueu.push(
            async function() {
              const resolved = await resultPromise;
              chainMehod[p as string](expected, resolved);
            }
          );
          return proxed;
        };
      } else {
        if (!callQueu.length) {
          return function(...args) {
            return resultPromise[p].call(resultPromise, ...args);
          };
        } if (callQueu.length === 1) {
          return async function(onRes, onRej) {
            const result = await callQueu[0]().catch(onRej);
            if (fromResult) {
              return result;
            }
            return resultPromise[p].call(resultPromise, onRes, onRej);
          };
        }
        return async function(onRes, onRej) {
          const resultQueue = await callQueu.reduce(async function(quedCallResolver, queuedCall) {
            const result = await ((typeof quedCallResolver) === 'object' && quedCallResolver.then && quedCallResolver || quedCallResolver())
              .catch(onRej);

            if (fromResult) {
              return queuedCall(result);
            }
            return queuedCall();

          }).catch(onRej);
          if (fromResult) {
            return resultQueue;
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
