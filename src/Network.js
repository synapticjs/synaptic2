import Engine, { StatusTypes } from './Engine'
import Backend from './backends/Paper'

export default class Network {

  constructor (options = []) {
    let layers

    if (hasOptions(options)) {
      if ('backend' in options) {
        this.backend = options.backend
      } else if ('engine' in options) {
        this.backend = new Backend(options.engine)
      } else if ('bias' in options || 'generator' in options) {
        const engine = new Engine(options)
        this.backend = new Backend(engine)
      }
      layers = options.layers
    } else {
      this.backend = new Backend()
      layers = [ ...options ]
    }

    this.engine = this.backend.engine

    let prevBoundary = null
    let nextBoundary = null

    // init layers
    this.engine.status = StatusTypes.INIT
    const boundaries = []
    layers.forEach(layer => {
      prevBoundary = layer.init && layer.init(this, prevBoundary) || prevBoundary
      boundaries.push(prevBoundary)
    })

    // reverse init layers
    this.engine.status = StatusTypes.REVERSE_INIT
    boundaries.reverse()
    layers.reverse()
    .forEach((layer, index) => {
      nextBoundary = boundaries[index - 1] || nextBoundary
      boundaries[index] = layer.reverseInit && layer.reverseInit(this, nextBoundary) || boundaries[index]
    })

    // done
    this.engine.status = StatusTypes.IDLE
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
    return this.engine.addLayer(width * height * depth)
  }

  getLayers () {
    return this.engine.layers.slice() // return a clone of the layers array
  }

  toJSON () {
    return this.engine.toJSON()
  }

  clone () {
    return Network.fromJSON(this.toJSON())
  }

  activate (input) {
    return this.backend.activate(input)
  }

  propagate (target) {
    this.backend.propagate(target)
  }
}

Network.fromJSON = function (json) {
  const engine = Engine.fromJSON(json)
  return new Network({ engine })
}

function hasOptions(args) {
  return args[0].layers && !args[0].init && !args[0].reverseInit
}
