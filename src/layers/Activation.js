import { ActivationTypes } from '../Engine'

export class ReLU {

  constructor () {
    this.layer = null
  }

  init (network, boundary) {

    if (boundary == null) {
      throw new Error('\'Activation.ReLU\' cannot be the first layer of the network!')
    }

    const prevLayer = boundary.layer
    this.layer = network.addLayer(prevLayer.length, ActivationTypes.RELU)

    for (let i = 0; i < prevLayer.length; i++) {
      network.addConnection(prevLayer[i], this.layer[i], 1)
    }

    // this layer doesn't change the boundary's dimensions
    return {
      ...boundary,
      layer: this.layer
    }
  }
}
