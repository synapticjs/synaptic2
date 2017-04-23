import Engine from '../Engine';
import { CostTypes } from '../Trainer';
import { TrainEntry } from '.';
export default class Paper {
    engine: Engine;
    constructor(engine?: Engine);
    activateUnit(unit: number, input: number): number;
    propagateUnit(unit: number, target?: number): void;
    /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
    bigParenthesisTerm(k: number, j: number): number;
    activationFunction(unit: number): number;
    activationFunctionDerivative(unit: number): number;
    costFunction(target: number[], predicted: number[], costType: CostTypes): number;
    activate(inputs: number[]): number[];
    propagate(targets: number[]): void;
    train(dataset: TrainEntry[], {learningRate, minError, maxIterations, costFunction}: {
        learningRate: any;
        minError: any;
        maxIterations: any;
        costFunction: any;
    }): Promise<{}>;
}
