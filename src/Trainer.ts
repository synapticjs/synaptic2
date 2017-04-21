import Network from './Network'
// -- Cost Types

export const CostTypes = {
  MSE: 0,
  CROSS_ENTROPY: 1,
  BINARY: 2
}

// -- Trainer

export default class Trainer {

  static CostTypes = CostTypes

  constructor(public network: Network) {

  }

  train(dataset, { learningRate, minError, maxIterations, costFunction } = {} as any) {
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
