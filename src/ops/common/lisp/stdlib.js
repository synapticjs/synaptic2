const R = require('ramda');
const {Context} = require('./index');


const stdio = Symbol('stdio access key');

const monad = fn => Object.assign(fn, {monad: true});
const isMonad = fn => fn.monad;

const stdlib = {
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

    list: (...x) => x,
    first: ([x]) => x,
    rest: ([_, ...x]) => x,

    'stdio.write': monad((context, [expr]) => context.get(stdio).stdout._write(context.interpret(expr))),
    'stdio.read': monad((context, [expr]) => {
        const fn = context.interpret(expr);
        context.get(stdio).stdin.on('data', fn);
    }),
};

module.exports.stdio = stdio;
module.exports.stdlib = stdlib;
module.exports.monad = monad;
module.exports.isMonad = isMonad;

for (const key of Object.keys(stdlib))
    Object.defineProperty(stdlib[key], "name", {value: `nanolisp.stdlib.${key}`});