import * as assert from '../../util/assert'

export function lambda(argNames, fn) {
    assert.isArray(argNames);
    assert.isFunction(fn);
}

export function log(pointer) {
    assert.isPointer(pointer);
}

export function ternary(cond, trulyFn, falsyFn) {
    assert.isScalar(cond);
    assert.isFunction(trulyFn);
    assert.isFunction(falsyFn);
}