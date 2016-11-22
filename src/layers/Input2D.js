import Network, { BoundaryType } from '../Network'

export default class Input2D {

  constructor(width: number, height: number) {
    this.layer = null
    this.width = width
    this.height = height
  }

  init(network: Network, boundary: BoundaryType): BoundaryType {

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
