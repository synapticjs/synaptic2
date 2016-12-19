import type {optimizerFn} from '../Optimizers';
import {NeuralNetGraphEdge} from './NeuralNetGraphEdge';
import {Matrix} from '../util/Matrix';

export class Layer extends NeuralNetGraphEdge {
    constructor(inputShape: Shape, outputShape: Shape) {
        super();
        //todo add validations for all shapes
        this._inputShape = inputShape;//todo add multi-dimension support
        this._outputShape = outputShape;//todo add multi-dimension support
    }

    _activateAndGetAllActivations(input: Activation): {activationsSequence: Activations, activationOutput: Activation} {
        return {
            activationsSequence: input,
            activationOutput: this.activate(input)
        };
    }

    activate(input: Activation): Activation {
        return input;
    }

    _propagate(activation: Activations, err: Err, activation_gradient: Gradient): [Deltas, Err, Gradient] {
        if (!(activation instanceof Matrix))
            throw new Error();

        return [undefined, err, activation_gradient]
    }

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer: optimizerFn): void {
        if (!(activations instanceof Matrix))
            throw new Error();
    }
}
