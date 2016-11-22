import Network, { BoundaryType } from '../Network'

export default class Dense {

  constructor(size: number) {
    this.size = size
    this.layer = null
  }

  init(network: Network, boundary: BoundaryType): BoundaryType {

    if (boundary == null) {
      throw new Error('\'Dense\' cannot be the first layer of the network!')
    }

    this.layer = network.addLayer(this.size)

    // connect all units from previous layer to this one
    boundary.layer.forEach(from => {
      this.layer.forEach(to => {
        network.addConnection(from, to)
      })
    })

    // set the boundary for next layer
    return {
      width: this.size,
      height: 1,
      depth: 1,
      layer: this.layer
    }
  }
}
