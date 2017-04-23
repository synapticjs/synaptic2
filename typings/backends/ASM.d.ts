import Engine from '../Engine';
import { CostTypes } from '../Trainer';
import { TrainEntry, Dictionary, Backend, TrainOptions, TrainResult } from '.';
export declare type Statement = Variable | string;
export declare type Variables = Dictionary<Variable>;
export declare class Variable {
    id: number;
    key: string;
    value: number;
    constructor(id: number, key: string, value: number);
}
export default class ASM implements Backend {
    engine: Engine;
    id: number;
    heap: ArrayBuffer;
    variables: Variables;
    activationStatements: Statement[][];
    propagationStatements: Statement[][];
    constructor(engine?: Engine);
    alloc(key: string, value: number): Variable;
    buildActivationStatement(...parts: Statement[]): void;
    buildPropagationStatement(...parts: Statement[]): void;
    buildActivateUnit(j: number, inputIndex?: number): void;
    propagateUnit(j: number, target?: number): void;
    costFunction(target: number[], predicted: number[], costType: CostTypes): number;
    activate(inputs: number[]): number[];
    propagate(targets: number[]): void;
    train(dataset: TrainEntry[], {learningRate, minError, maxIterations, costFunction}: TrainOptions): Promise<TrainResult>;
}
