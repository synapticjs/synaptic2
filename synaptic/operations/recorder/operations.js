import R from 'ramda';

function Operation({call, assert = function nonce() {}}) {
    return Object.assign(function operationFunctor(...args) {
        operationFunctor.assert(...args);
        return operationFunctor.call(...args);
    }, {call, assert});
}


import * as blas from './libs/blas';
import * as stdlib from './libs/stdlib';
import * as blasAssertions from './libs/blas.assertions';
import * as stdlibAssertions from './libs/stdlib.assertions';

const libraries = {
    blas,
    stdlib
}

const assertions = {
    blas: blasAssertions,
    stdlib: stdlibAssertions
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