function getProxyDecorate() {
  const shouldBeDecorated = [];

  return {
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
    }
  };
}

export {
  getProxyDecorate
};
