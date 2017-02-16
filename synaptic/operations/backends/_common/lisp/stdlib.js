const R = require('ramda');

export const monad = fn => Object.assign(fn, {monad: true});
export const isMonad = fn => fn.monad;

const extendContextWith = (context, variables) =>
    context.inherit(
        R.fromPairs(variables.map(([varname, expr]) => [varname, context.interpret(expr)])))

export const stdlib = {
    let: monad((context, [variables, ...fns]: Object[]) => {
        const childContext = extendContextWith(context, variables);
        fns.forEach(fn => childContext.interpret(fn));
    }),

    lambda: monad((context, [argNames, ...fns]) =>
        R.curryN(argNames.length, (...args) => {
            const childContext = context.inherit(R.fromPairs(R.zip(argNames, args)))
            const lastFn = fns.pop();
            fns.forEach(fn => childContext.interpret(fn));

            if (lastFn)
                return childContext.interpret(lastFn);
        })),

    if: monad((context, [ifCond, trulyValue, falsyValue]) =>
        context.interpret(
            context.interpret(ifCond)
                ? trulyValue
                : falsyValue)),

    log: monad((context, [expr]) => context.get('__stdout__')._write(context.interpret(expr))),

    list: (...values) => values,

    define: monad((context, [key, value]) =>
        context.set(context.interpret(key), context.interpret(value)))
};

for (const key of Object.keys(stdlib))
    Object.defineProperty(stdlib[key], "name", {value: `synaptic.lisp.stdlib.${key}`});