import {Pointer} from '../.';

export const sscal = (alpha, X) =>
    [alpha || Pointer.one(), X];


export const sgemm = (C, alpha, A, B, beta) =>
    [C, alpha || Pointer.one(), A, B, beta || Pointer.zero()];
