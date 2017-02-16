import * as assert from '../../util/assert';

export const sscal = (alpha, X) => {
    assert.isScalar(alpha);
    assert.isMatrix(X);
};


export const sgemm = (C, alpha, A, B, beta) => {
    assert.isMatrix(C);
    assert.isScalar(alpha);
    assert.isMatrix(A);
    assert.isMatrix(B);
    assert.isScalar(beta);
    //this can be wrong. Need to be reviewed
    assert.equals(A.shape[0], B.shape[1]);
    assert.deepEquals(C.shape, [A.shape[1], B.shape[0]]);
};