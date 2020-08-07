function proxifyResult(resultPromise) {
    const callQueu = [];
    const proxed = new Proxy({}, {
        get(_t, p) {
            if (p === 'assertStatus') {
                return function (expectedStatus) {
                    callQueu.push(async function () {
                        const { status, body, ...rest } = await resultPromise;
                        expect(status, errorFormatter({ body, status, rest })).to.equal(expectedStatus);
                    });
                    return proxed;
                };
            }
            else if (p === 'assertBodyKeys') {
                return function (expectedKeys) {
                    callQueu.push(async function () {
                        const { body } = await resultPromise;
                        expect(body).to.include.keys(expectedKeys);
                    });
                    return proxed;
                };
            }
            else if (p === 'then') {
                if (!callQueu.length) {
                    return function (...args) {
                        return resultPromise[p].call(resultPromise, ...args);
                    };
                }
                if (callQueu.length === 1) {
                    return async function (onRes, onRej) {
                        await callQueu[0]().catch(onRej);
                        return resultPromise[p].call(resultPromise, onRes, onRej);
                    };
                }
                return function (onRes, onRej) {
                    return callQueu.reduce((quedCallResolver, queuedCall) => {
                        return quedCallResolver().then(() => queuedCall()).catch(onRej);
                    }).then(() => resultPromise[p].call(resultPromise, onRes, onRej));
                };
            }
        }
    });
    return proxed;
}
function decorateToAssertStatus(ctx) {
    const ownProps = Object.getOwnPropertyNames(ctx.__proto__);
    const onlyMethods = ownProps.filter((k) => (typeof ctx.__proto__[k]) === 'function' && !(k === 'constructor'));
    onlyMethods.forEach((m) => {
        const currentMethod = ctx.__proto__[m];
        ctx.__proto__[m] = function (...args) {
            return proxifyResult(currentMethod.call(ctx, ...args));
        };
    });
}
//# sourceMappingURL=index.js.map