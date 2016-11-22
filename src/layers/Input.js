import Network, { BoundaryType } from '../Network'

export default class Input {
  constructor(size: number) {
    this.size = size
  }

  init(network: Network, boundary: BoundaryType): BoundaryType {

    if (boundary != null) {
      throw new Error('\'Input\' must be the first layer of the network!')
    }

    let layer = network.addLayer(this.size)
    // set the boundary for next layer
    return {
      width: this.size,
      height: 1,
      depth: 1,
      layer: layer
    }
  }
}
