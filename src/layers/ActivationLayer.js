//@flow
import {Layer} from '../topology/Layer';
import type {activationFn} from '../util/ActivationFunctions';
import activationFns from '../util/ActivationFunctions';
import {Matrix} from '../util/Matrix';

export class ActivationLayer extends Layer {
    static activationFns = activationFns;
    activationFn: activationFn;

    constructor(shape: Shape, activation: string | activationFn) {
        super(shape, shape);

        if (!(activation instanceof Object)) {
            const activationFns: {[key: any]: activationFn} = this.constructor.activationFns;
            const activationFn = activationFns[activation];

            if (!activationFn)
                throw new TypeError(`activation ${String(activation)} cannot be found`)


            activation = activationFn;
        }

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