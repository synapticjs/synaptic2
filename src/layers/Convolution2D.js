// this is based on this article: http://cs231n.github.io/convolutional-networks/

export default class Convolution2DLayer {

  constructor ({ filter = 1, depth = 1, stride = 1, zeroPadding = 0 }) {
    this.filter = filter
    this.depth = depth
    this.stride = stride
    this.zeroPadding = zeroPadding
    this.size = 0
    this.network = null
    this.layer = null
  }

  init (network) {
    this.network = network
    this.layer = network.addLayer()
    const prevLayer = network.getLastLayer()

    let x, y, z, from, to
    for (x = 0; x < prevLayer.width; x += this.stride) {
      for (y = 0; y < prevLayer.height; y += this.stride) {
        for (z = 0; z < prevLayer.depth; z += this.stride) {

        // create convolution layer units
        const unit = network.addUnit()
        this.size++
        this.layer.units.push(unit)

        // connect units to prev layer
        const radious = filter/2
        for (let f = -radious; f < radious; f++) {
            const targetX = Math.floor(x + f)
            const targetY = Math.floor(y + f)
            const targetZ = z
            if (this.arePreviousLayerCoords(targetX, targetY)) {
              to = unit
              from = prevLayer.units[targetX + targetY * prevLayer.height + targetZ * prevLayer.height * prevLayer.depth]
              network.addConnection(from, to)
            } else if (this.areZeroPaddingCoords(targetX, targetY)) {
              to = unit
              from = network.addUnit() // create a zero-padding-unit
              network.engine.activation[from] = 0 // make the zero-padding-unit's activation to be zero
              network.addConnection(from, to)
            }
          }
        }
      }
    }

    this.layer.width = x
    this.layer.height = y
    this.layer.depth = z
  }

  arePreviousLayerCoords (x, y) {
    return  x > 0 &&
            x < this.width &&
            y > 0 &&
            y < this.height
  }

  areZeroPaddingCoords (x, y) {
    return  x < 0 && x > -this.zeroPadding ||
            x > this.width && x < this.width + this.zeroPadding ||
            y < 0 && y > -this.zeroPadding ||
            y > this.height && y < this.height + this.zeroPadding
  }
}
