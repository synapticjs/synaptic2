export default class DenseLayer {

  constructor (size) {
    this.size = size
    this.network = null
    this.layer = null
  }

  init (network) {
    this.network = network
    this.layer = network.addLayer(this.size)

    // connect all units from previous layer to this one
    network.getLastLayer().units.forEach(from => {
      this.layer.forEach(to => {
        network.addConnection(from, to)
      })
    })
  }
}
