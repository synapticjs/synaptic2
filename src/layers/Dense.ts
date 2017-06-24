import Network, { Boundary, Layer } from '../Network';
import { Topology } from "lysergic";
import numbers = require("../utils/numbers");

export default class Dense implements Layer {

  layer: number[];

  constructor(public size: number, public options: Topology.ITopologyUnitOptions = {}) {
    if (size <= 0)
      throw new Error('\'Dense\' must have at least one unit');
  }

  init(network: Network, boundary: Boundary): Boundary {
    if (boundary == null) {
      throw new Error('\'Dense\' can\'t be the first layer of the network!');
    }

    this.layer = network.addLayer(this.size, this.options);

    const activationFunction = network.compiler.topology.activationFunction[this.layer[0]];

    let weights = numbers.getWeightsFor(boundary.layer.length, this.layer.length, boundary.totalLayers, boundary.layerIndex, activationFunction, network.generator);

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
