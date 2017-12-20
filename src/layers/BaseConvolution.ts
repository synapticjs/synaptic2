import Network, { Boundary } from '../Network';
import numbers = require("../utils/numbers");
import { Activations, Topology } from "lysergic";

// this is based on this article: http://cs231n.github.io/convolutional-networks/

export const PADDING_SAME = 'same';
export const PADDING_VALID = 'valid';
export type PADDING_TYPE = 'same' | 'valid';

export interface IConvolutionOptions extends Topology.ITopologyUnitOptions {
  kernelSize: number | number[];
  strides: number | number[];
  filters: number;
  padding: PADDING_TYPE;
  activationFunction?: Activations.ActivationTypes;
}

export interface IBuildConvolutionOptions {
  xStart?: number;
  xEnd?: number;
  xIncr?: number;
  yStart?: number;
  yEnd?: number;
  yIncr?: number;
  zStart?: number;
  zEnd?: number;
  zIncr?: number;
  offsetXStart?: number;
  offsetXEnd?: number;
  offsetYStart?: number;
  offsetYEnd?: number;
  offsetZStart?: number;
  offsetZEnd?: number;
  fillXStart?: number;
  fillXEnd?: number;
  fillYStart?: number;
  fillYEnd?: number;
  fillZStart?: number;
  fillZEnd?: number;
}

export default class BaseConvolution {

  layer: number[];
  activationFunction: Activations.ActivationTypes = Activations.ActivationTypes.LOGISTIC_SIGMOID;

  constructor(public options: IConvolutionOptions) {
    const { activationFunction = Activations.ActivationTypes.LOGISTIC_SIGMOID } = options;
    this.activationFunction = activationFunction;
  }

  buildConvolution(network: Network, boundary: Boundary, options: IBuildConvolutionOptions = {}): Boundary {

    if (boundary == null) {
      throw new Error('\'BaseConvolution\' can\'t be the first layer of the network!');
    }

    this.layer = network.addLayer();

    let stridesX, stridesY, stridesZ;
    if (Array.isArray(this.options.kernelSize)) {
      stridesX = this.options.strides[0] | 0;
      stridesY = this.options.strides[1] | 0;
      stridesZ = this.options.strides[2] | 0;
    } else {
      stridesX = stridesY = stridesZ = this.options.kernelSize / 2 | 0;
    }

    let kernelRadiousX, kernelRadiousY, kernelRadiousZ;
    if (Array.isArray(this.options.kernelSize)) {
      kernelRadiousX = (this.options.kernelSize[0] | 0) / 2 | 0;
      kernelRadiousY = (this.options.kernelSize[1] | 0) / 2 | 0;
      kernelRadiousZ = (this.options.kernelSize[2] | 0) / 2 | 0;
    } else {
      kernelRadiousX = kernelRadiousY = kernelRadiousZ = this.options.kernelSize / 2 | 0;
    }

    const paddingX = this.options.padding.toLowerCase() === PADDING_SAME ? 0 : kernelRadiousX / 2 | 0;
    const paddingY = this.options.padding.toLowerCase() === PADDING_SAME ? 0 : kernelRadiousY / 2 | 0;
    const paddingZ = this.options.padding.toLowerCase() === PADDING_SAME ? 0 : kernelRadiousZ / 2 | 0;

    const connections: { from: number, to: number }[] = [];
    let width, height, depth, x, y, z, fromX, fromY, fromZ, fillX, fillY, fillZ, from, to;

    const mergedOptions = {
      xStart: paddingX,
      xEnd: boundary.width - paddingX,
      xIncr: stridesX,
      yStart: paddingY,
      yEnd: boundary.height - paddingY,
      yIncr: stridesY,
      zStart: paddingZ,
      zEnd: boundary.depth - paddingZ,
      zIncr: stridesZ,
      offsetXStart: -kernelRadiousX,
      offsetXEnd: kernelRadiousX,
      offsetYStart: -kernelRadiousY,
      offsetYEnd: kernelRadiousY,
      offsetZStart: -kernelRadiousZ,
      offsetZEnd: kernelRadiousZ,
      fillXStart: 0,
      fillXEnd: 1,
      fillYStart: 0,
      fillYEnd: 1,
      fillZStart: 0,
      fillZEnd: 1,
      ...options
    };

    const {
      xStart,
      xEnd,
      xIncr,
      yStart,
      yEnd,
      yIncr,
      zStart,
      zEnd,
      zIncr,
      offsetXStart,
      offsetXEnd,
      offsetYStart,
      offsetYEnd,
      offsetZStart,
      offsetZEnd,
      fillXStart,
      fillXEnd,
      fillYStart,
      fillYEnd,
      fillZStart,
      fillZEnd
    } = mergedOptions;

    let filter;
    for (filter = 0; filter < this.options.filters; z++) {
      for (z = zStart; z < zEnd; z += zIncr) {
        for (y = yStart; y < yEnd; y += yIncr) {
          for (x = xStart; x < xEnd; x += xIncr) {

            // create convolution layer units
            const unit = network.addUnit();
            this.layer.push(unit);

            for (let offsetZ = offsetZStart; offsetZ < offsetZEnd; offsetZ++) {
              for (let offsetY = offsetYStart; offsetY < offsetYEnd; offsetY++) {
                for (let offsetX = offsetXStart; offsetX < offsetXEnd; offsetX++) {

                  fromX = Math.round(x + offsetX);
                  fromY = Math.round(y + offsetY);
                  fromZ = Math.round(z + offsetZ);

                  for (fillZ = fillZStart; fillZ < fillZEnd; fillZ++) {
                    for (fillY = fillYStart; fillY < fillYEnd; fillY++) {
                      for (fillX = fillXStart; fillX < fillXEnd; fillX++) {

                        fromX += fillX;
                        fromY += fillY;
                        fromZ += fillZ;

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
          }
        }
      }
    }

    let weights = numbers.getWeightsFor(connections.length, this.layer.length, boundary.totalLayers, boundary.layerIndex, this.activationFunction, network.generator);

    connections.forEach(($, $$) => {
      network.addConnection($.from, $.to, weights[$$]);
    });

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
