
// -- Cost Types

export const CostTypes = {
  MSE: 0,
  CROSS_ENTROPY: 1,
  BINARY: 2
}

// -- Trainer

export default class Trainer {

  constructor (network) {
    this.network = network
  }

  train (dataset, options) {
    return this.network.backend.train(dataset, {
      learningRate: 0.3,
      minError: 0.0005,
      maxIterations: 5000,
      costFunction: CostTypes.MSE,
      ...options
    })
  }

  test (dataset, options) {
    // TODO
  }
}
