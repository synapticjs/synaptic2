//@flow
import type {optimizerFn} from '../Optimizers';
import {Layer} from './Layer';
import {NeuralNetGraphEdge} from './NeuralNetGraphEdge';
import {Matrix} from 'vectorious';
import R from 'ramda';
import {expect} from 'chai';

function concat1d(matrices: Matrix[]) {
    const TypedArrayConstructor = matrices[0] ? matrices[0].type : Float64Array;
    const res = new TypedArrayConstructor(matrices.map(a => a.data.length).reduce((a, b) => a + b, 0));
    let offset = 0;
    for (const matrix of matrices) {
        res.set(matrix.data, offset);
        offset += matrix.data.length;
    }
    return res;
}

export class Parallelize1dLayer extends Layer {
    _layersWithOffsets: {layer: NeuralNetGraphEdge, start: number, end: number}[]

    constructor(layers: NeuralNetGraphEdge[]) {
        for (const layer of layers)
            expect(layer).to.have.deep.property('_inputShape[0]', 1);

        super(
            [1, layers.map(layer => layer._inputShape[1]).reduce((a, b) => a + b, 0)],
            [1, layers.map(layer => layer._outputShape[1]).reduce((a, b) => a + b, 0)]);


        this._layersWithOffsets = [];
        let start = 0;
        for (const layer of layers) {
            const length = layer._inputShape[1];
            this._layersWithOffsets.push({
                layer,
                start,
                end: start + length
            })
            start += length;
        }
    }

    activate(input: Activation): Activation {
        return Matrix.fromTypedArray(concat1d(
            this._layersWithOffsets.map(({layer, start, end}) =>
                layer.activate(Matrix.fromTypedArray(
                    input.data.subarray(start, end),
                    layer._inputShape
                )))
        ), this._outputShape);
    }

    _propagate(activation: Activations, err: Err, activation_gradient: Gradient): [Deltas, Err, Gradient] {
        if (!(activation instanceof Matrix))
            throw new TypeError();

        const activationData = activation.data;
        const errData = err.data;
        const gradientData = activation_gradient.data;

        const inputs = this._layersWithOffsets.map(({layer, start, end}) => layer._propagate(
            Matrix.fromTypedArray(activationData.subarray(start, end), layer._inputShape),
            Matrix.fromTypedArray(errData.subarray(start, end), layer._inputShape),
            Matrix.fromTypedArray(gradientData.subarray(start, end), layer._inputShape),
        ));

        const [deltas, errs, gradients] = R.transpose(inputs);

        return [
            deltas,
            Matrix.fromTypedArray(concat1d(errs), this._inputShape),
            Matrix.fromTypedArray(concat1d(gradients), this._inputShape),
        ]
    }

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer: optimizerFn): void {
        if (!(activations instanceof Matrix))
            throw new TypeError();

        if (!Array.isArray(deltas))
            throw new TypeError();

        const activationsData = activations.data;

        R.zip(deltas, this._layersWithOffsets)
            .forEach(([delta, {layer, start, end}]) => layer._applyDeltas(
                delta,
                Matrix.fromTypedArray(activationsData.subarray(start, end), layer._inputShape),
                optimizer,
            ));
    }

    _log(activation: Activations): string {
        let res;
        if (activation instanceof Matrix) {
            const data = activation.data;
            res = this._layersWithOffsets.map(({layer, start, end}) =>
                layer._log(Matrix.fromTypedArray(
                    data.subarray(start, end),
                    layer._inputShape
                )))
        } else {
            res = R.zip(this._layersWithOffsets, activation).map(([{layer, start, end}, activation]) =>
                layer._log(activation))
        }

        return res.join(' AND ')
    }
}
