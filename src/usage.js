import Network from './network'

import {
  Convolution2D,
  Dense,
  Input,
  Input2D,
  LSTM,
  MaxPool2D,
  Activation
} from './layers'

const Perceptron = new Network(
  new Input(2),
  new Dense(5),
  new Dense(1)
)

const LSTM = new Network(
  new LSTM({
    inputSize: 2,
    memoryBlocks: 5,
    outputSize: 1
  })
)

const ConvNet = new Network(
  new Input2D(32, 32),
  new Convolution2D({
    filter: 5,
    depth: 12,
    stride: 2,
    zerPadding: 0
  }),
  new Activation.ReLU(),
  new MaxPool2D(2),
  new Dense(10)
)
