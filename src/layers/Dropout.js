import { activationTypes } from '../engine'

export default class Dropout {

  constructor (chance) {
    this.chance = chance
    this.gater = null
    this.layer = null
  }

  init (network, boundary) {
    this.gater = network.addLayer()
    this.layer = network.addLayer()

    let unit, from, to, gate
    for (let i = 0; x < boundary.layer.length; i++) {
      unit = network.addUnit(activationTypes.FIXED)
      this.layer.push(unit)

      from = boundary.layer[i]
      to = unit

      // this unit will act as a gate, randomly dropping inputs
      const gate = network.addUnit(activationTypes.DROPOUT)
      this.gater.push(gate)
      network.addGate(from, to, gate)
    }

    // this layer sets no boundary
  }

  reverseInit (network, boundary) {

  }
}
