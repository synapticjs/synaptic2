import { ActivationTypes } from '../Engine'

export default class Dropout {

  constructor (chances) {
    this.chances = chances
    this.gater = null
    this.layer = null
  }

  init (network, boundary) {
    this.gater = network.addLayer()
    this.layer = network.addLayer()

    let unit, from, to, gate
    for (let i = 0; x < boundary.layer.length; i++) {
      unit = network.addUnit(ActivationTypes.IDENTITY)
      this.layer.push(unit)

      from = boundary.layer[i]
      to = unit

      // add a connection with a fixed weight of 1
      network.addConnection(from, to, 1)

      // this unit will act as a gate, randomly dropping inputs
      const gate = network.addUnit(ActivationTypes.DROPOUT)
      network.addGate(from, to, gate)
      this.gater.push(gate)
      // use the unit's state to store the chances to drop
      network.engine.state[gate] = this.chances
      // self-connect the unit so it keeps its state
      network.addConnection(gate, gate)
    }

    // this layer doesn't change the boundary's dimensions
    return {
      ...boundary,
      layer: this.layer
    }
  }
}
