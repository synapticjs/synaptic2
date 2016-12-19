//@flow
import R from 'ramda';
import {NeuralNetGraphEdge} from './topology/NeuralNetGraphEdge';
import {Matrix} from './util/Matrix';
import type {objectiveFn} from './Objectives';
import type {optimizerFn} from './Optimizers';
import type {lossFn} from './Loss';

type init = {
    objectiveFn: objectiveFn;
    optimizerFn: optimizerFn;
    lossFn: lossFn;
}

export class Trainer {
    network: NeuralNetGraphEdge;

    constructor(network: NeuralNetGraphEdge) {
        this.network = network;
    }

    train(xs: Activation[], ys: Activation[], {objectiveFn, optimizerFn, lossFn}: init = {}) {
        const xys: [Activation, Activation][] = R.zip(xs, ys);

        while (true) {
            const losses: number[] = [];
            const seqs = xys.map(([x,y]) => {
                const {activationsSequence, activationOutput} = this.network._activateAndGetAllActivations(x);
                const error = Matrix.subtract(y, activationOutput);
                const loss: Activation = Object.assign(Matrix.fromArray([
                    R.zip(activationOutput.toArray(), y.toArray()).map(([y_pred, y_real]) => lossFn(y_pred, y_real))
                ]), {shape: activationOutput.shape});

                losses.push(loss.reduce((a, b) => a + b));

                // console.log(this.network._log(activationsSequence));
                // console.log('Expected output:', y.data);
                // console.log('Effective output:', activationOutput.data);
                // console.log('Resulting loss:', loss.data);


                const gradient: Gradient = Matrix.ones(...error.shape);
                const [deltas]: [Deltas] = this.network._propagate(activationsSequence, error, gradient);

                // console.log('computed deltas:');
                // console.log(this.network._log(deltas));
                return [deltas, activationsSequence];
            });

            for (const [deltas, activationsSequence] of seqs) {
                this.network._applyDeltas(deltas, activationsSequence, optimizerFn);
            }


            if (objectiveFn(R.mean(losses)))
                break;
        }
    }

}