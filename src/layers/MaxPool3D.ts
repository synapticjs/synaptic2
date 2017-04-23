import { ActivationTypes } from '../Engine'
import Network, { Boundary, Layer } from '../Network'

export default class MaxPool3D implements Layer {

  gater: number[] = null
  layer: number[] = null

  constructor(public downsampling = 2) { }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary == null) {
      throw new Error('\'MaxPool3D\' can\'t be the first layer of the network!')
    }

    this.gater = network.addLayer()
    this.layer = network.addLayer()

    let x, y, z, fromX, fromY, fromZ
    for (let z = 0; y < boundary.depth; z += this.downsampling) {
      for (let y = 0; y < boundary.height; y += this.downsampling) {
        for (let x = 0; x < boundary.width; x += this.downsampling) {

          const unit = network.addUnit(ActivationTypes.IDENTITY)
          this.layer.push(unit)

          for (let offsetZ = 0; offsetZ < this.downsampling; offsetZ++) {
            for (let offsetY = 0; offsetY < this.downsampling; offsetY++) {
              for (let offsetX = 0; offsetX < this.downsampling; offsetX++) {

                fromX = x + offsetX
                fromY = y + offsetY
                fromZ = z + offsetZ

                if (this.isValid(boundary, fromX, fromY, fromZ)) {
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
    }

    // set the boundary for next layer
    return {
      width: boundary.width / this.downsampling | 0,
      height: boundary.height / this.downsampling | 0,
      depth: boundary.depth / this.downsampling | 0,
      layer: this.layer
    }
  }

  // returns true if the coords fall within the layer area
  isValid(boundary, x, y, z) {
    return x > 0 &&
      x < boundary.width &&
      y > 0 &&
      y < boundary.height &&
      z > 0 &&
      z < boundary.depth
  }
}
