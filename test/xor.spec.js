// @flow
import {assert, expect} from 'chai';
import {Matrix} from 'vectorious';
import {FeedForwardNetwork, ActivationLayer, DenseLayer, Trainer, BiasedDenseLayer} from '../src';
import {any, max_loss, iterations} from '../src/Objectives';
import {SGD} from '../src/Optimizers';
import * as Loss from '../src/Loss';
import random from 'seed-random';

random('synaptic', {global: true});


describe('SGD', () => {
    it('should work', () => {
        const weights = new Matrix([
            [1, 2],
            [3, 4],
            [5, 6],
        ])
        const deltas = new Matrix([
            [100],
            [200],
            [300],
        ])
        const activations = new Matrix([
            [500, 600],
        ])
        const res = SGD({learning_rate: 0.1})(weights, deltas, activations);

        expect(res.toArray()).to.deep.equal([
            [1 + 100 * 500 * .1, 2 + 100 * 600 * .1],
            [3 + 200 * 500 * .1, 4 + 200 * 600 * .1],
            [5 + 300 * 500 * .1, 6 + 300 * 600 * .1],
        ])
    })
})

describe('XOR', () => {
    const x = [
        Matrix.fromArray([[0, 0]]),
        Matrix.fromArray([[0, 1]]),
        Matrix.fromArray([[1, 0]]),
        Matrix.fromArray([[1, 1]]),
    ];

    const y = [
        Matrix.fromArray([[0]]),
        Matrix.fromArray([[1]]),
        Matrix.fromArray([[1]]),
        Matrix.fromArray([[0]]),
    ]

    it('should activate', () => {
        const XOR = new FeedForwardNetwork([
            new BiasedDenseLayer([1, 2], [1, 2]),
            new ActivationLayer([1, 4], 'sigmoid'),
            new BiasedDenseLayer([1, 4], [1, 1]),
            new ActivationLayer([1, 1], 'sigmoid'),
        ])

        XOR.activate(new Matrix([[0, 0]]));
    })

    it.only("should learn", () => {
        const XOR = new FeedForwardNetwork([
            new DenseLayer([1, 2], [1, 5]),
            new ActivationLayer([1, 5], 'sigmoid'),
            new BiasedDenseLayer([1, 5], [1, 1]),
            new ActivationLayer([1, 1], 'sigmoid'),
        ])

        const trainer = new Trainer(XOR);

        trainer.train(x, y, {
                lossFn: Loss.mse,
                optimizerFn: SGD({learning_rate: .25}),
                objectiveFn: any([
                    max_loss(.0005),
                    iterations(2000),
                ])
            }
        )

        console.log(XOR.activate(new Matrix([[0, 0]])).toArray()[0]);
        console.log(XOR.activate(new Matrix([[1, 1]])).toArray()[0]);
        console.log(XOR.activate(new Matrix([[0, 1]])).toArray()[0]);
        console.log(XOR.activate(new Matrix([[1, 0]])).toArray()[0]);

        assert.isAtMost(XOR.activate(new Matrix([[0, 0]])).toArray()[0], .49, "[0, 0] did not output 0");
        assert.isAtMost(XOR.activate(new Matrix([[1, 1]])).toArray()[0], .49, "[1, 1] did not output 0");
        assert.isAtLeast(XOR.activate(new Matrix([[0, 1]])).toArray()[0], .51, "[0, 1] did not output 1");
        assert.isAtLeast(XOR.activate(new Matrix([[1, 0]])).toArray()[0], .51, "[1, 0] did not output 1");
    });
});
