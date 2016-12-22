import {NeuralNetGraphEdge} from './NeuralNetGraphEdge';
import type {optimizerFn} from '../Optimizers';
import R from 'ramda';

export class FeedForwardNetwork extends NeuralNetGraphEdge {
    _chain: NeuralNetGraphEdge[];

    constructor(chain: NeuralNetGraphEdge[]) {
        super();
        this._chain = chain;
        this._inputShape = this._chain[0]._inputShape;
        this._outputShape = this._chain[this._chain.length - 1]._outputShape;
    }

    activate(input: Activation): Activation {
        let activation = input;
        for (const layer of this._chain)
            activation = layer.activate(activation);
        return activation;
    }

    _activateAndGetAllActivations(input: Activation): {activationsSequence: Activations, activationOutput: Activation} {
        const activationsSequence: Activations[] = [];
        let activationOutput: Activation = input;

        for (const layer of this._chain) {
            const {activationsSequence: layerActivationsSequence, activationOutput: layerActivationOutput}
                = layer._activateAndGetAllActivations(activationOutput);
            activationsSequence.push(layerActivationsSequence);
            activationOutput = layerActivationOutput;
        }

        return {activationsSequence, activationOutput};
    }

    _propagate(activations: Activations, gradient: Gradient): [Deltas, Gradient] {
        if (!Array.isArray(activations))
            throw new TypeError();

        const operations: [NeuralNetGraphEdge, Activations][] = R.reverse(R.transpose([
            this._chain,
            activations
        ]));

        const deltas: Deltas[] = operations.map(([layer, activation]: [NeuralNetGraphEdge, Activation]) => {
            let delta;
            [delta, gradient] = layer._propagate(activation, gradient);
            return delta;
        })

        return [
            R.reverse(deltas),
            gradient,
        ];
    }

    _applyDeltas(deltas: Deltas, activations: Activations, optimizer: optimizerFn): void {
        if (!Array.isArray(activations))
            throw new TypeError();

        const operations: [NeuralNetGraphEdge, Deltas, Activations][] = R.transpose([
            this._chain,
            deltas,
            activations
        ]);

        for (const [layer, delta, activations] of operations)
            layer._applyDeltas(delta, activations, optimizer);
    }

    _logActivations(activation: Activations): string {
        const joinSymbol = `
\|\|
\\\/
`

        return '\n' + R.zip(this._chain, activation).map(([layer, val]) => layer._log(val)).join(joinSymbol) + '\n';
    }
}