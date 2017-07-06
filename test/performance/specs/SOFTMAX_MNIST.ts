import MersenneTwister = require('mersenne-twister');
import mnist = require('mnist');
import { layers, Network, CostTypes } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry } from "../../../src/backends/index";
// import { Activations } from 'lysergic';

const generator = new MersenneTwister(100010);
const random = generator.random_excl.bind(generator);

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
    new layers.Dense(15),
    new layers.Softmax(10, { bias: false })
  ],
  engineOptions: {
    bias: true
  }
});

declare var console;
import { logTopology } from "../../../src/utils/topologyPrinter";
console.log('SOFTMAX_MNIST Topology: \n' + logTopology(baseNetwork));

export class MNIST extends PerformanceTest {
  costFunction: CostTypes = CostTypes.SOFTMAX;
  logEvery = 1;
  maxIterations = 100;
  minError = 0.05;
  learningRate = 0.5;

  async build(backend) {
    const network = baseNetwork.clone();

    network.backend = new backend(network.compiler);

    await network.build();

    return network;
  }

  async getTrainigSet() {
    return mnistSet.training;
  }

  async getTestingSet() {
    return mnistSet.test;
  }
};

export default new MNIST;