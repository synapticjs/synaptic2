export default class LSTMLayer {

  constructor (inputSize, memoryBlocks, outputSize) {
    this.inputSize = inputSize
    this.memoryBlocks = memoryBlocks
    this.outputSize = outputSize

    this.network = null

    this.inputLayer
    this.inputGate
    this.forgetGate
    this.memoryCell
    this.outputGate
    this.outputLayer
  }

  init (network) {
    this.network = network

    this.inputLayer = network.addLayer(this.inputSize)
    this.inputGate = network.addLayer(this.memoryBlocks)
    this.forgetGate = network.addLayer(this.memoryBlocks)
    this.memoryCell = network.addLayer(this.memoryBlocks)
    this.outputGate = network.addLayer(this.memoryBlocks)
    this.outputLayer = network.addLayer(this.outputSize)

    // connection from input layer to memory cell
    connectLayers(network, this.inputLayer.units, this.memoryCell.units)

    // self-connection from memory cell
    connectLayers(network, this.memoryCell.units, this.memoryCell.units)

    // connection from memory cell to output layer
    connectLayers(network, this.memoryCell.units, this.outputLayer.units)

    // connections from input layer to gates
    connectLayers(network, this.inputLayer.units, this.inputGate.units)
    connectLayers(network, this.inputLayer.units, this.forgetGate.units)
    connectLayers(network, this.inputLayer.units, this.outputGate.units)

    // direct connection from input layer to output layer
    connectLayers(network, this.inputLayer.units, this.outputLayer.units)

    // gates
    gateLayer(network, this.inputGate.units, this.memoryCell.units, 'INBOUND')
    gateLayer(network, this.forgetGate.units, this.memoryCell.units, 'SELF')
    gateLayer(network, this.outputGate.units, this.memoryCell.units, 'OUTBOUND')

    // recurrent connections from each memory cell to each gates - Fig. 4 (b)
    connectLayers(network, this.memoryCell.units, this.inputGate.units)
    connectLayers(network, this.memoryCell.units, this.forgetGate.units)
    connectLayers(network, this.memoryCell.units, this.outputGate.units)
  }
}

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
