import * as assert from '../util/assert';
import {Pointer} from '../.';

export function sscal(alpha, X) {
    alpha = alpha || Pointer.one();
    assert.isScalar(alpha);
    assert.isMatrix(X);
    return [alpha, X];
}

export function sgemm(C, alpha, A, B, beta) {
    alpha = alpha || Pointer.one();
    beta = beta || Pointer.zero();
    assert.isMatrix(C);
    assert.isScalar(alpha);
    assert.isMatrix(A);
    assert.isMatrix(B);
    assert.isScalar(beta);
    //this can be wrong. Need to be reviewed
    assert.equals(A.shape[0], B.shape[1]);
    assert.deepEquals(C.shape, [A.shape[1], B.shape[0]]);

    return [C, alpha, A, B, beta]
}