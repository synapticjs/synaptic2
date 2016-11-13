
// -- Cost Types

export const CostTypes = {
  MSE: 'Mean Square Error',
  CROSS_ENTROPY: 'Cross Entropy',
  BINARY: 'Binary'
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
    this.network.engine.training = true
    return network.backend.train(dataset, options)
    .then((result) => {
      this.network.engine.training = false
      return result
    })
  }
}
