import Network, { Boundary, Layer } from '../Network';
import { Activations } from "lysergic";
import numbers = require("../utils/numbers");

export default class Dense implements Layer {

  layer: number[];

  constructor(public size: number, public activationType: Activations.ActivationTypes = Activations.ActivationTypes.LOGISTIC_SIGMOID) { }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary == null) {
      throw new Error('\'Dense\' can\'t be the first layer of the network!');
    }

    this.layer = network.addLayer(this.size, { activationFunction: this.activationType });

    let weights = numbers.getWeightsFor(boundary.layer.length, this.layer.length, boundary.totalLayers, boundary.layerIndex, this.activationType, network.generator);

    let i = 0;

    // connect all units from previous layer to this one
    boundary.layer.forEach(from => {
      this.layer.forEach(to => {
        network.addConnection(from, to, weights[i++]);
      });
    });

    // set the boundary for next layer
    return {
      width: this.size,
      height: 1,
      depth: 1,
      layer: this.layer
    };
  }
}
