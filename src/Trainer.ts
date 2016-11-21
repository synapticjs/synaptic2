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

  train(dataset, options = {} as any) {
    return this.network.backend.train(dataset, {
      learningRate: options.learningRate || 0.3,
      minError: options.minError || 0.0005,
      maxIterations: options.maxIterations || 5000,
      costFunction: options.costFunction || CostTypes.MSE
    })
  }

  test(dataset, options) {
    // TODO
  }
}
