declare var require;

import MersenneTwister = require('mersenne-twister');
import { layers, Lysergic, Network } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry } from "../../../src/backends/index";
import { CostTypes } from 'lysergic';

const { resolve } = require('path');

const mnistSet: {
  training: TrainEntry[],
  test: TrainEntry[]
} = require(resolve('./test/performance/specs/mocks/samples-timing-task.json'));

const generator = new MersenneTwister(100010);
const random = generator.random.bind(generator);

const baseNetwork = new Network({
  layers: [
    new layers.Input(2),
    new layers.LSTM(5),
    new layers.Dense(1)
  ],
  engineOptions: {
    generator: random,
    bias: true
  }
});


export class MNIST extends PerformanceTest {
  costFunction: CostTypes = Lysergic.CostTypes.MEAN_SQUARE_ERROR;
  logEvery = 10;
  maxIterations = 300;
  minError = 0.005;
  learningRate = 0.03;

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