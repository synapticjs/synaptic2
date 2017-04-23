import ASM from './ASM';
import CPU from './CPU';
import Paper from './Paper';
import { CostTypes } from '../Trainer';
declare var _default: {
    ASM: typeof ASM;
    BLAS: {};
    CPU: typeof CPU;
    GPU: {};
    Paper: typeof Paper;
    WebWorker: {};
};
export default _default;
export interface Dictionary<T> {
    [key: string]: T;
}
export interface TrainEntry {
    input: number[];
    output: number[];
}
export interface TrainOptions {
    learningRate?: number;
    minError?: number;
    maxIterations?: number;
    costFunction?: CostTypes;
}
export interface TrainResult {
    error: number;
    iterations: number;
    time: number;
}
export interface Backend {
    activate: (inputs: number[]) => number[];
    propagate: (targets: number[]) => void;
    train: (dataset: TrainEntry[], options?: TrainOptions) => Promise<TrainResult>;
}
