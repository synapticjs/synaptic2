import MersenneTwister = require('mersenne-twister');

import { layers, Network, Lysergic } from '../../../src';
import { PerformanceTest } from "../interfaces";
import { TrainResult } from "../../../src/backends/index";
import { CostTypes, ActivationTypes } from 'lysergic';

const generator = new MersenneTwister(100010);
const random = generator.random.bind(generator);

let baseNetwork = new Network({
  layers: [
    new layers.Input(2),
    new layers.Dense(3, ActivationTypes.TANH),
    new layers.Dense(1, ActivationTypes.TANH)
  ],
  engineOptions: {
    generator: random,
    bias: false
  }
});

export class XOR extends PerformanceTest {
  minError = 0.001;
  maxIterations = 10000;
  costFunction: CostTypes = Lysergic.CostTypes.MEAN_SQUARE_ERROR;

  async build(backend) {
    const network = baseNetwork.clone();

    network.backend = new backend(network.engine);

    await network.build();

    return network;
  }

  async getTrainigSet() {
    return [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ];
  }

  async getTestingSet() {
    return await this.getTrainigSet();
  }

  async validate(network: Network, trainResult: TrainResult) {
    let result = await network.activate([0, 0]);

    if (Math.round(result[0]) != 0)
      throw new Error(`[0,0] did not output 0, got ${result[0]}`);

    result = await network.activate([0, 1]);
    if (Math.round(result[0]) != 1)
      throw new Error(`[0,1] did not output 1, got ${result[0]}`);

    result = await network.activate([1, 0]);
    if (Math.round(result[0]) != 1)
      throw new Error(`[1,0] did not output 1, got ${result[0]}`);

    result = await network.activate([1, 1]);
    if (Math.round(result[0]) != 0)
      throw new Error(`[1,1] did not output 0, got ${result[0]}`);
  }
};



export default new XOR;