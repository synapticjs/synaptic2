//@flow
import {Layer} from './topology/Layer';

type activationFn = {
    f: (input: number) => number;
    df: (input: number) => number;
}

export class ActivationLayer extends Layer {
    activationFn: activationFn;

    constructor(shape: Shape, activation: activationFn) {
        super(shape, shape);

        this.activationFn = activation;
    }

    activate(input: Activation): Activation {
        return input.map(this.activationFn.f)
    }

    _propagate(activation: Activations, error_gradient: Gradient): [Deltas, Gradient] {
        if (!(activation instanceof Matrix))
            throw new Error();

        return [
            undefined,
            Matrix.product(error_gradient, activation.map(this.activationFn.df))
        ]
    }
}