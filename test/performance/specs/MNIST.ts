import MersenneTwister = require('mersenne-twister');
import mnist = require('mnist');
import { layers, Lysergic, Network } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry } from "../../../src/backends/index";
import { CostTypes } from 'lysergic';

const generator = new MersenneTwister(100010);
const random = generator.random.bind(generator);

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

let baseNetwork = new Network({
  layers: [
    new layers.Input2D(28, 28),
    new layers.Dense(15),
    new layers.Dense(10, Lysergic.ActivationTypes.SOFTMAX)
  ],
  engineOptions: {
    generator: random
  }
});

export class MNIST extends PerformanceTest {
  costFunction: CostTypes = Lysergic.CostTypes.SOFTMAX;
  logEvery = 1000;
  maxIterations = 300;
  minError = 0.001;

  async build(backend) {
    const network = baseNetwork.clone();

    network.backend = new backend(network.engine);

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