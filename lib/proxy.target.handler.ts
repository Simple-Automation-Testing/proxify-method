
// const handler = {

//   get(target, p) {
//     if (p === 'toJSON') {
//       return function() {
//         return target;
//       };
//     }

//     if (chainers[p as string] && isPromise(target)) {
//       /** @info logging */
//       logger.info('add to chain chainers function: ', p as string);
//       return function(...expectation) {
//         async function asyncHadler() {
//           const resolved = await target;
//           return chainers[p as string](...expectation, resolved);
//         }

//         async function syncHadler() {
//           const resolved = target;
//           return chainers[p as string](...expectation, resolved);
//         }
//         const handler = isPromise(target) ? asyncHadler : syncHadler;

//         callQueue.push(handler);

//         return proxed;
//       };
//     } else if (chainers[p as string] && !isPromise(target)) {
//       /** @info logging */
//       logger.info('add sync call to chain chainers function: ', p as string);
//       return function(...expectation) {
//         const result = chainers[p as string](...expectation, target);
//         /** @info for sync proxing approach */
//         proxyTarget = result;

//         if (fromResult) {
//           target = result;
//         }
//         return proxed;
//       };
//     } else if (isFunction(context[p])) {
//       /** @info logging */
//       logger.info('add to chain context function: ', p as string);
//       return function(...args) {

//         function handlerContext() {
//           target = context[p].call(context, ...args);
//           return target;
//         }

//         callQueue.push(handlerContext);
//         return proxed;
//       };

//     } else if (p === 'then' || p === 'catch') {
//       /** @info logging */
//       logger.info('start call promise: ', p as string);
//       if (!callQueue.length) {
//         return function(...args) {
//           return target[p].call(target, ...args);
//         };
//       }
//       return async function(onRes, onRej) {
//         const catcher = p === 'catch' ? onRes : onRej;

//         for (const queuedCall of callQueue) {
//           logger.info('start call chainers: ', queuedCall.name);

//           target = await queuedCall(target)
//             .catch((error) => ({error, ____proxed____error: true}));

//           if (target && target.____proxed____error) {
//             return catcher(target.error);
//           }
//         }

//         const promised = Promise.resolve(target);
//         return promised[p].call(promised, onRes, onRej);
//       };
//     } else if (target[p]) {
//       return target[p];
//     }
//   },

//   /** @info basics */

//   getPrototypeOf(target) {
//     return Object.getPrototypeOf(target);
//   },
//   ownKeys(target) {
//     return Object.getOwnPropertyNames(target);
//   },
//   getOwnPropertyDescriptor(target, p) {
//     return Object.getOwnPropertyDescriptor(target, p);
//   }
// }