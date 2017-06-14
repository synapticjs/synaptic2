import Network, { Boundary, Layer } from '../Network';
import { ActivationTypes } from "lysergic";
import numbers = require("../utils/numbers");

export default class Dense implements Layer {

  layer: number[];

  constructor(public size: number, public activationType?: ActivationTypes) { }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary == null) {
      throw new Error('\'Dense\' can\'t be the first layer of the network!');
    }

    this.layer = network.engine.addLayer(this.size, this.activationType);

    let weights = numbers.randn(boundary.layer.length * this.layer.length, 0, 1, network.engine.random);

    // http://cs231n.github.io/neural-networks-2/
    numbers.gaussianNormalization(weights, 2);

    let actualValue = 0;

    // connect all units from previous layer to this one
    boundary.layer.forEach(from => {
      this.layer.forEach(to => {
        network.addConnection(from, to, weights[actualValue++]);
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
