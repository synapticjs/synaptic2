//@flow
import {expect} from 'chai';
import {Matrix} from './util/Matrix';

export type optimizerFn = (weights: Weights, deltas: Deltas, activations: Activations) => Weights;

export function RMSProp({learning_rate = .1}: {learning_rate: number} = {}) {
    return function (weights: Weights, deltas: Deltas, activations: Activations): Weights {
        return Matrix.ones(1, 1) //todo
    }
}

export function SGD({learning_rate = .1}: {learning_rate: number} = {}) {
    return function (weights: Weights, deltas: Deltas, activations: Activations): Weights {
        if (!(deltas instanceof Matrix))
            throw new Error();

        if (!(activations instanceof Matrix))
            throw new Error();

        expect(deltas.shape).to.deep.equal([1, weights.shape[1]]);
        expect(activations.shape).to.deep.equal([1, weights.shape[0]]);

        global.counter = global.counter || 0;


        return Matrix.add(
            weights,
            Matrix.scale(
                Matrix.multiply(
                    activations.T,
                    deltas,
                ),
                learning_rate
            )
        )
    }
}