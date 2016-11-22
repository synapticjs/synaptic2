// core
import Engine from './Engine'
import Network from './Network'
import Trainer from './Trainer'

// backends
import ASM from './backends/ASM'
import BLAS from './backends/BLAS'
import CPU from './backends/CPU'
import GPU from './backends/GPU'
import Paper from './backends/Paper'
import WebWorker from './backends/WebWorker'

const backends = {
  ASM,
  BLAS,
  CPU,
  GPU,
  Paper,
  WebWorker
}

// layers
import Activation from './layers/Activation'
import Convolution from './layers/Convolution'
import Convolution2D from './layers/Convolution2D'
import Convolution3D from './layers/Convolution3D'
import Dense from './layers/Dense'
import Dropout from './layers/Dropout'
import Input from './layers/Input'
import Input2D from './layers/Input2D'
import Input3D from './layers/Input3D'
import InputToOutput from './layers/InputToOutput'
import LSTM from './layers/LSTM'
import MaxPool from './layers/MaxPool'
import MaxPool2D from './layers/MaxPool2D'
import MaxPool3D from './layers/MaxPool3D'
import ZeroPadding from './layers/ZeroPadding'
import ZeroPadding2D from './layers/ZeroPadding2D'
import ZeroPadding3D from './layers/ZeroPadding3D'

const layers = {
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
}

export {
  Engine,
  Network,
  Trainer,
  backends,
  layers
}
