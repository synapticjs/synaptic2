
import MersenneTwister = require('mersenne-twister');
import mnist = require('mnist');

import { layers, Network, CostTypes } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry } from "../../../src/backends/index";
import { Activations } from "lysergic";

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

let baseNetwork = new Network({
  layers: [
    new layers.Input2D(28, 28),
    new layers.Convolution2D({
      width: 14,
      radius: 7,
      height: 14,
      depth: 1
    }),
    new layers.Dense(10, Activations.ActivationTypes.SOFTMAX)
  ],
  engineOptions: {
    generator: random,
    bias: true
  }
});

export class CONV_MNIST extends PerformanceTest {
  costFunction: CostTypes = CostTypes.SOFTMAX;
  logEvery = 10;
  maxIterations = 3000;
  minError = 0.01;

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

export default new CONV_MNIST;