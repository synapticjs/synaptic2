import Network from './Network';
export declare const CostTypes: {
    MSE: number;
    CROSS_ENTROPY: number;
    BINARY: number;
};
export default class Trainer {
    network: Network;
    static CostTypes: {
        MSE: number;
        CROSS_ENTROPY: number;
        BINARY: number;
    };
    constructor(network: Network);
    train(dataset: any, {learningRate, minError, maxIterations, costFunction}?: any): Promise<{}>;
    test(dataset: any, options: any): void;
}
