declare var console;
import MersenneTwister = require('mersenne-twister');
import mnist = require('mnist');

import { layers, Network, CostTypes } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry, TrainResult } from "../../../src/backends/index";
import { logTopology } from "../../../src/utils/topologyPrinter";

const generator = new MersenneTwister(100010);
const random = generator.random_excl.bind(generator); // .random = [0,1) .random_excl = (0,1)

let mnistSet: { training: TrainEntry[], test: TrainEntry[] } = { training: [], test: [] };


{ // initialize training set
  const oldRandom = Math.random;
  Math.random = random;
  try {
    mnistSet = mnist.set(5000, 1000);
  } finally {
    Math.random = oldRandom;
  }
}

let baseNetwork = new Network({
    generator: random,
    layers: [
        new layers.Input2D(28, 28),
        new layers.Convolution2D({
            kernelSize: 5,   // kernel_size
            strides: 2,      // strides
            filters: 1,      // filters
            padding: 'valid' // valid/same default same
        }),
        // new layers.MaxPool2D(2),
        new layers.Softmax(10)
    ],
    engineOptions: {
        bias: false
    }
});
/*
let baseNetwork = new Network({
    generator: random,
    layers: [
        new layers.Input2D(2, 2),
        new layers.MaxPool2D(2)
    ],
    engineOptions: {
        bias: false
    }
});
*/


console.log('CONV_MNIST Topology: \n' + logTopology(baseNetwork));

export class CONV_MNIST extends PerformanceTest {
  costFunction: CostTypes = CostTypes.SOFTMAX;
  logEvery = 1;
  maxIterations = 100;
  minError = 0.05;
  learningRate = 0.1;

  async build(backend) {

    const network = baseNetwork.clone();
    network.backend = new backend(network.compiler);
    await network.build();

    return network;
  }

  log(partial: TrainResult, errorSet: ArrayLike<number>, network: Network) {
    super.log(partial, errorSet, network);
    // network.compiler.learningRate = partial.error * 0.5; // * 0.1;
  }

  async getTrainigSet() {
    /*return [
        {
            input: [0, 0, 0, 0],
            output: [0]
        }
    ];*/
    return mnistSet.training.map($ => ({
      input: $.input.map($ => $ - 0.5),
      output: $.output
    }));
  }

  async getTestingSet() {
    /*return [
        {
            input: [0, 0, 0, 0],
            output: [0]
        }
    ]*/
    return mnistSet.test.map($ => ({
      input: $.input.map($ => $ - 0.5),
      output: $.output
    }));
  }
};

export default new CONV_MNIST;