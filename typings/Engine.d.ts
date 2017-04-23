export interface Dictionary<T> {
    [key: string]: T;
}
export interface Connection {
    to: number;
    from: number;
}
export interface Gate {
    to: number;
    from: number;
    gater: number;
}
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
    state: Dictionary<number>;
    weight: Dictionary<Dictionary<number>>;
    gain: Dictionary<Dictionary<number>>;
    activation: Dictionary<number>;
    derivative: Dictionary<number>;
    elegibilityTrace: Dictionary<Dictionary<number>>;
    extendedElegibilityTrace: Dictionary<Dictionary<Dictionary<number>>>;
    errorResponsibility: Dictionary<number>;
    projectedErrorResponsibility: Dictionary<number>;
    gatedErrorResponsibility: Dictionary<number>;
    activationFunction: Dictionary<number>;
    inputsOf: Dictionary<number[]>;
    projectedBy: Dictionary<number[]>;
    gatersOf: Dictionary<number[]>;
    gatedBy: Dictionary<number[]>;
    inputsOfGatedBy: Dictionary<Dictionary<number[]>>;
    projectionSet: Dictionary<number[]>;
    gateSet: Dictionary<number[]>;
    inputSet: Dictionary<number[]>;
    derivativeTerm: Dictionary<Dictionary<number>>;
    connections: Connection[];
    gates: Gate[];
    learningRate: number;
    layers: number[][];
    size: number;
    random: Function;
    biasUnit: number;
    status: StatusTypes;
    constructor({bias, generator}?: {
        bias?: boolean;
        generator?: () => number;
    });
    addUnit(activationFunction?: ActivationTypes): number;
    addConnection(from: number, to: number, weight?: number): void;
    addGate(from: number, to: number, gater: number): void;
    addLayer(size?: number, activationFunction?: ActivationTypes): number[];
    track(unit: any): void;
    toJSON(): string;
    clone(): Engine;
    static fromJSON(json: string | object): Engine;
    clear(): void;
}
