//@flow

import {Layer} from './util/layer';
import {operations, Variable} from '../tf';
import type {MetricFunction} from '../types';

export class Output extends Layer<void> {
    isOutput = true;
    value: Variable = new Variable(this.inputShapes[0]);
    expectedValue: Variable = new Variable(this.inputShapes[0]);
    error: Variable = new Variable(this.inputShapes[0]);

    activate([input]: Variable[], [output]: Variable[], [outputDerivative]: Variable[]): void {
        operations.copy(this.value, input);
    }

    propagate([errorGradient]: Variable[], [outputDerivative]: Variable[], [outputErrorGradient]: Variable[]): void {
        operations.copy(errorGradient, outputErrorGradient);
    }

    computeError(errorFn: MetricFunction): void {
        errorFn(this.error, this.value, this.expectedValue);
    }
}