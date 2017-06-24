declare var console;
import MersenneTwister = require('mersenne-twister');
import mnist = require('mnist');

import { layers, Network, CostTypes } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry, TrainResult } from "../../../src/backends/index";
import { Activations } from "lysergic";
import { logTopology } from "../../../src/utils/topologyPrinter";

const generator = new MersenneTwister(100010);
const random = generator.random_excl.bind(generator); // .random = [0,1) .random_excl = (0,1)

let mnistSet: { training: TrainEntry[], test: TrainEntry[] } = { training: [], test: [] };


{ // initialize training set
  const oldRandom = Math.random;
  Math.random = random;
  try {
    mnistSet = mnist.set(1000);
  } finally {
    Math.random = oldRandom;
  }
}
Activations
let baseNetwork = new Network({
  generator: random,
  layers: [
    new layers.Input2D(28, 28),
    new layers.Convolution2D({
      padding: 3,
      stride: 1,
      filter: 3,
      depth: 1
    }),
    new layers.Softmax(10)
  ],
  engineOptions: {
    bias: false
  }
});

console.log('CONV_MNIST Topology: \n' + logTopology(baseNetwork));

export class CONV_MNIST extends PerformanceTest {
  costFunction: CostTypes = CostTypes.SOFTMAX;
  logEvery = 1;
  maxIterations = 300000;
  minError = 0.01;
  learningRate = 0.5;

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
    return mnistSet.training.map($ => ({
      input: $.input.map($ => $ - 0.5),
      output: $.output
    }));
  }

  async getTestingSet() {
    return mnistSet.test.map($ => ({
      input: $.input.map($ => $ - 0.5),
      output: $.output
    }));
  }
};

export default new CONV_MNIST;