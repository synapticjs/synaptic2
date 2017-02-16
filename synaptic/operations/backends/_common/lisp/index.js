import {stdlib, isMonad} from './stdlib';
import EventEmitter from 'events';

class Stdout extends EventEmitter {
    _write(data) { this.emit('data', data) }
}

class Context {
    scope = new Map();
    get: (key: string) => any;

    constructor(scope, parent) {
        for (const key of Object.keys(scope))
            this.scope.set(key, scope[key]);

        const get = this.scope.get.bind(this.scope);


        this.get = parent
            ? (key) => get(key) || parent.get(key)
            : get;

        this.set = this.scope.set.bind(this.scope);
    }

    inherit(scope = {}) { return new this.constructor(scope, this) }

    interpret(expr) {
        switch (true) {
            case Array.isArray(expr):
                const [firstarg, ...rest] = expr;
                return call(this, firstarg, rest);
            case typeof expr === 'string':
                return this.get(expr) || expr;
            default:
                return expr;
        }
    }
}

export class Interpreter {
    static stdlib = stdlib;
    stdout = new Stdout();
    rootContext = new Context({'__stdout__': this.stdout});
    context: Context;
    lib: {[key: string]: Function};

    constructor(lib = this.constructor.stdlib) {
        /*todo: this is for methids hinting, can be dropped later*/
        this.lib = lib;
        this.context = new Context(this.lib, this.rootContext);
        this.interpret = expr => this.context.interpret(expr);
    }

    run(functionName = 'main') {
        return this.context.get(functionName)();
    }
}


function call(context, _fn, args) {
    const fn = context.interpret(_fn);
    if (fn instanceof Function)
        return isMonad(fn) ? fn(context, args) : fn(...args.map(expr => context.interpret(expr)));

    console.warn('tried to call', [_fn, ...args]);
    throw new TypeError(`${_fn} is not a function in this context`)
}