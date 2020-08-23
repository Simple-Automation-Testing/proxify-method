import {expect} from 'assertior';
import {AssertionError} from 'assert';
import {proxify} from '../lib';

describe('proxify', function() {
  it('[P] sync', function() {
    const obj = {a: 2, b: 3, c: 4};

    function isPropExists(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
    }

    const proxedObj = proxify(obj, {isPropExists: isPropExists});

    const {a, b, c} = proxedObj
      .isPropExists('a', 2)
      .isPropExists('b', 3)
      .isPropExists('c', 4);

    expect(a).toEqual(obj.a);
    expect(b).toEqual(obj.b);
    expect(c).toEqual(obj.c);
    expect(proxedObj).toDeepEqual(obj);
  });

  it('[P] sync JSON.stringify', function() {
    const obj = {a: 2, b: 3, c: 4};

    function isPropExists(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
    }

    const proxedObj = proxify(obj, {isPropExists: isPropExists});
    const {a, b, c} = proxedObj
      .isPropExists('a', 2)
      .isPropExists('b', 3)
      .isPropExists('c', 4);

    expect(JSON.stringify(proxedObj)).toEqual(JSON.stringify(obj));
    expect(a).toEqual(obj.a);
    expect(b).toEqual(obj.b);
    expect(c).toEqual(obj.c);
  });

  it('[N] sync', function() {
    const obj = {a: 2, b: 3, c: 4};

    function isPropExists(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
    }

    const proxedObj = proxify(obj, {isPropExists: isPropExists});

    try {
      const {a, b, c} = proxedObj
        .isPropExists('a', 3);
    } catch (error) {
      expect(error instanceof AssertionError).toEqual(true);
    }
  });

  it('[P] async', async function() {
    const obj = Promise.resolve({a: 2, b: 3, c: 4});

    function isPropExists(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
    }

    const proxedObj = proxify(obj, {isPropExists: isPropExists});

    const {a, b, c} = await proxedObj
      .isPropExists('a', 2)
      .isPropExists('b', 3)
      .isPropExists('c', 4);

    expect(a).toEqual((await obj).a);
    expect(b).toEqual((await obj).b);
    expect(c).toEqual((await obj).c);
  });

  it('[N] async', async function() {
    const obj = Promise.resolve({a: 2, b: 3, c: 4});

    function isPropExists(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
    }

    const proxedObj = proxify(obj, {isPropExists: isPropExists});

    try {
      const {a, b, c} = proxedObj
        .isPropExists('a', 3);
    } catch (error) {
      expect(error instanceof AssertionError).toEqual(true);
    }
  });

  it('[P] sync from result JSON.stringify', async function() {
    const obj = {a: 2, b: 3, c: 4};

    function isPropExistsAndRemove(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
      const withRemovedProp = Object.keys(targetObj)
        .filter((p) => p !== prop)
        .reduce((acc, p) => (acc[p] = targetObj[p]) && acc, {});

      return withRemovedProp;
    }
    const proxedObj = proxify(obj, {isPropExistsAndRemove: isPropExistsAndRemove}, true);
    proxedObj
      .isPropExistsAndRemove('a', 2)
      .isPropExistsAndRemove('b', 3);

    expect(proxedObj).toDeepEqual({c: 4});
    expect(JSON.stringify(proxedObj)).toEqual(JSON.stringify({c: 4}));
  });

  it('[N] sync from result', async () => {
    const obj = {a: 2, b: 3, c: 4};

    function isPropExistsAndRemove(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
      const withRemovedProp = Object.keys(targetObj)
        .filter((p) => p !== prop)
        .reduce((acc, p) => (acc[p] = targetObj[p]) && acc, {});

      return withRemovedProp;
    }
    const proxedObj = proxify(obj, {isPropExistsAndRemove: isPropExistsAndRemove}, true);
    try {
      proxedObj
        .isPropExistsAndRemove('a', 44)
        .isPropExistsAndRemove('b', 3);
    } catch (error) {
      expect(error instanceof AssertionError).toEqual(true);
    }
  });

  it('[P] proxify, common API', function() {
    const obj = {a: 2, b: 3, c: 4};

    function isPropExists(prop, value, targetObj) {
      expect(targetObj[prop]).toEqual(value);
    }

    const proxedObj = proxify(obj, {isPropExists: isPropExists})
      .isPropExists('a', 2);

    expect(proxedObj.toString()).toEqual(obj.toString());
    expect(Object.keys(obj)).toDeepEqual(Object.keys(proxedObj));

    for (const k in obj) {
      expect(obj[k]).toEqual(proxedObj[k]);
    }
    for (const k in proxedObj) {
      expect(proxedObj[k]).toEqual(obj[k]);
    }

    proxedObj.x = 10;

    expect('x' in proxedObj).toEqual(true);

    proxedObj.isPropExists('x', 10);
  });
});


