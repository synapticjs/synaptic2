
// -- Cost Types

export const CostTypes = {
  CROSS_ENTROPY: 'Cross Entropy',
  MSE: 'Mean Square Error',
  BINARY: 'Binary'
}

// -- Trainer

export default class Trainer {

    constructor (network) {
      this.network = network
    }

    train (dataset, options) {
      return network.backend.train(dataset, options)
    }
}
