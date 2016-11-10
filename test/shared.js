
function connectLayers (fromLayer, toLayer, connectionType) {
  if (typeof connectionType === 'undefined') {
    // if no connectionType is specified, then by default the connection will be DENSE, unless the layer is self-connecting
    connectionType = (fromLayer !== toLayer)
      ? connectionTypes.DENSE()
      : connectionTypes.SELF()
  }
  fromLayer.forEach((neuronA, indexA) => {
    toLayer.forEach((neuronB, indexB) => {
      if (connectionType(indexA, indexB)) { // the connection type function decides which neurons from layer A can connecto to which neurons in layer B
        this.addConnection(neuronA, neuronB)
      }
    })
  })
}

function gateLayer (gaterLayer, gatedLayer, gateType) {
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

function buildPerceptron (engine) {

}

function buildLSTM (engine) {

}

function testEngine (Engine) {

  test('engine exists', () => {
    expect(new Engine()).toBeDefined()
  })
}


module.exports = {
  testEngine: testEngine
}
