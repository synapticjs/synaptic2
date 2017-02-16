//@flow
import type {Matrix, Scalar} from '../../types';
import blasGemm from 'ndarray-gemm';
import {Variable} from '../../Variable';
import {OperationDependency} from '../../OperationDependency';
import {expect} from 'chai';


export function gemm(c: Matrix, a: Matrix, b: Matrix, alpha?: Scalar = new Variable.scalar(1), beta?: Scalar = new Variable.scalar(0)) {
    expect(c.shape).to.deep.equal([a.shape[0], b.shape[1]]);
    expect(a.shape[1]).to.equal(b.shape[0]);
    c.registerManipulation(new OperationDependency(blasGemm, Array.from(arguments), 'blas.gemm'));
}