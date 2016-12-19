type Callback = () => void | (cb:Function) => void | () => Promise<any>;

declare function describe(name:string, callback:Callback):void;
declare function before(callback:Callback):void;
declare function beforeEach(callback:Callback):void;
declare function it(name:string, callback:Callback):void;