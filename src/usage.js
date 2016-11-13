import Network from './network'

import {
  Activation,
  Convolution,
  Convolution2D,
  Convolution3D,
  Dense,
  Dropout,
  Input,
  Input2D,
  Input3D,
  InputToOutput,
  LSTM,
  MaxPool,
  MaxPool2D,
  MaxPool3D,
  ZeroPadding,
  ZeroPadding2D,
  ZeroPadding3D
} from './layers'

const Perceptron = new Network(
  new Input(2),
  new Dense(5),
  new Dense(1)
)

const Perceptron_with_dropout = new Network(
  new Input(2),
  new Dropout(0.2),
  new Dense(5),
  new Dense(1)
)

const LSTM_simple = new Network(
  new Input(2),
  new LSTM(5),
  new Dense(1)
)

const LSTM_with_direct_input_to_output = new Network(
  new Input(2),
  new LSTM(5),
  new Dense(1),
  new InputToOutput()
)


const LSTM_stacked = new Network(
  new Input(2),
  new LSTM(10),
  new LSTM(6),
  new LSTM(3),
  new Dense(1)
)

const ConvNet = new Network(
  new Input3D(32, 32, 3), // 32x32x3
  new Dropout(.2),
  new Convolution2D({  // 32x32x12
    filter: 5,
    depth: 12,
    stride: 1,
    zeroPadding: 1
  }),
  new Activation.ReLU(), // 32x32x12
  new MaxPool2D(2), // 16x16x12
  new Dense(10) // 10x1x1
)

// with config
const Net = new Network({
    bias: false,
    generator: Math.random,
    layers: [
      new Input3D(32, 32, 3), // 32x32x3
      new Dropout(.2),
      new Convolution2D({  // 32x32x12
        filter: 5,
        depth: 12,
        stride: 1,
        zeroPadding: 1
      }),
      new Activation.ReLU(), // 32x32x12
      new MaxPool2D(2), // 16x16x12
      new Dense(10) // 10x1x1
    ]
})
