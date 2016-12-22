//@flow
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