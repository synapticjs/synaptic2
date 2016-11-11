// this is based on this article: http://cs231n.github.io/convolutional-networks/

export default class Convolution2D {

  constructor ({ filter = 1, depth = 1, stride = 1, zeroPadding = 0 }) {
    this.filter = filter
    this.depth = depth
    this.stride = stride
    this.zeroPadding = zeroPadding
    this.layer = null
  }

  init (network, boundary) {
    this.layer = network.addLayer()

    let x, y, z, fromX, fromY, fromZ, from, to
    for (x = 0; x < boundary.width; x += this.stride) {
      for (y = 0; y < boundary.height; y += this.stride) {
        for (z = 0; z < this.depth; z++) {

        // create convolution layer units
        const unit = network.addUnit()
        this.layer.push(unit)

        // connect units to prev layer
        const radious = filter / 2
        for (let offset = -radious; offset < radious; offset++) {
            fromX = Math.round(x + offset)
            fromY = Math.round(y + offset)
            for (fromZ = 0; fromZ < boundary.depth; fromZ++) {
              if (this.inLayerArea(boundary, targetX, targetY)) {
                to = unit
                from = boundary.layer[targetX + targetY * boundary.height + targetZ * boundary.height * boundary.depth]
                network.addConnection(from, to)
              } else if (this.inZeroPaddingArea(boundary, targetX, targetY)) {
                to = unit
                from = network.addUnit() // create a zero-padding unit
                network.engine.activation[from] = 0 // set the zero-padding unit's activation to be zero
                network.addConnection(from, to)
              }
            }
          }
        }
      }
    }

    return {
      width: boundary.width / this.stride | 0,
      height: boundary.height / this.stride | 0,
      depth: this.depth,
      layer: this.layer
    }
  }

  reverseInit (network) {
    // set the boundary for prev layer
    network.setBoundary({
      width: boundary.width / this.stride | 0,
      height: boundary.height / this.stride | 0,
      depth: this.depth,
      layer: this.layer
    })
  }

  // returns true if the coords fall within the layer area
  inLayerArea (layer, x, y) {
    return  x > 0 &&
            x < layer.width &&
            y > 0 &&
            y < layer.height
  }

  // returns true if the coords fall within the zero-padding area
  inZeroPaddingArea (layer, x, y) {
    return  x < 0 && x > -this.zeroPadding ||
            x > layer.width && x < layer.width + this.zeroPadding ||
            y < 0 && y > -this.zeroPadding ||
            y > layer.height && y < layer.height + this.zeroPadding
  }
}
