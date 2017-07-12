declare var require;

import MersenneTwister = require('mersenne-twister');
import { layers, Network, CostTypes } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainEntry } from "../../../src/backends/index";
import { Activations } from "lysergic";

const { resolve } = require('path');

const dataSet: {
  training: TrainEntry[],
  test: TrainEntry[]
} = require(resolve('./test/performance/specs/mocks/samples-timing-task.json'));

const generator = new MersenneTwister(100010);
const random = generator.random_excl.bind(generator);

const baseNetwork = new Network({
  generator: random,
  layers: [
    new layers.Input(2),
    new layers.LSTM(6, { activationFunction: Activations.ActivationTypes.SOFTSIGN }),
    new layers.Dense(1),
    new layers.InputToOutput()
  ],
  engineOptions: {
    bias: true
  }
});

declare var console;
import { logTopology } from "../../../src/utils/topologyPrinter";
console.log('TIMING_TASK Topology: \n' + logTopology(baseNetwork));

export class TIMING_TASK extends PerformanceTest {
  costFunction: CostTypes = CostTypes.MEAN_SQUARE_ERROR;
  logEvery = 10;
  maxIterations = 200;
  minError = 0.01;
  learningRate = 0.03;

  async build(backend) {
    const network = baseNetwork.clone();

    network.backend = new backend(network.compiler);

    await network.build();

    return network;
  }

  async getTrainigSet() {
    return dataSet.training;
  }

  async getTestingSet() {
    return dataSet.test;
  }
};

export default new TIMING_TASK;