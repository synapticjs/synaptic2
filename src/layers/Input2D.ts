import Network, { Boundary, Layer } from '../Network'

export default class Input2D implements Layer {
  
  layer: number[] = null

  constructor(public width: number, public height: number) { }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary != null) {
      throw new Error('\'Input2D\' must be the first layer of the network!')
    }

    this.layer = network.addLayer(this.width, this.height)
    // set the boundary for next layer
    return {
      width: this.width,
      height: this.height,
      depth: 1,
      layer: this.layer
    }
  }
}
