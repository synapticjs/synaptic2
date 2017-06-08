import Network, { Boundary, Layer } from '../Network';
import { ActivationTypes } from 'lysergic';

export default class SoftMax implements Layer {

  layer: number[] = null;

  init(network: Network, boundary: Boundary): Boundary {
    if (boundary == null) {
      throw new Error('\'Activation.SoftMax\' can\'t be the first layer of the network!')
    }

    const prevLayer = boundary.layer;

    this.layer = network.engine.addLayer(prevLayer.length, ActivationTypes.SOFTMAX, false);

    prevLayer.forEach((from, i) => {
      network.addConnection(from, this.layer[i]);
    });

    // this layer doesn't change the boundary's dimensions
    return {
      width: boundary.width,
      height: boundary.height,
      depth: boundary.depth,
      layer: this.layer
    };
  }
}
