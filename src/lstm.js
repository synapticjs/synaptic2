import Network, { gateTypes } from './network'

const {
  INBOUND,
  OUTBOUND,
  SELF
} = gateTypes

export default class LSTM extends Network {

  constructor (inputSize, memoryBlocks, outputSize) {
    super()

    // create layers
    this.inputLayer = this.addLayer(inputSize)
    this.inputGate = this.addLayer(memoryBlocks)
    this.forgetGate = this.addLayer(memoryBlocks)
    this.memoryCell = this.addLayer(memoryBlocks)
    this.outputGate = this.addLayer(memoryBlocks)
    this.outputLayer = this.addLayer(outputSize)

    // connection from input layer to memory cell
    this.connectLayers(this.inputLayer, this.memoryCell)

    // self-connection from memory cell
    this.connectLayers(this.memoryCell, this.memoryCell)

    // connection from memory cell to output layer
    this.connectLayers(this.memoryCell, this.outputLayer)

    // connections from input layer to gates
    this.connectLayers(this.inputLayer, this.inputGate)
    this.connectLayers(this.inputLayer, this.forgetGate)
    this.connectLayers(this.inputLayer, this.outputGate)

    // direct connection from input layer to output layer
    this.connectLayers(this.inputLayer, this.outputLayer)

    // gates
    this.gateLayer(this.inputGate, this.memoryCell, INBOUND)
    this.gateLayer(this.forgetGate, this.memoryCell, SELF)
    this.gateLayer(this.outputGate, this.memoryCell, OUTBOUND)

    // recurrent connections from each memory cell to each gates - Fig. 4 (b)
    this.connectLayers(this.memoryCell, this.inputGate)
    this.connectLayers(this.memoryCell, this.forgetGate)
    this.connectLayers(this.memoryCell, this.outputGate)
  }
}
