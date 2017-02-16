import R from 'ramda';
import * as blas from './blas';
import * as stdlib from './stdlib';
import * as blasAssertions from './blas.assertions';
import * as stdlibAssertions from './stdlib.assertions';

const libraries = {
    blas,
    stdlib
}

const assertions = {
    blas: blasAssertions,
    stdlib: stdlibAssertions
}

function Operation({call, assert = function nonce() {}}) {
    return Object.assign(function operationFunctor(...args) {
        operationFunctor.assert(...args);
        return operationFunctor.call(...args);
    }, {call, assert});
}

const operations = ((path, lib) => lib instanceof Function
    ? new Operation({
        call: lib instanceof Function
            ? (...args) => [path.join(':'), ...lib(...args)]
            : (...args) => [path.join(':'), ...args],
        assert: R.path(path, assertions)
    })
    : R.mapObjIndexed((_, key, obj) => wrap([...path, key], obj[key])))('', libraries);

export default operations;