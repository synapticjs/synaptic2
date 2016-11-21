// this is based on this article: http://cs231n.github.io/convolutional-networks/

export default class Convolution3D {

  constructor ({ filter = 1, stride = 1, padding = 0 }) {
    this.filter = filter
    this.stride = stride
    this.padding = padding
    this.layer = null
  }

  init (network, boundary) {

    if (boundary == null) {
      throw new Error('\'Convolution3D\' cannot be the first layer of the network!')
    }

    this.layer = network.addLayer()

    let x, y, z, fromX, fromY, fromZ, from, to
    for (z = this.padding; z < boundary.depth - this.padding; z += this.stride) {
      for (y = this.padding; y < boundary.height - this.padding; y += this.stride) {
        for (x = this.padding; x < boundary.width - this.padding; x += this.stride) {

          // create convolution layer units
          const unit = network.addUnit()
          this.layer.push(unit)

          // connect units to prev layer
          const filterRadious = this.filter / 2
          for (let offsetZ = -filterRadious; offsetZ < filterRadious; offsetZ++) {
            for (let offsetY = -filterRadious; offsetY < filterRadious; offsetY++) {
              for (let offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
                fromX = Math.round(x + offsetX)
                fromY = Math.round(y + offsetY)
                fromZ = Math.round(y + offsetZ)
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
      depth: (boundary.depth - this.padding) / this.stride | 0,
      layer: this.layer
    }
  }

  // returns true if the coords are inside the boundara
  isValid (boundary, x, y, z) {
    return  x > 0 &&
            x < boundary.width &&
            y > 0 &&
            y < boundary.height
            z > 0 &&
            z < boundary.depth
  }
}
