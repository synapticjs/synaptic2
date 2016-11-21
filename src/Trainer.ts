import Network from './Network'
// -- Cost Types

export enum CostTypes {
  MSE,
  CROSS_ENTROPY,
  BINARY
}

// -- Trainer

export default class Trainer {
  constructor(public network: Network) {

  }

  train(dataset, { learningRate, minError, maxIterations, costFunction }) {
    return this.network.backend.train(dataset, {
      learningRate: learningRate || 0.3,
      minError: minError || 0.0005,
      maxIterations: maxIterations || 5000,
      costFunction: costFunction || CostTypes.MSE
    })
  }

  test(dataset, options) {
    // TODO
  }
}
