import {Layer} from './Layer';

type activation = {
    f: (number) => number,
    df: (number) => number
};


//todo move to engine
export const activations: Object<string, activation> = {
    linear: {
        f: x => x,
        df: x => 1,
    },
    sigmoid: {
        f: x => 1 / (1 + Math.exp(-x)),
        df: x =>  {
            const fx = activations.sigmoid.f(x);
            return fx * (1 - fx);
        }
    }
}

export class ActivationLayer extends Layer {
    static activations = activations;
    activation: activation;

    constructor(shape: number, activationName: string | activation) {
        super(shape, shape);
        this.activation = activationName instanceof Object
            ? activationName
            : this.constructor.activations[activationName];

        if (!this.activation)
            throw new TypeError(`activation ${activationName} cannot be found`)
    }

    activate(input) {
        super.activate(input);
        return this.activationValue.map(this.activation.f);
    }

    propagate(error) {
        super.propagate(error);
        return this.propagationValue.map(this.activation.df);
    }
}