const noop = {
    // noop http method get
    get: () => new Promise((res) => setTimeout(() => res({
        status: 200, body: [1, 23, 4], headers: { 'Content-Type': 'application/json' }
    }), 100)),
    // noop http method post
    post: () => new Promise((res) => setTimeout(() => res({
        status: 200, body: [1, 23, 4], headers: { 'Content-Type': 'application/json' }
    }), 250)),
};
class MainIterface {
    constructor() {
        this.req = noop;
    }
}
class SomeControllerApi extends MainIterface {
    constructor() {
        super();
    }
    getDataMethod1() {
        return this.req.get();
    }
}
//# sourceMappingURL=setup.js.map