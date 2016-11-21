import Network, { IBoundary } from '../Network'

export default class Input2D {
  layer: number[]

  constructor(public width: number, public height: number) {
    this.layer = null
  }

  init(network: Network, boundary: IBoundary): IBoundary {

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
