import Network, { Boundary, Layer } from '../Network';
export default class Convolution2D implements Layer {
    filter: number;
    depth: number;
    stride: number;
    padding: number;
    layer: number[];
    constructor({filter, depth, stride, padding}: {
        filter?: number;
        depth?: number;
        stride?: number;
        padding?: number;
    });
    init(network: Network, boundary: Boundary): Boundary;
    isValid(boundary: any, x: any, y: any, z: any): boolean;
}
