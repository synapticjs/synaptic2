import { activationTypes } from '../engine'

export default class MaxPool2D {

  constructor (downsampling = 2) {
    this.downsampling = downsampling
    this.gater = null
    this.layer = null
  }

  init (network, boundary) {
    this.gater = network.addLayer()
    this.layer = network.addLayer()

    let x, y, fromX, fromY
    for (let x = 0; x < boundary.width; x += this.downsampling) {
      for (let y = 0; y < boundary.height; y += this.downsampling) {
        const unit = network.addUnit(activationTypes.FIXED)
        this.layer.push(unit)

        for (let offsetX = 0; offsetX < this.downsampling; offsetX++) {
          for (let offsetY = 0; offsetY < this.downsampling; offsetY++) {
          fromX = x + offsetX
          fromY = y + offsetY

          const from = boundary.layer[fromX + fromY * boundary.height]
          const to = unit

          network.addConnection(from, to, 1)

          // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
          const gate = network.addUnit(activationTypes.MAX_POOLING)
          this.gater.push(gate)
          network.addConnection(from, gate)
          network.addGate(from, to, gate)
        }
      }
    }

    // this layer sets no boundary
  }

  reverseInit (network, boundary) {

  }
}
