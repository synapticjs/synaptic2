const {stdlib, stdio, isMonad} = require('./stdlib');
const EventEmitter = require('events');

class Stdin extends EventEmitter {
    write(data) {
        this.emit('data', data);
    }
}
class Stdout extends EventEmitter {
    _write(data) {
        this.emit('data', data);
    }
}

class Context {
    constructor(scope, parent) {
        this.scope = new Map();
        for (const key of Object.keys(scope))
            this.scope.set(key, scope[key]);

        const get = this.scope.get.bind(this.scope);

        this.get = parent
            ? (key) => get(key) || parent.get(key)
            : get;
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

class Interpreter {
    constructor(lib = this.constructor.stdlib) {
        this.stdout = new Stdout();
        this.stdin = new Stdin();

        const rootContext = new Context({});
        rootContext.scope.set(stdio, {
            stdin: this.stdin,
            stdout: this.stdout,
        });
        this.context = new Context(lib, rootContext);
    }

    interpret(expr) { return this.context.interpret(expr) }
}

Interpreter.stdlib = stdlib;
module.exports.Interpreter = Interpreter;


    function call(context, _fn, args) {
    const fn = context.interpret(_fn);
    if (fn instanceof Function)
        return isMonad(fn) ? fn(context, args) : fn(...args.map(expr => context.interpret(expr)));

    console.warn('tried to call', [_fn, ...args]);
    throw new TypeError(`${_fn} is not a function in this context`)
}