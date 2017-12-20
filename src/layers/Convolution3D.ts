import Network, { Boundary, Layer } from '../Network';
import BaseConvolution from "./BaseConvolution";

// this is based on this article: http://cs231n.github.io/convolutional-networks/

export const PADDING_SAME = 'same';
export const PADDING_VALID = 'valid';
export type PADDING_TYPE = 'same' | 'valid';


export default class Convolution3D extends BaseConvolution implements Layer {

  init(network: Network, boundary: Boundary): Boundary {

    return this.buildConvolution(
      network,
      boundary
    );
  }
}
