import Network, { BoundaryType } from '../Network';
export default class Convolution {
    filter: number;
    height: number;
    depth: number;
    stride: number;
    padding: number;
    layer: number[];
    constructor({filter, height, depth, stride, padding}: {
        filter?: number;
        height?: number;
        depth?: number;
        stride?: number;
        padding?: number;
    });
    init(network: Network, boundary: BoundaryType): {
        width: number;
        height: number;
        depth: number;
        layer: number[];
    };
    isValid(boundary: any, x: any, y: any, z: any): boolean;
}
