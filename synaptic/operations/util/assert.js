import R from 'ramda';

class AssertionError extends Error {}

export function truly(condition, errorMessage) {
    if (!condition)
        throw new AssertionError(errorMessage)
}

export function deepEquals(a,b, errorMessage) {
    truly(
        R.equals(a,b),
        errorMessage || `expected to receive identical entities, instead received ${a} and ${b}`);
}

export function shapeEquals(a,b, errorMessage) {
    truly(
        R.equals(a.shape,b.shape),
        errorMessage || `expected to receive identical shape pointers, instead received ${a.shape} and ${b.shape}`);
}

export function isScalar(pointer, errorMessage) {
    truly(
        pointer.shape.length === 0,
        errorMessage || `expected to receive pointer with shape 0 (scalar), instead received ${pointer.shape}`);
}

export function isVector(pointer, errorMessage) {
    truly(
        pointer.shape.length === 1,
        errorMessage || `expected to receive pointer with shape 1 (vector), instead received ${pointer.shape}`);
}

export function isMatrix(pointer, errorMessage) {
    truly(
        pointer.shape.length === 2,
        errorMessage || `expected to receive pointer with shape 2 (matrix), instead received ${pointer.shape}`);
}