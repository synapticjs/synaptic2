import Engine, { ActivationTypes } from './Engine';
import Backend from './backends/CPU';
export interface Boundary {
    width: number;
    height: number;
    depth: number;
    layer: number[];
}
export interface Layer {
    layer?: number[];
    init?(network: Network, boundary: Boundary): Boundary;
    reverseInit?(network: Network, boundary: Boundary): any;
}
export default class Network {
    engine: Engine;
    backend: Backend;
    constructor(...layers: Layer[]);
    constructor(options: {
        backend?: Backend;
        engine?: Engine;
        bias?: boolean;
        generator?: any;
        layers?: Layer[];
    });
    addUnit(activationFunction?: ActivationTypes): number;
    addConnection(from: number, to: number, weight?: number): void;
    addGate(from: any, to: any, gater: any): void;
    addLayer(width?: number, height?: number, depth?: number): number[];
    getLayers(): number[][];
    toJSON(): string;
    clone(): Network;
    activate(input: any): number[];
    propagate(target: any): void;
    static fromJSON(json: any): Network;
}
