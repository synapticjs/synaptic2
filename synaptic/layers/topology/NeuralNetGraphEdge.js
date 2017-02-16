export class NeuralNetGraphEdge {
    _inputShape: Shape;
    _outputShape: Shape;

    activate(input: Activation): Activation { throw new Error('method not implemented') };

    _activateAndGetAllActivations(input: Activation): { activationsSequence: Activations, activationOutput: Activation } {throw new Error('method not implemented') };

    _propagate(activation: Activations, gradient: Gradient): [Deltas, Gradient] { throw new Error('method not implemented') };

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer): void { throw new Error('method not implemented') };

    _log(activation: Activations): string {
        return `${this._logSelf()}:[${this._logActivations(activation)}]`;
    }

    _logSelf() {
        return `${this.constructor.name}<${this._inputShape}, ${this._outputShape}>`
    }

    _logActivations(activation: Activations): string {
        if (activation && activation.data)
            return activation.data.map(a => a).join(', ');
        else
            return activation;
    }
}