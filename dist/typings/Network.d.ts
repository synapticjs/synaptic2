import Engine, { ActivationTypes } from './Engine';
import Backend from './backends/Paper';
export interface IBoundary {
    width: number;
    height: number;
    depth: number;
    layer: number[];
}
export default class Network {
    engine: Engine;
    backend: Backend;
    constructor(...layers: any[]);
    constructor(options: any);
    addUnit(activationFunction?: ActivationTypes): number;
    addConnection(from: number, to: number, weight?: number): void;
    addGate(from: any, to: any, gater: any): void;
    addLayer(width?: number, height?: number, depth?: number): number[];
    getLayers(): any[];
    toJSON(): string;
    clone(): Network;
    activate(input: any): any;
    propagate(target: any): void;
    static fromJSON(json: any): Network;
}
