//@flow
import type {Var, Scalar, Vector, Matrix} from '../../types';
import * as ops from 'ndarray-blas-level1';
import {OperationDependency} from '../../OperationDependency';

export function copy(x: Vector, y: Vector): void {
    y.registerManipulation(new OperationDependency(ops.copy, Array.from(arguments), 'blas.copy'));
}

export function axpy(alpha: Scalar, x: Vector, y: Vector): void {
    y.registerManipulation(new OperationDependency(ops.axpy, Array.from(arguments), 'blas.axpy'));
}