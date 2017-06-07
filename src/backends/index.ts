// This must be below the Backend class definition

import ASM from './ASM';
import CPU from './CPU';
import Paper from './Paper';
import WASM from './WASM';

export { Backend, TrainEntry, Dictionary, TrainOptions, TrainResult } from './Backend';

export default {
  ASM,
  CPU,
  Paper,
  WASM,
};