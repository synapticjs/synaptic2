import Network, { Boundary, Layer } from '../Network';
import { Topology } from "lysergic";
//import numbers = require("../utils/numbers");

// this is a direct all-to-all connection from input to output
export default class InputToOutput implements Layer {

  constructor(public options: Topology.ITopologyUnitOptions = {}) {

  }

  reverseInit(network: Network, boundary: Boundary) {

    if (boundary != null) {
      throw new Error('\'InputToOutput\' must be the last layer of the network!');
    }



    const layers = network.getLayers();
    const inputLayer = layers[0];
    const outputLayer = layers[layers.length - 1];

    //let weights = numbers.getWeightsFor(inputLayer.length, outputLayer.length, layers.length, layers.length - 1, network.compiler.topology.activationFunction[outputLayer[0]], network.generator);
    //let i = 0;

    inputLayer.forEach(from => {
      outputLayer.forEach(to => {
        network.addConnection(from, to);
      });
    });
  }
}
