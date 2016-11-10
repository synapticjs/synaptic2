export default class InputLayer {

  constructor (size) {
    this.size = size
    this.network = null
    this.layer = null
  }

  init (network) {
    this.network = network
    this.layer = network.addLayer(this.size)
  }
}
