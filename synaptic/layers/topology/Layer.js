import {NeuralNetGraphEdge} from './NeuralNetGraphEdge';

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

    _propagate(activation: Activations, gradient: Gradient): [Deltas, Gradient] {
        if (!(activation instanceof Matrix))
            throw new Error();

        return [undefined, gradient]
    }

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer): void {
        if (!(activations instanceof Matrix))
            throw new Error();
    }
}
