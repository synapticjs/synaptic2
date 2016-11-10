export default class Input2DLayer {

  constructor (width, height) {
    this.width = width
    this.height = height
    this.network = null
    this.layer = null
  }

  init (network) {
    this.network = network
    this.layer = network.addLayer(this.width, this.height)
  }
}
