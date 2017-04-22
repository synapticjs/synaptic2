export declare enum ActivationTypes {
    LOGISTIC_SIGMOID = 0,
    TANH = 1,
    RELU = 2,
    MAX_POOLING = 3,
    DROPOUT = 4,
    IDENTITY = 5,
}
export declare enum StatusTypes {
    IDLE = 0,
    INIT = 1,
    REVERSE_INIT = 2,
    ACTIVATING = 3,
    PROPAGATING = 4,
    TRAINING = 5,
}
export default class Engine {
    state: {};
    weight: {};
    gain: {};
    activation: {};
    derivative: {};
    elegibilityTrace: {};
    extendedElegibilityTrace: {};
    errorResponsibility: {};
    projectedErrorResponsibility: {};
    gatedErrorResponsibility: {};
    activationFunction: {};
    inputsOf: {};
    projectedBy: {};
    gatersOf: {};
    gatedBy: {};
    inputsOfGatedBy: {};
    projectionSet: {};
    gateSet: {};
    inputSet: {};
    derivativeTerm: {};
    connections: any[];
    gates: any[];
    learningRate: number;
    layers: number[][];
    size: number;
    random: any;
    biasUnit: any;
    status: StatusTypes;
    constructor({bias, generator}?: {
        bias: boolean;
        generator: () => number;
    });
    addUnit(activationFunction?: ActivationTypes): number;
    addConnection(from: number, to: number, weight?: number): void;
    addGate(from: number, to: number, gater: number): void;
    addLayer(size?: number, activationFunction?: any): number[];
    track(unit: any): void;
    toJSON(): string;
    clone(): Engine;
    static fromJSON(json: any): Engine;
    clear(): void;
}
