//@flow

import {Variable} from '../Variable';
import {OperationDependency} from '../OperationDependency';
import ndarray from 'ndarray';
import cwise from 'cwise';

export function transpose(x: Variable): void {
    x.shape = x.shape.slice().reverse();
    x.registerManipulation(new OperationDependency((x: ndarray) => {
        const {shape, stride} = x.transpose(1, 0);
        x.shape = shape;
        x.stride = stride;
    }, Array.from(arguments), 'transpose'));
}


export function product(a: Variable, b: Variable, output: Variable): void {
    output.registerManipulation(new OperationDependency(cwise({
        args: ['array', 'array', 'array'],
        body: function (a, b, output) {
            output = a * b;
        }
    }), Array.from(arguments), 'product'));
}

export function copy(to: Variable, from: Variable): void {
    to.registerManipulation(new OperationDependency((to: ndarray, from: ndarray) => {
        to.data = from.data.slice()
    }, Array.from(arguments), 'copy'));
}

export function merge1d(to: Variable, from: Variable[]): void {
    for (const variable of from) if (variable.shape[0] !== 1)
        throw new Error('merge1d requires all variables to be 1*X matrices');

    const mapping = from
        .map(variable => variable.shape[1])
        .reduce((acc, length) => [...acc, acc[acc.length - 1] + length], [0])
        .slice(0, -1)

    const mappingLength = mapping.length;

    to.registerManipulation(new OperationDependency((to: ndarray, ...from: ndarray[]) => {
        for (let i = 0; i < mappingLength; i++)
            to.data.set(from[i].data, mapping[i])
    }, [to, ...from], 'merge1d'));
}

export function split1d(to: Variable[], from: Variable): void {
    for (const variable of to) if (variable.shape[0] !== 1)
        throw new Error('merge1d requires all variables to be 1*X matrices');

    const mapping = to
        .map(variable => variable.shape[1])
        .reduce((acc, length) => [...acc, acc[acc.length - 1] + length + 1], [0])
        .slice(0, -1)

    const mappingLength = mapping.length;

    const dep = new OperationDependency((from: ndarray, ...to: ndarray[]) => {
        for (let i = 0; i < mappingLength; i++)
            to[i].data = from.data.slice(mapping[i], to[i].data.length);
    }, [from, ...to], 'split1d');

    for (const v of to)
        v.registerManipulation(dep);
}

//todo - keep in mind transposed arrays
export function axpy(a: Variable, x: Variable, y: Variable): void {
    y.registerManipulation(new OperationDependency((a: ndarray, x: ndarray, y: ndarray) => {
        var i;
        var dx = x.data;
        var dy = y.data;
        var ox = x.stride[0];
        var oy = y.stride[0];
        var px = x.offset;
        var py = y.offset;

        var alpha = a.data[0];

        for (i = dx.length - 1; i >= 0; i--, px += ox, py += oy) {
            dy[py] += alpha * dx[px];
        }
    }, [a, x, y], 'axpy'));
}


//todo - keep in mind transposed arrays
export function cpsc(a: Variable, x: Variable, y: Variable): void {
    y.registerManipulation(new OperationDependency((a: ndarray, x: ndarray, y: ndarray) => {
        var i;
        var dx = x.data;
        var dy = y.data;
        var ox = x.stride[0];
        var oy = y.stride[0];
        var px = x.offset;
        var py = y.offset;

        var alpha = a.data[0];

        for (i = dx.length - 1; i >= 0; i--, px += ox, py += oy) {
            dy[py] = alpha * dx[px];
        }
    }, [a, x, y], 'cpsc'));
}
