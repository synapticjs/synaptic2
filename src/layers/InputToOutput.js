// this is a direct all-to-all connection from input to output
export class Direct {

  reverseInit (network, boundary) {

    const inputLayer = network.layers[0]
    const outputLayer = network.layers[network.layers.length - 1]

    inputLayer.forEach(from => {
      outputLayer.forEach(to => {
        network.addConnection(from, to)
      })
    })
  }
}
