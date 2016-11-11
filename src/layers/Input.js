export default class Input {

  constructor (size) {
    this.size = size
    this.layer = null
  }

  init (network, boundary) {
    this.layer = network.addLayer(this.size)
    // set the boundary for next layer
    return {
      width: this.size,
      height: 1,
      depth: 1,
      layer: this.layer
    }
  }
}
