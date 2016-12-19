//@flow
import {Layer} from '../topology/Layer';
import {Matrix} from 'vectorious';
import type {optimizerFn} from '../Optimizers';
import {expect} from 'chai';


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
        expect(input.shape).to.deep.equal(this._inputShape);
        const result = Matrix.multiply(input, this.weights);
        expect(result.shape).to.deep.equal(this._outputShape);
        return result;
    }

    _propagate(activation: Activations, err: Err, activation_gradient: Gradient): [Deltas, Err, Gradient] {
        expect(err.shape).to.deep.equal(this._outputShape);
        expect(activation_gradient.shape).to.deep.equal(this._outputShape);

        const delta: Delta = Matrix.product(err, activation_gradient);
        err = Matrix.multiply(err, this.weights.T);
        activation_gradient = Matrix.ones(...this._inputShape);
        expect(delta.shape).to.deep.equal(this._outputShape);
        expect(err.shape).to.deep.equal(this._inputShape);
        expect(activation_gradient.shape).to.deep.equal(this._inputShape);
        return [delta, err, activation_gradient]
    }

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer: optimizerFn): void {
        if (!(activations instanceof Matrix))
            throw new Error();

        this.weights = optimizer(this.weights, deltas, activations);
    }
}