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

const WithDropout = new Network(
  new Input(2),
  new Dropout(0.2),
  new Dense(5),
  new Dense(1)
)

const LSTM = new Network(
  new Input(2),
  new LSTM.Block(5),
  new Dense(1)
)

const AugmentedLSTM = new Network(
  new Input(2),
  new LSTM.Block(5),
  new Dense(1),
  new LSTM.Direct()
)


const StackedLSTM = new Network(
  new Input(2),
  new LSTM.Block(10),
  new LSTM.Block(6),
  new LSTM.Block(3),
  new Dense(1)
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

// they could be combined and it should work

const ConvNet = new Network(
  new Input2D(32, 32),
  new Convolution2D({
    filter: 5,
    depth: 12,
    stride: 2,
    zerPadding: 0
  }),
  new LSTM.Block(10),
  new LSTM.Block(6),
  new Activation.ReLU(),
  new MaxPool2D(2),
  new Dense(10)
)
