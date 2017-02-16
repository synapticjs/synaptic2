//@flow

import {Layer} from './util/layer';
import {operations, Variable} from '../tf';

type ActivationFn = (input: Variable, output: Variable, derivativeOutput: Variable) => void;

const activationFunctions = {
    linear: operations.nonlinearities.linear,
    sigmoid: operations.nonlinearities.sigmoid,
}

export class Activation extends Layer<{ activationFn: ActivationFn }> {
    static functions: { [key: string]: ActivationFn } = activationFunctions;

    activate([input]: Variable[], [output]: Variable[], [outputDerivative]: Variable[]): void {
        this.options.activationFn(input, output, outputDerivative);
    }

    propagate([errorGradient]: Variable[], [outputDerivative]: Variable[], [outputErrorGradient]: Variable[]): void {
        operations.product(errorGradient, outputDerivative, outputErrorGradient);
    }
}