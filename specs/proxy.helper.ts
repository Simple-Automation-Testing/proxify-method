import {expect} from 'assertior';
import {getProxyDecorate} from '../lib/proxy.helper';

describe('proxy.helper', function() {
  it('test', function() {
    const {decorate} = getProxyDecorate();


    class Test {
      constructor() {
        //
      }

      @decorate()
      method1() {
        //
      }

      @decorate()
      method2() {
        //
      }
    }
    expect()
  });
});
