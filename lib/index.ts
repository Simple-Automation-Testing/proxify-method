function proxifyResult(resultPromise, chainMehod: {[k: string]: (...args: any[]) => any}, fromResult = false) {
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
        return function(onRes, onRej) {
          return callQueu.reduce((quedCallResolver, queuedCall) => {
            return ((typeof quedCallResolver) === 'object' && quedCallResolver.then && quedCallResolver || quedCallResolver()).then((result) => {
              if (fromResult) {
                return queuedCall(result);
              }
              return queuedCall();
            }).catch(onRej);
          }).then(() => resultPromise[p].call(resultPromise, onRes, onRej));
        };
      }
    }
  });
  return proxed;
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
    initChainModel: (ctx) => initChainModel(ctx, _chainMehod, setUpChain.resultFromChain)
  };
}
setUpChain.resultFromChain = false;

const chainProxify = setUpChain as ISetUpChain;

export {
  chainProxify
};
