//@flow
import {expect} from 'chai';
import * as mnist from '../_examples/util/mnist';
import {Graph} from './Graph';
import * as layers from './layers';

import {SGD} from './optimizers';
import {Accuracy, CategoricalCrossentropy} from './metrics';
import * as operations from './operations';

describe('examples', () => {
    it('should solve MNIST using dense layers', async () => {
        // Step 1. Declare layers
        const bias = new layers.Bias({inputShapes: [], outputShapes: [[1, 1]]})

        const input = new layers.Input({inputShapes: [], outputShapes: [[28, 28]]});
        const flatten = new layers.Flatten({inputShapes: [[28, 28]], outputShapes: [[1, 28 * 28]]})

        const merge1 = new layers.Merge1d({inputShapes: [[1, 28 * 28], [1, 1]], outputShapes: [[1, 28 * 28 + 1]]})
        const dense1 = new layers.Dense({inputShapes: [[1, 28 * 28 + 1]], outputShapes: [[1, 1000]]})
        const activation1 = new layers.Activation({inputShapes: [[1, 1000]], outputShapes: [[1, 1000]]},
            {activationFn: layers.Activation.functions.sigmoid})

        const merge2 = new layers.Merge1d({inputShapes: [[1, 1000], [1, 1]], outputShapes: [[1, 1000 + 1]]})
        const dense2 = new layers.Dense({inputShapes: [[1, 1000 + 1]], outputShapes: [[1, 10]]})
        const activation2 = new layers.Activation({
            inputShapes: [[1, 10]],
            outputShapes: [[1, 10]]
        }, {activationFn: layers.Activation.functions.sigmoid})
        const output = new layers.Output({inputShapes: [[1, 10]], outputShapes: []});

        // Step 2. Connect layers into network
        const graph = new Graph();

        await graph.connect(input, flatten, {input: 0, output: 0});
        await graph.connect(flatten, merge1, {input: 0, output: 0});
        await graph.connect(bias, merge1, {input: 1, output: 0});
        await graph.connect(merge1, dense1, {input: 0, output: 0});
        await graph.connect(dense1, activation1, {input: 0, output: 0});
        await graph.connect(activation1, merge2, {input: 0, output: 0});
        await graph.connect(bias, merge2, {input: 1, output: 0});
        await graph.connect(merge2, dense2, {input: 0, output: 0});
        await graph.connect(dense2, activation2, {input: 0, output: 0});
        await graph.connect(activation2, output, {input: 0, output: 0});


        const x_train = mnist.x_train.map(val => [val]);
        const y_train = mnist.y_train.map(val => [val]);
        const x_test = mnist.x_test.map(val => [val]);
        const y_test = mnist.y_test.map(val => [val]);

        //step 4. Compile functions over network

        //todo implement garbage collection!!
        const trainFn = await operations.createTrainFn(graph, {
            loss: CategoricalCrossentropy(),
            optimizer: SGD({learningRate: 0.1}),
            metrics: [
                Accuracy()
            ],
            epochs: 1000,
            verbose: 100
        });

        await trainFn(x_train, y_train);

        const evaluateFn = await operations.createEvaluateFn(graph, {
            verbose: 100,
            metrics: [
                Accuracy()
            ],
        });

        const {metrics: [accuracy]} = await evaluateFn(graph, x_test, y_test);

        const [accuracyValue] = await accuracy.get();

        expect(accuracyValue).to.be.gte(0.5)
    })
})