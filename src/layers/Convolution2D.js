// this is based on this article: http://cs231n.github.io/convolutional-networks/

export default class Convolution2D {

  constructor ({ filter = 1, depth = 1, stride = 1, padding = 0 }) {
    this.filter = filter
    this.depth = depth
    this.stride = stride
    this.padding = padding
    this.layer = null
  }

  init (network, boundary) {

    if (boundary == null) {
      throw new Error('\'Convolution2D\' cannot be the first layer of the network!')
    }

    this.layer = network.addLayer()

    let x, y, z, fromX, fromY, fromZ, from, to
    for (z = 0; z < this.depth; z++) {
      for (y = this.padding; y < boundary.height - this.padding; y += this.stride) {
        for (x = this.padding; x < boundary.width - this.padding; x += this.stride) {

          // create convolution layer units
          const unit = network.addUnit()
          this.layer.push(unit)

          // connect units to prev layer
          const filterRadious = this.filter / 2
          for (let offsetY = -filterRadious; offsetY < filterRadious; offsetY++) {
            for (let offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
              fromX = Math.round(x + offsetX)
              fromY = Math.round(y + offsetY)
              for (fromZ = 0; fromZ < boundary.depth; fromZ++) {
                if (this.isValid(boundary, fromX, fromY, fromZ)) {
                  to = unit
                  from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth]
                  network.addConnection(from, to)
                }
              }
            }
          }
        }
      }
    }

    return {
      width: (boundary.width - this.padding) / this.stride | 0,
      height: (boundary.height - this.padding) / this.stride | 0,
      depth: this.depth,
      layer: this.layer
    }
  }

  // returns true if the coords fall within the layer area
  isValid (boundary, x, y, z) {
    return  x > 0 &&
            x < boundary.width &&
            y > 0 &&
            y < boundary.height
            z > 0 &&
            z < boundary.depth
  }
}
