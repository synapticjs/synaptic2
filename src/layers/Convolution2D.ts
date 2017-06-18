import Network, { Boundary, Layer } from '../Network';
import numbers = require("../utils/numbers");
import { Activations } from "lysergic";

// this is based on this article: http://cs231n.github.io/convolutional-networks/

export interface IConvolution2DOptions {
  width: number;
  height: number;
  depth: number;

  radius: number;

  activationType?: Activations.ActivationTypes;
}

export default class Convolution2D implements Layer {
  layer: number[];

  activationType: Activations.ActivationTypes = Activations.ActivationTypes.LOGISTIC_SIGMOID;

  constructor(public options: IConvolution2DOptions) {
    const { activationType = Activations.ActivationTypes.LOGISTIC_SIGMOID } = options;
    this.activationType = activationType;
  }

  init(network: Network, boundary: Boundary): Boundary {

    if (boundary == null) {
      throw new Error('\'Convolution2D\' can\'t be the first layer of the network!');
    }

    if (!boundary.width || !boundary.height) {
      throw new Error('\'Convolution2D\' needs a previous 2D layer');
    }

    this.layer = network.addLayer();



    let x, y, z, fromX, fromY, fromZ;


    const connections: { from: number, to: number }[] = [];

    for (z = 0; z < this.options.depth; z++) {
      for (y = 0; y < this.options.height; y++) {
        for (x = 0; x < this.options.width; x++) {
          // create convolution layer units
          const unit = network.addUnit();
          this.layer.push(unit);

          // connect units to prev layer
          const filterRadious = this.options.radius / 2;
          for (let offsetY = -filterRadious; offsetY < filterRadious; offsetY++) {
            for (let offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
              fromX = Math.round(x + offsetX);
              fromY = Math.round(y + offsetY);
              for (fromZ = 0; fromZ < boundary.depth; fromZ++) {
                if (this.isValid(boundary, fromX, fromY, fromZ)) {
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

    let weights = numbers.getWeightsFor(connections.length, this.layer.length, boundary.totalLayers, boundary.layerIndex, this.activationType, network.compiler.random);

    connections.forEach(($, $$) => {
      network.addConnection($.from, $.to, weights[$$]);
    });

    return {
      width: this.options.width,
      height: this.options.height,
      depth: this.options.depth,
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
