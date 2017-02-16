//@flow
import {expect} from 'chai';
import * as mnist from '../_examples/util/mnist';
import {layers, metrics, objectives, optimizers} from './index.js';

describe('examples', () => {
    it('should solve MNIST using dense layers', async () => {
        const network = new layers.FeedForward([
            new layers.Input([28, 28]),
            new layers.Flatten(),
            new layers.Dense([1, 1000]),
            new layers.Activation.Sigmoid(),
            new layers.Dense([1, 10], {bias: false}),
            new layers.Activation.Sigmoid(),
        ])

        await network.compile({
            loss: objectives.CategoricalCrossentropy,
            optimizer: optimizers.SGD({learningRate: 0.1}),
            metrics: [
                metrics.Accuracy
            ]
        });

        const losses = await network.train(mnist.x_train, mnist.y_train, {
            epochs: 1000
        })

        const {metrics: [accuracy]} = await network.evaluate(mnist.x_test, mnist.y_test);

        expect(accuracy).to.be.gte(0.5)
    })
})