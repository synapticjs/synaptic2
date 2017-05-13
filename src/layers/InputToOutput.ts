import Network, { Boundary, Layer } from '../Network';

// this is a direct all-to-all connection from input to output
export default class InputToOutput implements Layer {

  reverseInit(network: Network, boundary: Boundary) {

    if (boundary != null) {
      throw new Error('\'InputToOutput\' must be the last layer of the network!');
    }

    const layers = network.getLayers();
    const inputLayer = layers[0];
    const outputLayer = layers[layers.length - 1];

    inputLayer.forEach(from => {
      outputLayer.forEach(to => {
        network.addConnection(from, to);
      });
    });
  }
}
