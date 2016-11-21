import Engine from '../Engine';
export default class Paper {
    engine: Engine;
    constructor(engine?: Engine);
    activateUnit(unit: any, input: any): any;
    propagateUnit(unit: any, target: any): void;
    bigParenthesisTerm(k: any, j: any): any;
    activationFunction(unit: any): any;
    activationFunctionDerivative(unit: any): number;
    costFunction(target: any, predicted: any, costType: any): number;
    activate(inputs: any): any;
    propagate(targets: any): void;
    train(dataset: Array<{
        input: any;
        output: any;
    }>, {learningRate, minError, maxIterations, costFunction}: {
        learningRate: any;
        minError: any;
        maxIterations: any;
        costFunction: any;
    }): Promise<{}>;
}
