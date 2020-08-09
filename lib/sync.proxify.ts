function proxifyResultSync(result, chainMehod: {[k: string]: (...args: any[]) => any}, fromResult = false) {
  let proxifiedResult = result;

  const proxed = new Proxy(result, {
    get(_t, p) {
      if (proxifiedResult[p] && (typeof proxifiedResult[p]).includes('function')) {
        return function(...args) {
          return proxifiedResult[p].call(proxifiedResult, ...args);
        };
      } else if (chainMehod[p as string]) {
        return function(...args) {
          args.push(proxifiedResult);
          const result = chainMehod[p as string](...args);
          if (fromResult) {
            proxifiedResult = result;
          }
          return proxed;
        };
      } else if (proxifiedResult[p]) {
        // proxy cnain end
        return proxifiedResult[p];
      }
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
  proxifyResultSync
};
