import Network from './Network';
import { TrainResult, TrainOptions } from './backends';
import { CostTypes } from "lysergic";

// -- Trainer

export default class Trainer {

  constructor(public network: Network) { }

  async train(dataset, {
    learningRate = 0.3,
    minError = 0.05,
    maxIterations = 1000,
    costFunction = CostTypes.MEAN_SQUARE_ERROR
  }: TrainOptions): Promise<TrainResult> {
    return await this.network.backend.train(dataset, {
      learningRate,
      minError,
      maxIterations,
      costFunction
    });
  }

  test(dataset, options) {
    // TODO
  }
}
