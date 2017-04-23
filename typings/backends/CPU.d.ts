import Engine from '../Engine';
import { CostTypes } from '../Trainer';
import { TrainEntry, Backend, TrainOptions, TrainResult } from '.';
export default class CPU implements Backend {
    engine: Engine;
    constructor(engine?: Engine);
    activateUnit(j: number): number;
    propagateUnit(j: number, target?: number): void;
    /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
    bigParenthesisTerm(k: number, j: number): number;
    activationFunction(unit: number): number;
    activationFunctionDerivative(unit: number): number;
    costFunction(target: number[], predicted: number[], costType: CostTypes): number;
    activate(inputs: number[]): number[];
    propagate(targets: number[]): void;
    train(dataset: TrainEntry[], {learningRate, minError, maxIterations, costFunction}: TrainOptions): Promise<TrainResult>;
}
