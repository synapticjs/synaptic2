import Network from './network'

export default class FeedForward extends Network {

  constructor (inputSize, hiddenSize, outputSize) {
    super()

    // create layers
    this.inputLayer = this.addLayer(inputSize)
    this.hiddenLayer = this.addLayer(hiddenSize)
    this.outputLayer = this.addLayer(outputSize)

    // connect layers
    this.connectLayers(this.inputLayer, this.hiddenLayer)
    this.connectLayers(this.hiddenLayer, this.outputLayer)
  }
}
