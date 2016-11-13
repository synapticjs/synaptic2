
// -- Cost Types

export const CostTypes = {
  MSE: 0,
  CROSS_ENTROPY: 1,
  BINARY: 2
}

// -- defaults

export const defaults = {
  learningRate: 0.1,
  minError: 0.05,
  maxIterations: 2000,
  costFunction: CostTypes.MSE
}

// -- Trainer

export default class Trainer {

  constructor (network) {
    this.network = network
  }

  train (dataset, options) {
    return network.backend.train(dataset, options)
  }

  test (dataset, options) {
    // TODO
  }
}
