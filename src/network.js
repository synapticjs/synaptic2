import Backend from './backends/paper'

export default class Network {

  constructor (...layers) {
    this.backend = new Backend()
    this.engine = this.backend.engine
    this.layers = []

    let prevBoundary = null
    let nextBoundary = null

    // init layers
    const boundaries = []
    layers.forEach(layer => {
      prevBoundary = layer.init && layer.init(this, prevBoundary) || prevBoundary
      boundaries.push(prevBoundary)
    })

    // reverse init layers
    boundaries.reverse()
    layers.reverse()
    .forEach((layer, index) => {
      nextBoundary = boundaries[index - 1] || nextBoundary
      boundaries[index] = layer.reverseInit && layer.reverseInit(this, nextBoundary) || boundaries[index]
    })
  }

  addUnit () {
    return this.engine.addUnit()
  }

  addConnection (from, to, weight) {
    return this.engine.addConnection(from, to, weight)
  }

  addGate (from, to, gater) {
    return this.engine.addGate(from, to, gater)
  }

  addLayer (width = 0, height = 1, depth = 1) {
    const layer = this.engine.addLayer(width * height * depth)
    this.layers.push(layer)
    return layer
  }
}
