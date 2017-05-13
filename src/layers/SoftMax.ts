import Network, { Boundary, Layer } from '../Network'
import { ActivationTypes, VectorFunction } from '../Engine'

export default class SoftMax implements Layer {

  layer: number[] = null

  init(network: Network, boundary: Boundary): Boundary {
    if (boundary == null) {
      throw new Error('\'Activation.SoftMax\' can\'t be the first layer of the network!')
    }

    const prevLayer = boundary.layer
    this.layer = network.addLayer(prevLayer.length, ActivationTypes.IDENTITY)

    network.addVectorFunction(this.layer, VectorFunction.SOFTMAX)

    for (let i = 0; i < prevLayer.length; i++) {
      network.addConnection(prevLayer[i], this.layer[i], 1)
    }

    // this layer doesn't change the boundary's dimensions
    return {
      width: boundary.width,
      height: boundary.height,
      depth: boundary.depth,
      layer: this.layer
    }
  }
}
