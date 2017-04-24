// backends
import ASM from './ASM'
import BLAS from './BLAS'
import CPU from './CPU'
import GPU from './GPU'
import Paper from './Paper'
import WebWorker from './WebWorker'

import { CostTypes } from '../Trainer'

export default {
  ASM,
  BLAS,
  CPU,
  GPU,
  Paper,
  WebWorker
}

export interface Dictionary<T> {
  [key: string]: T
}

export interface TrainEntry {
  input: number[];
  output: number[];
}

export interface TrainOptions { 
  learningRate?: number,
  minError?: number, 
  maxIterations?: number, 
  costFunction?: CostTypes
}

export interface TrainResult {
  error: number,
  iterations: number,
  time: number
}

export interface Backend {
  activate: (inputs: number[]) => number[],
  propagate: (targets: number[]) => void,
  train: (dataset: TrainEntry[], options?: TrainOptions) => Promise<TrainResult>
}