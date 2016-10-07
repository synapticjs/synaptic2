import Engine from './engine'

export const connectionTypes = {
  DENSE: () => // connects all the neurons in one layer to all the neurons in the next layer
    (indexA, indexB) => true,
  SELF: () => // connects all the neurons in a layer to themselves
    (indexA, indexB) => indexA === indexB,
  CONVOLUTION: (dimensionsA, dimensionsB, padding) => // performs a convolution in N dimensions with customizable paddings
    (indexA, indexB) => {
      const coordsA = getCoords(indexA, dimensionsA)
      const coordsB = getCoords(indexB, dimensionsB)
      const numberOfDimensions = Math.max(dimensionsA.length, dimensionB.length)
      return areCoordsInsideSameRegion(coordsA, coordsB, numberOfDimensions, padding)
    }
}

export const gateTypes = {
  INBOUND: 'The gater layer will gate all the inbound connections coming into the gated layer',
  OUTBOUND: 'The gater layer will gate all the outbound connections coming from the gated layer',
  SELF: 'The gater layer will gate all the self-connections of the gated layer',
}

export default class Network extends Engine {

  constructor () {
    super()
    this.layers = []
  }

  activate (...inputs) {
    let output = []
    // activate all the layers in order
    this.layers.forEach((layer, index) => {
      // activate input layer using the input values
      if (index === 0) {
        layer.forEach((neuron, index) => super.activate(neuron, inputs[index]))
      // activate hidden layers
      } else if (index < this.layers.length - 1) {
        layer.forEach(neuron => super.activate(neuron))
      // activate output layer and return activations
      } else {
        output = layer.reduce((output, neuron) => [...output, super.activate(neuron)], [])
      }
    })
    return output
  }

  propagate (...targets) {
    // propagate all the neurons backwards
    this.layers
    .slice(1) // no need to propagate input layer
    .reverse() // reverse the order of the layers
    .forEach((layer, layerIndex) => {
      const isOutputLayer = (layerIndex === 0) // verify if it's the output layer
      layer.concat().reverse() // reverse the order of the neurons
      .forEach((neuron, neuronIndex) => {
        if (isOutputLayer) { // the output layer gets its error from the targets
          super.propagate(neuron, targets[neuronIndex])
        } else { // the rest of the layers get the errors by backpropagation
          super.propagate(neuron)
        }
      })
    })
  }

  addLayer (size) {
    // a layer is basically an array of neuron identifiers
    const layer = []
    for (var i = 0; i < size; i++) {
      const neuron = this.addUnit()
      layer.push(neuron)
    }
    this.layers.push(layer)
    return layer
  }

  connectLayers (from, to, connectionType) {
    if (typeof connectionType === 'undefined') {
      // if no connectionType is specified, then by default the connection will be DENSE, unless the layer is self-connecting
      connectionType = (from !== to)
        ? connectionTypes.DENSE()
        : connectionTypes.SELF()
    }
    from.forEach((neuronA, indexA) => {
      to.forEach((neuronB, indexB) => {
        if (connectionType(indexA, indexB)) { // the connection type function decides which neurons from layer A can connecto to which neurons in layer B
          this.addConnection(neuronA, neuronB)
        }
      })
    })
  }

  gateLayer (gaterLayer, gatedLayer, gateType) {
    if (gaterLayer.length !== gatedLayer.length) {
      throw new Error ('Gater and Gated layers must be the same length.')
    }
    let from, to, gater
    for (let index = 0; index < gaterLayer.length; index++) {
      switch (gateType) {
        // the gater layer will gate all the self connections of the gated layer
        case gateTypes.SELF:
          from = gatedLayer[index]
          to = gatedLayer[index]
          gater = gaterLayer[index]
          this.addGate(from, to, gater)
          break;
        // the gater layer will gate all the inbound connections into the gated layer
        case gateTypes.INBOUND:
          to = gatedLayer[index]
          gater = gaterLayer[index]
          this.connections
            .filter(connection => connection.to === to) // get all the connections projected into this unit
            .filter(connection => connection.from !== to) // filter out self-connections
            .map(connection => connection.from) // grab the unit projecting the connection
            .forEach(from => this.addGate(from, to, gater)) // add a gate for each such unit
          break;
        // the gater layer will gate all the outbound connections from the gated layer
        case gateTypes.OUTBOUND:
          gatedLayer.forEach(neuron => {
            from = gatedLayer[index]
            gater = gaterLayer[index]
            this.connections
              .filter(connection => connection.from === from) // get all the connections projected from this unit
              .filter(connection => connection.to !== from) // filter out self-connections
              .map(connection => connection.to) // grab the unit receiving the connection
              .forEach(to => this.addGate(from, to, gater)) // add a gate for each such unit
          })
          break;
      }
    }
  }

  toJSON (toString = true) {
    const exported = {
      layers: this.layers,
      state: this.state,
      weight: this.weight,
      gain: this.gain,
      activation: this.activation,
      elegibilityTrace: this.elegibilityTrace,
      extendedElegibilityTrace: this.extendedElegibilityTrace,
      errorResponsibility: this.errorResponsibility,
      projectedErrorResponsibility: this.projectedErrorResponsibility,
      gatedErrorResponsibility: this.gatedErrorResponsibility,
      connections: this.connections,
      gates: this.gates,
      size: this.size
    }
    return toString ? JSON.stringify(exported) : exported
  }

  static fromJSON (json) {
    const imported = typeof json === 'string' ? JSON.parse(json) : json
    const network = new Network()

    // recreate the imported network
    for (let unit = 0; unit < imported.size; unit++) { network.addUnit() }
    imported.connections.forEach(connection => network.addConnection(connection.from, connection.to))
    imported.gates.forEach(gate => network.addGate(gate.from, gate.to, gate.gater))

    // overwrite the networks values with the imported ones
    network.layers = imported.layers
    network.state = imported.state
    network.weight = imported.weight
    network.gain = imported.gain
    network.activation = imported.activation
    network.elegibilityTrace = imported.elegibilityTrace
    network.extendedElegibilityTrace = imported.extendedElegibilityTrace
    network.errorResponsibility = imported.errorResponsibility
    network.projectedErrorResponsibility = imported.projectedErrorResponsibility
    network.gatedErrorResponsibility = imported.gatedErrorResponsibility
    network.connections = imported.connections
    network.gates = imported.gates

    return network
  }

  clone () {
    return Network.fromJSON(this.toJSON())
  }
}

// -- HELPERS

// helper to translate an index to coordinates in a set of dimensions
function getCoords (index, dimensions) {
  return dimensions.map((dimension, dimensionIndex) => {
    const offset = dimensions.slice(0, dimensionIndex).reduce((size, dim) => size * dim, 1)
    return index / offset % dimension | 0
  })
}

// verify two coordinates are inside the same region (given a set of paddings to delimitate such region)
function areCoordsInsideSameRegion (coordsA, coordsB, numberOfDimensions, padding) {
  for (let dimension = numberOfDimensions; dimension >= 0; dimension--) {
    if (dimension in coordsA && dimension in coordsB) {
      const coordA = coordsA[dimension]
      const coordB = coordsB[dimension]
      if (coordA < coordB - padding || coordA > coordB + padding) {
        return false
      }
    }
  }
  return true
}
