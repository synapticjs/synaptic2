// this is a basic LSTM block, consisting of a memory cell, with input, forget and output gates
export class Block {

  constructor (memoryBlocks) {
    this.memoryBlocks = memoryBlocks
    this.prevLayer = null
    this.nextLayer = null
    this.inputGate = null
    this.forgetGate = null
    this.memoryCell = null
    this.outputGate = null
  }

  init (network, boundary) {

    this.prevLayer = boundary.layer
    this.inputGate = network.addLayer(this.memoryBlocks)
    this.forgetGate = network.addLayer(this.memoryBlocks)
    this.memoryCell = network.addLayer(this.memoryBlocks)
    this.outputGate = network.addLayer(this.memoryBlocks)

    // connection from previous layer to memory cell
    connectLayers(network, this.prevLayer, this.memoryCell)

    // self-connection from memory cell
    connectLayers(network, this.memoryCell, this.memoryCell)

    // connections from previous layer to gates
    connectLayers(network, this.prevLayer, this.inputGate)
    connectLayers(network, this.prevLayer, this.forgetGate)
    connectLayers(network, this.prevLayer, this.outputGate)

    // input and forget gates
    gateLayer(network, this.inputGate, this.memoryCell, 'INBOUND')
    gateLayer(network, this.forgetGate, this.memoryCell, 'SELF')

    // set the boundary for next layer
    return {
      width: this.memoryCell.length,
      height: 1,
      depth: 1,
      layer: this.memoryCell
    }
  }

  reverseInit (netowork, boundary) {

    this.nextLayer = boundary.layer

    // direct connection from prevLayer to nextLayer
    connectLayers(network, this.prevLayer, this.nextLayer)

    // output gate
    gateLayer(network, this.outputGate, this.memoryCell, 'OUTBOUND')

    // recurrent connections from each memory cell to each gates - Fig. 4 (b)
    connectLayers(network, this.memoryCell, this.inputGate)
    connectLayers(network, this.memoryCell, this.forgetGate)
    connectLayers(network, this.memoryCell, this.outputGate)
  }
}

// this is a direct connection from input to output
export class Direct {

  reverseInit (network, boundary) {

    const inputLayer = network.layers[0]
    const outputLayer = network.layers[network.layers.length - 1]

    connectLayers(inputLayer, outputLayer)
  }
}

// ---

// helper to connect layers
function connectLayers (network, from, to, connectionType) {
  from.forEach((neuronA, indexA) => {
    to.forEach((neuronB, indexB) => {
      if (from !== to || indexA === indexB)) { // if layers are different, connect all to all, if self-connecting layer, just connect matching indexes (elementwise)
        network.addConnection(neuronA, neuronB)
      }
    })
  })
}

// helper to gate layers
function gateLayer (network, gaterLayer, gatedLayer, gateType) {
  let from, to, gater
  for (let index = 0; index < gaterLayer.length; index++) {
    switch (gateType) {
      // the gater layer will gate all the self connections of the gated layer
      case 'SELF':
        from = gatedLayer[index]
        to = gatedLayer[index]
        gater = gaterLayer[index]
        network.addGate(from, to, gater)
        break;
      // the gater layer will gate all the inbound connections into the gated layer
      case 'INBOUND':
        to = gatedLayer[index]
        gater = gaterLayer[index]
        network.engine.connections
          .filter(connection => connection.to === to) // get all the connections projected into this unit
          .filter(connection => connection.from !== to) // filter out self-connections
          .map(connection => connection.from) // grab the unit projecting the connection
          .forEach(from => network.addGate(from, to, gater)) // add a gate for each such unit
        break;
      // the gater layer will gate all the outbound connections from the gated layer
      case 'OUTBOUND':
        gatedLayer.forEach(neuron => {
          from = gatedLayer[index]
          gater = gaterLayer[index]
          network.engine.connections
            .filter(connection => connection.from === from) // get all the connections projected from this unit
            .filter(connection => connection.to !== from) // filter out self-connections
            .map(connection => connection.to) // grab the unit receiving the connection
            .forEach(to => network.addGate(from, to, gater)) // add a gate for each such unit
        })
        break;
    }
  }
}
