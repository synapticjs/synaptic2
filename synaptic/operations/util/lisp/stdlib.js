const R = require('ramda');

export const stdio = Symbol('stdio access key');

export const monad = fn => Object.assign(fn, {monad: true});
export const isMonad = fn => fn.monad;

export const stdlib = {
    let: monad((context, [variables, fn]) =>
        context.inherit(
            R.fromPairs(variables.map(([varname, expr]) => [varname, context.interpret(expr)]))
        )
            .interpret(fn)),

    lambda: monad((context, [argNames, fn]) =>
        R.curryN(argNames.length, (...args) =>
            context.inherit(
                R.fromPairs(R.zip(argNames, args))
            ).interpret(fn))),

    if: monad((context, [ifCond, trulyValue, falsyValue]) =>
        context.interpret(
            context.interpret(ifCond)
                ? trulyValue
                : falsyValue)),

    do: (x) => undefined,

    list: (...x) => x,
    first: ([x]) => x,
    rest: ([_, ...x]) => x,

    'stdio.write': monad((context, [expr]) => context.get(stdio).stdout._write(context.interpret(expr))),
};

for (const key of Object.keys(stdlib))
    Object.defineProperty(stdlib[key], "name", {value: `synaptic.lisp.stdlib.${key}`});