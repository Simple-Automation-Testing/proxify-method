function proxifyResult(resultPromise, assertChain: {[k: string]: (...args: any[]) => any}) {
  const callQueu = [];
  const proxed = new Proxy({}, {
    get(_t, p) {
      if (assertChain[p as string]) {
        return function(expected) {
          callQueu.push(
            async function() {
              const resolved = await resultPromise;
              assertChain[p as string](expected, resolved);
            }
          );
        };
      } else {
        if (!callQueu.length) {
          return function(...args) {
            return resultPromise[p].call(resultPromise, ...args);
          };
        } if (callQueu.length === 1) {
          return async function(onRes, onRej) {
            await callQueu[0]().catch(onRej);
            return resultPromise[p].call(resultPromise, onRes, onRej);
          };
        }
        return function(onRes, onRej) {
          return callQueu.reduce((quedCallResolver, queuedCall) => {
            return quedCallResolver().then(() => queuedCall()).catch(onRej);
          }).then(() => resultPromise[p].call(resultPromise, onRes, onRej));
        };
      }
    }
  });
  return proxed;
}

function initChainModel(ctx, assertChain) {
  const ownProps = Object.getOwnPropertyNames(ctx.__proto__);
  const onlyMethods = ownProps.filter((k) => (typeof ctx.__proto__[k]) === 'function' && !(k === 'constructor'));
  onlyMethods.forEach((m) => {
    const currentMethod = ctx.__proto__[m];
    ctx.__proto__[m] = function(...args) {
      return proxifyResult(currentMethod.call(ctx, ...args), assertChain);
    };
  });
}

function setUpChain<T>(name: string, asserter: (expectedValue: any, resolvedMethodData: T) => any, _assertChain = {}) {
  _assertChain[name] = asserter;
  return {
    setUpChain: (name: string, asserter: (...args: any[]) => any) => setUpChain(name, asserter, _assertChain),
    initChainModel: (ctx) => initChainModel(ctx, _assertChain)
  };
}

export {
  setUpChain
};
