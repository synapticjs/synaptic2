const blas1 = require('ndarray-blas-level1');
const blas2 = require('ndarray-blas-level2');
const gemm = require('ndarray-gemm');
//todo leave only the required functionality subset of what is declared here

/*blas 1*/
module.exports.blas_swap = (x, y) => blas1.swap(x, y);
module.exports.blas_scal = (alpha, x) => blas1.scal(alpha, x);
module.exports.blas_copy = (x, y) => blas1.copy(x, y);
module.exports.blas_axpy = (alpha, x, y) => blas1.axpy(alpha, x, y);
module.exports.blas_cpsc = (alpha, x, y) => blas1.cpsc(alpha, x, y);
module.exports.blas_dot = (x, y) => blas1.dot(x, y);
module.exports.blas_nrm2 = (x) => blas1.nrm2(x);
module.exports.blas_asum = (x) => blas1.asum(x);
module.exports.blas_iamax = (x) => blas1.iamax(x);
/*blas 2*/
module.exports.blas_gemv = (alpha, A, x, beta, y) => blas2.gemv(alpha, A, x, beta, y);
module.exports.blas_trmv = (A, x, isLower) => blas2.trmv(A, x, isLower);
module.exports.blas_trsv = (A, x, isLower) => blas2.trsv(A, x, isLower);

module.exports.blas_gemm = (c, a, b, alpha, beta) => gemm(c, a, b, alpha, beta);