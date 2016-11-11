import { activationTypes } from '../engine'

export class ReLU {

  constructor () {
    this.layer = null
  }

  init (network, boundary) {
    const prevLayer = boundary.layer
    this.layer = network.addLayer(prevLayer.length, activationTypes.RELU)

    for (let i = 0; i < prevLayer.length; i++) {
      network.addConnection(prevLayer[i], this.layer[i], 1)
    }
  }
}
