import Network, { Boundary, Layer } from '../Network';
export default class MaxPool3D implements Layer {
    downsampling: number;
    gater: number[];
    layer: number[];
    constructor(downsampling?: number);
    init(network: Network, boundary: Boundary): Boundary;
    isValid(boundary: any, x: any, y: any, z: any): boolean;
}
