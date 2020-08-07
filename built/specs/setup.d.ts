declare const noop: {
    get: () => Promise<unknown>;
    post: () => Promise<unknown>;
};
declare class MainIterface {
    protected req: typeof noop;
    constructor();
}
declare class SomeControllerApi extends MainIterface {
    constructor();
    getDataMethod1(): Promise<unknown>;
}
