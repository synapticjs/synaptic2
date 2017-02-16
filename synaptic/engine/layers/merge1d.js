//@flow

import {Layer} from './util/layer';
import {operations, Variable} from '../tf';

export class Merge1d extends Layer<void> {
    activate(inputs: Variable[], [output]: Variable[], _: Variable[]): void {
        operations.merge1d(output, inputs);
    }

    /*we DO NOT expect derivative here, so we're 100% sure derivative is 1*/
    propagate([errorGradient]: Variable[], _: Variable[], outputErrorGradients: Variable[]): void {
        operations.split1d(outputErrorGradients, errorGradient);
    }
}