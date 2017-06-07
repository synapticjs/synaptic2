import Network from './Network';
import { TrainResult, TrainOptions, TrainEntry } from './backends/Backend';
import { CostTypes } from "lysergic";

// -- Trainer

export default class Trainer {

  constructor(public network: Network) { }

  async train(dataset: TrainEntry[], {
    learningRate = 0.3,
    minError = 0.05,
    maxIterations = 1000,
    costFunction = CostTypes.MEAN_SQUARE_ERROR
  }: TrainOptions): Promise<TrainResult> {
    if (!dataset.every($ => 'input' in $ && 'output' in $)) {
      throw new Error('Not every entry contains `input` and `output` fields');
    }

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
