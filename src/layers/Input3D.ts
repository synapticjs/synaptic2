import Network, { Boundary, Layer } from '../Network'

export default class Input3D implements Layer {

  layer: number[] = null

  constructor(public width: number, public height: number, public depth: number) { }

  init(network: Network, boundary: Boundary): Boundary {
    if (boundary != null) {
      throw new Error('\'Input3D\' must be the first layer of the network!')
    }

    this.layer = network.addLayer(this.width, this.height, this.depth)
    // set the boundary for next layer
    return {
      width: this.width,
      height: this.height,
      depth: this.depth,
      layer: this.layer
    }
  }
}
