import {Layer} from '../internal/layer';

export class Activation extends Layer {
    static abstract = false;

    static activation_types = [
        'softmax',
        'softplus',
        'softsign',
        'relu',
        'tanh',
        'sigmoid',
        'hard_sigmoid',
        'linear',
    ];

    constructor(shape, activationFunctionName) {
        super(shape, shape);
        if (!this.constructor.activation_types.includes(activationFunctionName))
            throw new TypeError('bad activation name passed!');

        this.properties.activationFunctionName = activationFunctionName;
    }
}

for (const type of Activation.activation_types)
    Activation[type] = class extends Activation {
        static layerName = 'Activation';

        constructor(shape) {
            super(shape, type);
        }
    }