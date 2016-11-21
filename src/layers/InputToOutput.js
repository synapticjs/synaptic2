// this is a direct all-to-all connection from input to output
export class Direct {

  reverseInit (network, boundary) {

    if (boundary != null) {
      throw new Error('\'InputToOutput\' must be the last layer of the network!')
    }

    const layers = network.getLayers()
    const inputLayer = layers[0]
    const outputLayer = layers[layers.length - 1]

    inputLayer.forEach(from => {
      outputLayer.forEach(to => {
        network.addConnection(from, to)
      })
    })
  }
}
