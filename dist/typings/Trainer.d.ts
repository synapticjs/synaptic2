import Network from './Network';
export declare enum CostTypes {
    MSE = 0,
    CROSS_ENTROPY = 1,
    BINARY = 2,
}
export default class Trainer {
    network: Network;
    constructor(network: Network);
    train(dataset: any, {learningRate, minError, maxIterations, costFunction}?: any): Promise<{}>;
    test(dataset: any, options: any): void;
}
