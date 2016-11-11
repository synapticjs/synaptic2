export default class Dense {

  constructor (size) {
    this.layer = null
  }

  init (network, boundary) {
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
