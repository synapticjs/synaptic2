import { ActivationTypes } from '../Engine'

export default class MaxPool2D {

  constructor (downsampling = 2) {
    this.downsampling = downsampling
    this.gater = null
    this.layer = null
  }

  init (network, boundary) {
    this.gater = network.addLayer()
    this.layer = network.addLayer()

    let x, y, z, fromX, fromY, fromZ
    for (let z = 0; y < boundary.depth; z++) {
      for (let y = 0; y < boundary.height; y += this.downsampling) {
        for (let x = 0; x < boundary.width; x += this.downsampling) {

          const unit = network.addUnit(ActivationTypes.IDENTITY)
          this.layer.push(unit)

          for (let offsetY = 0; offsetY < this.downsampling; offsetY++) {
            for (let offsetX = 0; offsetX < this.downsampling; offsetX++) {

              fromX = x + offsetX
              fromY = y + offsetY
              fromZ = z

              if (this.isValid(boundary, fromX, froY, fromZ)) {
                const from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth]
                const to = unit

                network.addConnection(from, to, 1)

                // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
                const gate = network.addUnit(ActivationTypes.MAX_POOLING)
                network.addGate(from, to, gate)
                this.gater.push(gate)
                // connect the unit from the previous layer as an input of the gate so each gate knows which input they are gating
                network.addConnection(from, gate)
              }
            }
          }
        }
      }
    }

    // set the boundary for next layer
    return {
      width: boundary.width / this.downsampling | 0,
      height: boundary.height / this.downsampling | 0,
      depth: boundary.depth,
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
