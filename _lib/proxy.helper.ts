import {proxifyAsync} from './async.proxify';
import {proxifySync} from './sync.proxify';
import {isArray, isFunction, isObject} from './type.utils';

function callable(originalMethodCaller, context) {
  return originalMethodCaller();
}

type ChainerTypeFn = (...args: any[]) => any | void;
type ChainerTypeChainerObj = {name: string, chain: (...args: any[]) => any | void};
type ChainerTypeArrayFns = Array<(...args: any[]) => any | void>;
type ChainerTypeArrayChainerObj = Array<{name: string, chain: (...args: any[]) => any}>
type ChainerTypeArrayWithBothTypes = Array<((...args: any[]) => any | void) | {name: string, chain: (...args: any[]) => any}>;

/**
 * @example
 * const bothTypes: ChainerTypeArrayWithBothTypes = [function test() {}, {name: 'test', chain: function() {}}];
 * const fnType: ChainerTypeFn = function test () {};
 * const objType: ChainerTypeChainerObj = {name: 'test', chain: function() {}};
 * ...etc
 */
type ChainerType = ChainerTypeFn | ChainerTypeChainerObj | ChainerTypeArrayFns | ChainerTypeArrayChainerObj | ChainerTypeArrayWithBothTypes;


interface IProxifyItConfig {
  chainResult?: boolean;
}
function proxifyIt(config?: IProxifyItConfig) {
  const shouldBeDecorated = [];
  const chainers = [];

  const proxifyItIterface = {
    /*
    decorate: function() {
      return function(_target, methodName, _descriptor) {
        shouldBeDecorated.push(methodName);
      };
    },
    getShouldBeDecoratedList() {
      return [...shouldBeDecorated];
    },
    restore() {
      shouldBeDecorated.slice(0, shouldBeDecorated.length - 1);
    },
    */
    addChain(chainer: ChainerType) {
      /**
       * @info in case if some unexpeted argument - Error
       */
      if (!chainer) {
        throw new Error(`
          addChain argument shoulb be
            () => any | {name: string, chai: () => any} | Array<() => any> | Array<{name: string, chai: () => any}>
        `);
      }

      if (isArray(chainer)) {
        (chainer as ChainerTypeArrayWithBothTypes).forEach((_chainer) => {
          /**
           * @info in case if some unexpeted argument - Error
           */
          if (!_chainer || (isObject(_chainer) && (!_chainer.name || !(_chainer as ChainerTypeChainerObj).chain))) {
            throw new Error(`
              chainer in array should be
                (() => any|void) | {name: string, chai: () => any}
            `);
          }

          if (isFunction(_chainer) && _chainer.name) {
            return chainers.push({name: _chainer.name, chain: _chainer});
          }
          if (isObject(_chainer)) {
            return chainers.push(_chainer);
          }
        });

        return proxifyItIterface;
      } else if (isObject(chainer)) {
        if ((!(chainer as ChainerTypeChainerObj).name || !(chainer as ChainerTypeChainerObj).chain)) {
          throw new Error(`
            chainer obj should be
              {name: string, chai: () => any}
          `);
        }
        chainers.push(chainer);

        return proxifyItIterface;
      } else if (isFunction(chainer)) {
        if (!(chainer as ChainerTypeFn).name) {
          throw new Error(`chainer function should not be anonymous function`);
        }
        chainers.push({name: (chainer as ChainerTypeFn).name, chain: chainer});

        return proxifyItIterface;
      }
    },
    baseOnPrototype() {
      return function(constructorFunction) {
        const prot = constructorFunction.prototype;
        const ownPropsList = Object.getOwnPropertyNames(prot);
        const protMethods = ownPropsList
          /**
           * @info ignore constructor function
           */
          .filter((fnName) => fnName !== 'constructor')
          .filter((fnName) => {
            const descriptor = Object.getOwnPropertyDescriptor(prot, fnName);
            /**
             * @info ignore getters and setters
             */
            if (descriptor.set || descriptor.get) {
              return false;
            }

            /**
             * @info only configurable methods can be proxified
             */
            if (descriptor.configurable && (typeof descriptor.value).includes('function')) {
              return true;
            }
          });
        protMethods.forEach((fnName) => {
          const descriptor = Object.getOwnPropertyDescriptor(prot, fnName);
          /**
           * @info original method
           */
          const originalMethod = descriptor.value;

          descriptor.value = function(...args) {
            /**
             * @info TBD
             */
            const executableMethod = originalMethod.bind(this, ...args);
            return callable(executableMethod, this);
          };
        });
      };
    }
  };
  return proxifyItIterface;
}

export {
  proxifyIt
};

