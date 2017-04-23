import Network from './Network';
import { TrainResult, TrainOptions } from './backends';
export declare enum CostTypes {
    MEAN_SQUARE_ERROR = 0,
    CROSS_ENTROPY = 1,
    BINARY = 2,
}
export default class Trainer {
    network: Network;
    static CostTypes: typeof CostTypes;
    constructor(network: Network);
    train(dataset: any, {learningRate, minError, maxIterations, costFunction}: TrainOptions): Promise<TrainResult>;
    test(dataset: any, options: any): void;
}
