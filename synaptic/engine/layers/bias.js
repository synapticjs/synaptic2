//@flow
import {Layer} from './util/layer';
import {operations, Variable} from '../tf';

export class Bias extends Layer<void> {
    value: Variable = Variable.fill(this.outputShapes[0], {fill: 1});

    activate([input]: Variable[], [output]: Variable[], [outputDerivative]: Variable[]): void {
        operations.copy(output, this.value);
    }

    propagate(_: Variable[], __: Variable[], ___: Variable[]): void {}
}