import Engine from '../Engine';
import { CostTypes } from '../Trainer';
export default class ASM {
    engine: Engine;
    activateFn: Function;
    heap: Float32Array;
    variables: any;
    statements: any[];
    constructor(engine?: Engine);
    alloc(id: string, value: number): any;
    buildStatement(...parts: any[]): void;
    buildActivateUnit(j: number, inputIndex?: number): void;
    propagateUnit(j: number, target?: number): void;
    /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
    bigParenthesisTerm(k: number, j: number): number;
    activationFunction(unit: number): number;
    activationFunctionDerivative(unit: number): number;
    costFunction(target: number[], predicted: number[], costType: CostTypes): number;
    activate(inputs: number[]): number[];
    propagate(targets: number[]): void;
    train(dataset: Array<{
        input: number[];
        output: number[];
    }>, {learningRate, minError, maxIterations, costFunction}: {
        learningRate: any;
        minError: any;
        maxIterations: any;
        costFunction: any;
    }): Promise<{}>;
}
