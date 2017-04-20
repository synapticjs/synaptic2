import Network, { IBoundary, INetworkLayer } from '../Network'
import { ActivationTypes } from '../Engine'

export class ReLU implements INetworkLayer {

  layer: number[] = null

  init(network: Network, boundary: IBoundary): IBoundary {
    if (boundary == null) {
      throw new Error('\'Activation.ReLU\' can\'t be the first layer of the network!')
    }

    const prevLayer = boundary.layer
    this.layer = network.addLayer(prevLayer.length, ActivationTypes.RELU)

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
