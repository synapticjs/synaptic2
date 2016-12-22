//@flow
import {Layer} from '../topology/Layer';
import {Matrix} from 'vectorious';
import type {optimizerFn} from '../Optimizers';


export class DenseLayer extends Layer {
    /*todo fix with tensor */
    weights: Weights = Matrix.random(this._inputShape[1], this._outputShape[1], 0, 1);

    constructor(inputShape: Shape, outputShape: Shape) {
        if (inputShape[0] !== 1)
            throw new TypeError();
        if (outputShape[0] !== 1)
            throw new TypeError();
        super(inputShape, outputShape);
    }

    activate(input: Activation): Activation {
        return Matrix.multiply(input, this.weights);
    }

    _propagate(activation: Activations, gradient: Gradient): [Deltas, Gradient] {
        if (!(activation instanceof Matrix))
            throw new TypeError();

        // const delta: Delta = Matrix.multiply(activation.T, gradient);
        return [gradient, Matrix.multiply(gradient, this.weights.T)]
    }

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer: optimizerFn): void {
        if (!(activations instanceof Matrix))
            throw new Error();

        this.weights = optimizer(this.weights, deltas, activations);
    }
}