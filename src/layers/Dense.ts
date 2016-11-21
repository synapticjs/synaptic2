import Network, { IBoundary } from '../Network'

export default class Dense {

  layer: number[]

  constructor(public size: number) { }

  init(network: Network, boundary: IBoundary): IBoundary {

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
