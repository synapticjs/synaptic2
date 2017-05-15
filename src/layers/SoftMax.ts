import Network, { Boundary, Layer } from '../Network';
import { ActivationTypes } from 'lysergic';

export default class SoftMax implements Layer {

  layer: number[] = null;

  init(network: Network, boundary: Boundary): Boundary {
    if (boundary == null) {
      throw new Error('\'Activation.SoftMax\' can\'t be the first layer of the network!')
    }

    const prevLayer = boundary.layer;

    let expY = network.engine.addLayer(prevLayer.length, ActivationTypes.EXP, false);
    let sum = network.engine.addLayer(1, ActivationTypes.INVERSE_IDENTITY, false);
    this.layer = network.engine.addLayer(prevLayer.length, ActivationTypes.IDENTITY, false);

    for (let i = 0; i < prevLayer.length; i++) {
      network.addConnection(prevLayer[i], expY[i], 1);
    }
    for (let i = 0; i < prevLayer.length; i++) {
      network.addConnection(expY[i], sum[0], 1);
    }
    for (let i = 0; i < prevLayer.length; i++) {
      network.addConnection(expY[i], this.layer[i], 1);
    }
    for (let i = 0; i < prevLayer.length; i++) {
      network.addGate(expY[i], this.layer[i], sum[0]);
    }


    /*
        [...] {input}
         |||
        [... ƒ = EXP(Yi)]--+
         |||               |
         |||               V
         ||| <----- GATES [0 ƒ = INVERSE_IDENTITY(Yi)]
        [... ƒ = IDENTITY(Yi)]
    */

    // this layer doesn't change the boundary's dimensions
    return {
      width: boundary.width,
      height: boundary.height,
      depth: boundary.depth,
      layer: this.layer
    };
  }
}
