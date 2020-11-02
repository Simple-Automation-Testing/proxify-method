import {expect} from 'assertior';
import {getController} from './setup';
import {proxifyIt} from '../lib';

describe('Initial', function() {
  it('async', async function() {
    // SET UP
    let wasCalled = 0;
    function assertStatus(value, data) {
      expect(value).toEqual(data.status);
      wasCalled++;
      return data;
    }
    const Controller = getController();
    proxifyIt().addChain(assertStatus).baseOnPrototype()(Controller);
    const constroller = new Controller();
    // TEST
    const result = await constroller
      .method1(1)
      .assertStatus(200);
    expect(result.body).toDeepEqual({test: true});
    expect(wasCalled).toEqual(1);
  });

  it('sync', function() {
    // SET UP
    let wasCalled = 0;
    function assertStatus(value, data) {
      expect(value).toEqual(data.status);
      wasCalled++;
      return data;
    }
    const Controller = getController();
    proxifyIt().addChain(assertStatus).baseOnPrototype()(Controller);
    const constroller = new Controller();
    // TEST
    const result = constroller
      .syncMethod1(1)
      .assertStatus(200)
      .syncMethod2()
      .assertStatus(401);
    expect(result.body).toDeepEqual({test: false});
    expect(wasCalled).toEqual(2);
  });

  it('mixed', async function() {
    let wasCalled = 0;
    function assertStatus(value, data) {
      expect(value).toEqual(data.status);
      wasCalled++;
      return data;
    }
    const Controller = getController();
    proxifyIt().addChain(assertStatus).baseOnPrototype()(Controller);
    const constroller = new Controller();
    // TEST
    const result = await constroller
      .syncMethod1(1)
      .assertStatus(200)
      .syncMethod2()
      .assertStatus(401)
      .method1(1)
      .assertStatus(200);

    expect(result.body).toDeepEqual({test: true});
    expect(wasCalled).toEqual(3);
  });
});
