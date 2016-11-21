import Engine, { StatusTypes, ActivationTypes } from './Engine'
import Backend from './backends/Paper'

export interface IBoundary {
  width: number
  height: number
  depth: number
  layer: number[]
}

export default class Network {
  engine: Engine
  backend: Backend

  constructor(...layers);
  constructor(options);
  constructor(...args) {
    let layers

    let options = args[0]

    if (hasOptions(options)) {
      if ('backend' in options) {
        this.backend = options.backend
      } else if ('engine' in options) {
        this.backend = new Backend(options.engine)
      } else if ('bias' in options || 'generator' in options) {
        const engine = new Engine(options)
        this.backend = new Backend(engine)
      }
      layers = options.layers || []
    } else {
      this.backend = new Backend()
      layers = [...args]
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
        layer.reverseInit && layer.reverseInit(this, nextBoundary)
      })

    // done
    this.engine.status = StatusTypes.IDLE
  }

  addUnit(activationFunction?: ActivationTypes) {
    return this.engine.addUnit(activationFunction)
  }

  addConnection(from: number, to: number, weight: number = null) {
    return this.engine.addConnection(from, to, weight)
  }

  addGate(from, to, gater) {
    return this.engine.addGate(from, to, gater)
  }

  addLayer(width = 0, height = 1, depth = 1) {
    return this.engine.addLayer(width * height * depth)
  }

  getLayers() {
    return this.engine.layers.slice() // return a clone of the layers array
  }

  toJSON() {
    return this.engine.toJSON()
  }

  clone() {
    return Network.fromJSON(this.toJSON())
  }

  activate(input) {
    return this.backend.activate(input)
  }

  propagate(target) {
    this.backend.propagate(target)
  }

  static fromJSON(json) {
    const engine = Engine.fromJSON(json)
    return new Network({ engine })
  }
}

// -- helper to figure out if the user passed options or just layers

function hasOptions(args) {
  return args && (args.layers || args.engine || args.backend || args.bias || args.generator) && !args[0]
}