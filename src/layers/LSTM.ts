import Network, { Boundary, Layer } from '../Network';
import { ActivationTypes } from "lysergic";
import numbers = require("../utils/numbers");

// this is a basic LSTM block, consisting of a memory cell, with input, forget and output gates

const defaults = {
  peepholes: true
};


export default class LSTM implements Layer {

  peepholes: boolean;

  prevLayer = null;
  nextLayer = null;
  inputGate = null;
  forgetGate = null;
  memoryCell = null;
  outputGate = null;

  constructor(public memoryBlocks: number, { peepholes } = defaults) {
    this.peepholes = peepholes;
  }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary == null) {
      throw new Error('\'LSTM\' can\'t be the first layer of the network!');
    }

    this.prevLayer = boundary.layer;
    this.inputGate = network.engine.addLayer(this.memoryBlocks, ActivationTypes.LOGISTIC_SIGMOID);
    this.forgetGate = network.engine.addLayer(this.memoryBlocks, ActivationTypes.LOGISTIC_SIGMOID);

    // WHY SOFTSIGN? https://deeplearning4j.org/lstm.html
    this.memoryCell = network.engine.addLayer(this.memoryBlocks, ActivationTypes.SOFTSIGN);

    this.outputGate = network.engine.addLayer(this.memoryBlocks, ActivationTypes.LOGISTIC_SIGMOID);

    // connection from previous layer to memory cell
    connectLayers(network, this.prevLayer, this.memoryCell);

    // self-connection from memory cell
    connectLayers(network, this.memoryCell, this.memoryCell);

    // connections from previous layer to gates
    connectLayers(network, this.prevLayer, this.inputGate);
    connectLayers(network, this.prevLayer, this.forgetGate);
    connectLayers(network, this.prevLayer, this.outputGate);

    // input and forget gates
    gateLayer(network, this.inputGate, this.memoryCell, 'INBOUND');
    gateLayer(network, this.forgetGate, this.memoryCell, 'SELF');

    // set the boundary for next layer
    return {
      width: this.memoryCell.length,
      height: 1,
      depth: 1,
      layer: this.memoryCell
    };
  }

  reverseInit(network, boundary) {

    this.nextLayer = boundary.layer;

    // direct connection from prevLayer to nextLayer
    connectLayers(network, this.prevLayer, this.nextLayer);

    // output gate
    gateLayer(network, this.outputGate, this.memoryCell, 'OUTBOUND');

    // recurrent connections from each memory cell to each gates (aka peepholes) - Fig. 4 (b)
    if (this.peepholes) {
      connectLayers(network, this.memoryCell, this.inputGate);
      connectLayers(network, this.memoryCell, this.forgetGate);
      connectLayers(network, this.memoryCell, this.outputGate);
    }
  }
}

// ---

// helper to connect layers
function connectLayers(network: Network, from: number[], to: number[], connectionType?) {
  let weights = numbers.getWeightsFor(from.length * to.length, network.engine.activationFunction[from[0]], network.engine.random);

  let i = 0;

  from.forEach((neuronA, indexA) => {
    to.forEach((neuronB, indexB) => {
      if (from !== to || indexA === indexB) { // if layers are different, connect all to all, if self-connecting layer, just connect matching indexes (elementwise)
        network.addConnection(neuronA, neuronB, weights[i++]);
      }
    });
  });
}

// helper to gate layers
function gateLayer(network: Network, gaterLayer: number[], gatedLayer: number[], gateType: 'SELF' | 'INBOUND' | 'OUTBOUND') {
  let from: number, to: number, gater: number;
  for (let index = 0; index < gaterLayer.length; index++) {
    switch (gateType) {
      // the gater layer will gate all the self connections of the gated layer
      case 'SELF':
        from = gatedLayer[index];
        to = gatedLayer[index];
        gater = gaterLayer[index];
        network.addGate(from, to, gater);
        break;
      // the gater layer will gate all the inbound connections into the gated layer
      case 'INBOUND':
        to = gatedLayer[index];
        gater = gaterLayer[index];
        network.engine.connections
          .filter(connection => connection.to === to) // get all the connections projected into this unit
          .filter(connection => connection.from !== to) // filter out self-connections
          .map(connection => connection.from) // grab the unit projecting the connection
          .forEach(from => network.addGate(from, to, gater)); // add a gate for each such unit
        break;
      // the gater layer will gate all the outbound connections from the gated layer
      case 'OUTBOUND':
        gatedLayer.forEach(neuron => {
          from = gatedLayer[index];
          gater = gaterLayer[index];
          network.engine.connections
            .filter(connection => connection.from === from) // get all the connections projected from this unit
            .filter(connection => connection.to !== from) // filter out self-connections
            .map(connection => connection.to) // grab the unit receiving the connection
            .forEach(to => network.addGate(from, to, gater)); // add a gate for each such unit
        });
        break;
    }
  }
}
