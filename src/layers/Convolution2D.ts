import Network, { Boundary, Layer } from '../Network';
import numbers = require("../utils/numbers");
import { Activations, Topology } from "lysergic";

// this is based on this article: http://cs231n.github.io/convolutional-networks/

export interface IConvolution2DOptions extends Topology.ITopologyUnitOptions {
  filter: number;
  stride: number;
  depth: number;
  padding: number;
}

export default class Convolution2D implements Layer {
  layer: number[];

  activationFunction: Activations.ActivationTypes = Activations.ActivationTypes.LOGISTIC_SIGMOID;

  constructor(public options: IConvolution2DOptions) {
    const { activationFunction = Activations.ActivationTypes.LOGISTIC_SIGMOID } = options;
    this.activationFunction = activationFunction;
  }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary == null) {
      throw new Error('\'Convolution2D\' can\'t be the first layer of the network!');
    }

    if (!boundary.width || !boundary.height) {
      throw new Error('\'Convolution2D\' needs a previous 2D layer');
    }

    this.layer = network.addLayer();

    const width = Math.round((boundary.width - this.options.padding * 2) / this.options.stride);
    const height = Math.round((boundary.height - this.options.padding * 2) / this.options.stride);
    const depth = this.options.depth || 0;

    const connections: { from: number, to: number }[] = [];
    let x, y, z, fromX, fromY, fromZ, from, to;
    for (z = 0; z < this.options.depth; z++) {
      for (y = this.options.padding; y < boundary.height - this.options.padding; y += this.options.stride) {
        for (x = this.options.padding; x < boundary.width - this.options.padding; x += this.options.stride) {
          // create convolution layer units
          const unit = network.addUnit();
          this.layer.push(unit);

          // connect units to prev layer
          const filterRadious = this.options.filter / 2 | 0;
          for (let offsetY = -filterRadious; offsetY < filterRadious; offsetY++) {
            for (let offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
              fromX = Math.round(x + offsetX);
              fromY = Math.round(y + offsetY);
              for (fromZ = 0; fromZ < boundary.depth; fromZ++) {
                if (this.isValid(boundary, fromX, fromY, fromZ)) {
                  to = unit;
                  from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
                  connections.push({
                    from: boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth],
                    to: unit
                  });
                }
              }
            }
          }
        }
      }
    }

    let weights = numbers.getWeightsFor(connections.length, this.layer.length, boundary.totalLayers, boundary.layerIndex, this.activationFunction, network.generator);

    connections.forEach(($, $$) => {
      network.addConnection($.from, $.to, weights[$$]);
    });

    //if ((depth | 0) !== (this.layer.length / (width * height))) {
    //throw new Error(`Error while creating Conv2D. Expecting depth=${depth} got ${this.layer.length / (width * height)}`);
    //}

    return {
      width,
      height,
      depth,
      layer: this.layer
    };
  }

  // returns true if the coords fall within the layer area
  isValid(boundary, x, y, z) {
    return x >= 0 &&
      x < boundary.width &&
      y >= 0 &&
      y < boundary.height &&
      z >= 0 &&
      z < boundary.depth;
  }
}
