//@flow

import {Layer} from './util/layer';
import {operations, Variable} from '../tf';

export class Input extends Layer<void> {
    isInput = true;
    value = new Variable(this.outputShapes[0]);

    activate([input]: Variable[], [output]: Variable[], [outputDerivative]: Variable[]): void {
        operations.copy(output, this.value);
    }

    propagate(_: Variable[], __: Variable[], ___: Variable[]): void {}
}