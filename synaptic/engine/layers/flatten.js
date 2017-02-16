//@flow

import {Layer} from './util/layer';
import {operations, Variable} from '../tf';

export class Flatten extends Layer<void> {
    activate([input]: Variable[], [output]: Variable[], _: Variable[]): void {
        operations.copy(output, input);
    }

    /*we DO NOT expect derivative here, so we're 100% sure derivative is 1*/
    propagate([errorGradient]: Variable[], _: Variable[], [outputErrorGradient]: Variable[]): void {
        operations.copy(outputErrorGradient, errorGradient);
    }
}