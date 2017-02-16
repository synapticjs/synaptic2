import {LambdaPointer} from '../lambda_pointer';

export function lambda(fn) {
    return new LambdaPointer(fn);
}

export const ternary = true;

export const log = true;

export const define = true;