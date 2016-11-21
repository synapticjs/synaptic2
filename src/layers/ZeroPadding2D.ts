import { ActivationTypes } from '../Engine'
import Network, { IBoundary, INetworkLayer } from '../Network'

export default class ZeroPadding2D implements INetworkLayer {

  layer: number[] = null

  constructor(public padding: number) {

  }

  init(network: Network, boundary: IBoundary): IBoundary {

    if (boundary == null) {
      throw new Error('\'ZeroPadding2D\' cannot be the first layer of the network!')
    }

    this.layer = network.addLayer()

    let x, y, z, from, to
    for (z = 0; z < boundary.depth; z++) {
      for (y = -this.padding; y < boundary.height + this.padding; y++) {
        for (x = -this.padding; x < boundary.width + this.padding; x++) {

          const unit = network.addUnit(ActivationTypes.IDENTITY)
          this.layer.push(unit)

          // only connect the non-padding units
          if (!this.isPadding(boundary, x, y, z)) {
            to = unit
            from = boundary.layer[x + y * boundary.height + z * boundary.height * boundary.depth]
            network.addConnection(from, to)
          }
        }
      }
    }

    return {
      width: boundary.width + this.padding * 2,
      height: boundary.height + this.padding * 2,
      depth: boundary.height,
      layer: this.layer
    }
  }

  // returns true if the coords fall within the zero-padding area
  isPadding(boundary, x, y, z) {
    return x < 0 ||
      x > boundary.width ||
      y < 0 ||
      y > boundary.height ||
      z < 0 ||
      z > boundary.depth
  }
}
