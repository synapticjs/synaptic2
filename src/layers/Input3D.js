export default class Input3D {

  constructor (width, height, depth) {
    this.width = width
    this.height = height
    this.depth = depth
    this.layer = null
  }

  init (network, boundary) {
    this.layer = network.addLayer(this.width, this.height, this.depth)
    // set the boundary for next layer
    return {
      width: this.width,
      height: this.height,
      depth: this.depth,
      layer: this.layer
    }
  }
}
